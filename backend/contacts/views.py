from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from django.db import models
from accounts.permissions import IsAdmin
from .models import ContactSubmission
from .serializers import ContactSubmissionSerializer, ContactSubmissionAdminSerializer


class ContactSubmissionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactSubmissionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Thank you for your message! We will get back to you soon."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for admin to manage contact submissions"""
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionAdminSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by is_contacted status
        is_contacted = self.request.query_params.get('is_contacted')
        if is_contacted is not None:
            queryset = queryset.filter(is_contacted=is_contacted.lower() == 'true')
        
        # Search by name or email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) | 
                models.Q(email__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_contacted(self, request, pk=None):
        """Mark a contact submission as contacted"""
        contact = self.get_object()
        contact.is_contacted = True
        contact.save()
        serializer = self.get_serializer(contact)
        return Response({
            'message': 'Contact marked as contacted',
            'contact': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def mark_uncontacted(self, request, pk=None):
        """Mark a contact submission as not contacted"""
        contact = self.get_object()
        contact.is_contacted = False
        contact.save()
        serializer = self.get_serializer(contact)
        return Response({
            'message': 'Contact marked as not contacted',
            'contact': serializer.data
        })
