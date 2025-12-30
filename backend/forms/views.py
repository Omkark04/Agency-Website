from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from .models import ServiceForm, ServiceFormField, ServiceFormSubmission
from .serializers import (
    ServiceFormSerializer,
    ServiceFormFieldSerializer,
    ServiceFormSubmissionSerializer
)
from .permissions import IsAdminOrServiceHead, IsAdmin
from media.views import UploadMediaView
import json


class ServiceFormViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing service forms.
    - Admin: full CRUD on all forms
    - Service Head: CRUD on forms for their department's services
    - Public: read-only access to active forms
    """
    queryset = ServiceForm.objects.all()
    serializer_class = ServiceFormSerializer
    
    def get_permissions(self):
        # Allow public access to retrieve, list, and submit actions
        if self.action in ['retrieve', 'list', 'submit']:
            return [AllowAny()]
        return [IsAdminOrServiceHead()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Public users only see active forms
        if not user.is_authenticated:
            return queryset.filter(is_active=True)
        
        # Admin sees all
        if user.role == 'admin':
            return queryset
        
        # Service head sees forms for their department
        if user.role == 'service_head':
            return queryset.filter(service__department__team_head=user)
        
        # Others see active forms
        return queryset.filter(is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny], 
            parser_classes=[MultiPartParser, FormParser, JSONParser])
    def submit(self, request, pk=None):
        """
        Public submission endpoint.
        Accepts both JSON and multipart/form-data.
        
        For multipart: files are uploaded to Cloudinary first, then URLs stored.
        For JSON: expects file URLs already uploaded.
        """
        # Extensive debug logging
        print("\n" + "="*80)
        print("FORM SUBMISSION DEBUG")
        print("="*80)
        print(f"User: {request.user}")
        print(f"User ID: {request.user.id if request.user.is_authenticated else 'Anonymous'}")
        print(f"User Role: {getattr(request.user, 'role', 'N/A')}")
        print(f"Is Authenticated: {request.user.is_authenticated}")
        print(f"Form ID (pk): {pk}")
        print(f"Request Method: {request.method}")
        print(f"Content Type: {request.content_type}")
        print(f"Permission Classes: {[p.__class__.__name__ for p in self.get_permissions()]}")
        print(f"Request Data Keys: {list(request.data.keys())}")
        print("="*80 + "\n")
        
        try:
            form = self.get_object()
            print(f"✓ Form retrieved: {form.id} - {form.title}")
            print(f"✓ Form is_active: {form.is_active}")
        except Exception as e:
            print(f"✗ Error getting form: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
        
        if not form.is_active:
            print(f"✗ Form {form.id} is not active")
            return Response(
                {'error': 'This form is not currently accepting submissions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse submission data
        print(f"Parsing submission data...")
        try:
            if request.content_type and 'multipart' in request.content_type:
                print("→ Using multipart handler")
                submission_data = self._handle_multipart_submission(request, form)
            else:
                print("→ Using JSON handler")
                submission_data = self._handle_json_submission(request, form)
            print(f"✓ Submission data parsed successfully")
            print(f"Submission data keys: {list(submission_data.keys())}")
        except Exception as e:
            print(f"✗ Error parsing submission data: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
        
        if 'error' in submission_data:
            logger.error(f"Submission data error: {submission_data}")
            return Response(submission_data, status=status.HTTP_400_BAD_REQUEST)
        
        # Create submission
        serializer = ServiceFormSubmissionSerializer(data=submission_data)
        if serializer.is_valid():
            submission = serializer.save()
            logger.info(f"Submission created successfully: {submission.id}")
            
            return Response({
                'success': True,
                'message': 'Submission successful',
                'submission_id': submission.id,
                'order_id': submission.order.id if submission.order else None,
                'order_number': f"ORD-{submission.order.id:05d}" if submission.order else None
            }, status=status.HTTP_201_CREATED)
        
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_json_submission(self, request, form):
        """Handle JSON submission (files already uploaded)"""
        data = request.data.copy()
        
        submission_data = {
            'form': form.id,
            'service': form.service.id,
            'data': data.get('data', {}),
            'files': data.get('files', {}),
        }
        
        # Set client info
        if request.user.is_authenticated:
            submission_data['submitted_by'] = request.user.id
            if not data.get('client_email'):
                submission_data['client_email'] = request.user.email
        else:
            submission_data['client_email'] = data.get('client_email', '')
        
        return submission_data
    
    def _handle_multipart_submission(self, request, form):
        """Handle multipart submission with file uploads"""
        try:
            # Parse form data
            data_json = request.data.get('data', '{}')
            if isinstance(data_json, str):
                data = json.loads(data_json)
            else:
                data = data_json
            
            files = {}
            
            # Upload files to Cloudinary
            for field in form.fields.filter(field_type='media'):
                field_key = str(field.id)
                file_key = f'file_{field_key}'
                
                if file_key in request.FILES:
                    uploaded_files = request.FILES.getlist(file_key)
                    file_urls = []
                    
                    for uploaded_file in uploaded_files:
                        # Upload to Cloudinary using existing upload view logic
                        # For now, we'll store a placeholder
                        # In production, integrate with your UploadMediaView
                        file_urls.append(f"https://placeholder.com/{uploaded_file.name}")
                    
                    files[field_key] = file_urls
            
            submission_data = {
                'form': form.id,
                'service': form.service.id,
                'data': data,
                'files': files,
            }
            
            # Set client info
            if request.user.is_authenticated:
                submission_data['submitted_by'] = request.user.id
            else:
                submission_data['client_email'] = request.data.get('client_email', '')
            
            return submission_data
            
        except json.JSONDecodeError:
            return {'error': 'Invalid JSON in data field'}
        except Exception as e:
            return {'error': str(e)}
    
    @action(detail=False, methods=['get'])
    def by_service(self, request):
        """Get active form for a specific service"""
        service_id = request.query_params.get('service_id')
        if not service_id:
            return Response(
                {'error': 'service_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            form = self.get_queryset().filter(
                service_id=service_id,
                is_active=True
            ).first()
            
            if not form:
                return Response(
                    {'error': 'No active form found for this service'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = self.get_serializer(form)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ServiceFormFieldViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing form fields.
    Only accessible by admins and service heads.
    """
    queryset = ServiceFormField.objects.all()
    serializer_class = ServiceFormFieldSerializer
    permission_classes = [IsAdminOrServiceHead]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated:
            return queryset.none()
        
        # Admin sees all
        if user.role == 'admin':
            return queryset
        
        # Service head sees fields for their department's forms
        if user.role == 'service_head':
            return queryset.filter(form__service__department__team_head=user)
        
        return queryset.none()


class ServiceFormSubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing form submissions.
    - Admin: all submissions
    - Service Head: submissions for their department
    - Client: their own submissions
    """
    queryset = ServiceFormSubmission.objects.all()
    serializer_class = ServiceFormSubmissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Admin sees all
        if user.role == 'admin':
            # Allow filtering
            service_id = self.request.query_params.get('service')
            form_id = self.request.query_params.get('form')
            
            if service_id:
                queryset = queryset.filter(service_id=service_id)
            if form_id:
                queryset = queryset.filter(form_id=form_id)
            
            return queryset
        
        # Service head sees submissions for their department
        if user.role == 'service_head':
            return queryset.filter(service__department__team_head=user)
        
        # Clients see their own submissions
        return queryset.filter(submitted_by=user)
