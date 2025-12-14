# orders/estimation_views.py
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.utils import timezone

from .estimation_models import Estimation, Invoice
from .models import Order
from .estimation_serializers import (
    EstimationSerializer, EstimationCreateSerializer,
    InvoiceSerializer, InvoiceGenerateSerializer
)
from .pdf_generators import EstimationPDFGenerator, InvoicePDFGenerator
from notifications.models import Notification


class EstimationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Estimation CRUD operations
    """
    serializer_class = EstimationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter estimations based on user role"""
        user = self.request.user
        if user.role in ['admin', 'service_head']:
            return Estimation.objects.all()
        else:
            # Clients can only see estimations for their orders
            return Estimation.objects.filter(order__client=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EstimationCreateSerializer
        return EstimationSerializer
    
    def perform_create(self, serializer):
        """Create estimation with creator"""
        serializer.save(created_by=self.request.user)


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Invoice CRUD operations
    """
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter invoices based on user role"""
        user = self.request.user
        if user.role in ['admin', 'service_head']:
            return Invoice.objects.all()
        else:
            # Clients can only see invoices for their orders
            return Invoice.objects.filter(order__client=user)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_estimations(request, order_id):
    """
    List or create estimations for an order
    GET/POST /api/orders/<order_id>/estimations/
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and order.client != user:
            return Response(
                {'error': 'You do not have permission to access this order'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'GET':
            # List estimations
            estimations = Estimation.objects.filter(order=order).order_by('-created_at')
            serializer = EstimationSerializer(estimations, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create estimation (admin/service_head only)
            if user.role not in ['admin', 'service_head']:
                return Response(
                    {'error': 'Only admins and service heads can create estimations'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            data = request.data.copy()
            data['order'] = order.id
            
            serializer = EstimationCreateSerializer(
                data=data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                estimation = serializer.save()
                return Response(
                    EstimationSerializer(estimation).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_estimation_pdf(request, estimation_id):
    """
    Generate PDF for estimation
    POST /api/estimations/<estimation_id>/generate-pdf/
    """
    try:
        estimation = Estimation.objects.get(id=estimation_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'Only admins and service heads can generate PDFs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate and upload PDF
        pdf_generator = EstimationPDFGenerator(estimation)
        result = pdf_generator.upload_to_cloudinary()
        
        return Response({
            'success': True,
            'message': 'PDF generated successfully',
            'pdf_url': result['url'],
            'pdf_public_id': result['public_id']
        })
    
    except Estimation.DoesNotExist:
        return Response(
            {'error': 'Estimation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_estimation(request, estimation_id):
    """
    Send estimation to client
    POST /api/estimations/<estimation_id>/send/
    """
    try:
        estimation = Estimation.objects.get(id=estimation_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'Only admins and service heads can send estimations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate PDF if not already generated
        if not estimation.pdf_url:
            pdf_generator = EstimationPDFGenerator(estimation)
            pdf_generator.upload_to_cloudinary()
        
        # Update status
        estimation.status = 'sent'
        estimation.sent_at = timezone.now()
        estimation.save()
        
        # Create notification for client
        if estimation.order.client:
            Notification.objects.create(
                user=estimation.order.client,
                title="New Estimation Received",
                message=f"You have received an estimation for Order #{estimation.order.id}: {estimation.title}",
                notification_type="estimation_received",
                link=f"/dashboard/orders/{estimation.order.id}/estimations/{estimation.id}"
            )
        
        return Response({
            'success': True,
            'message': 'Estimation sent to client successfully',
            'estimation': EstimationSerializer(estimation).data
        })
    
    except Estimation.DoesNotExist:
        return Response(
            {'error': 'Estimation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_invoice(request, order_id):
    """
    Generate invoice for an order
    POST /api/orders/<order_id>/invoices/generate/
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'Only admins and service heads can generate invoices'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate and create invoice
        data = request.data.copy()
        data['order_id'] = order.id
        
        serializer = InvoiceGenerateSerializer(data=data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create invoice
        invoice_data = serializer.validated_data
        invoice = Invoice.objects.create(
            order=order,
            estimation_id=invoice_data.get('estimation_id'),
            title=invoice_data['title'],
            line_items=invoice_data['line_items'],
            tax_percentage=invoice_data.get('tax_percentage', 0),
            discount_amount=invoice_data.get('discount_amount', 0),
            due_date=invoice_data.get('due_date'),
            notes=invoice_data.get('notes', ''),
            terms_and_conditions=invoice_data.get('terms_and_conditions', ''),
            created_by=user,
            status='draft'
        )
        
        # Generate PDF
        pdf_generator = InvoicePDFGenerator(invoice)
        pdf_generator.upload_to_cloudinary()
        
        # Send notification to client
        if order.client:
            Notification.objects.create(
                user=order.client,
                title="Invoice Generated",
                message=f"Invoice {invoice.invoice_number} has been generated for Order #{order.id}",
                notification_type="invoice_generated",
                link=f"/dashboard/orders/{order.id}/invoices/{invoice.id}"
            )
        
        return Response({
            'success': True,
            'message': 'Invoice generated successfully',
            'invoice': InvoiceSerializer(invoice).data
        }, status=status.HTTP_201_CREATED)
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, invoice_id):
    """
    Download invoice PDF
    GET /api/invoices/<invoice_id>/download/
    """
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and invoice.order.client != user:
            return Response(
                {'error': 'You do not have permission to download this invoice'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate PDF if not exists
        if not invoice.pdf_url:
            pdf_generator = InvoicePDFGenerator(invoice)
            pdf_generator.upload_to_cloudinary()
        
        # Return PDF URL for download
        return Response({
            'pdf_url': invoice.pdf_url,
            'invoice_number': invoice.invoice_number
        })
    
    except Invoice.DoesNotExist:
        return Response(
            {'error': 'Invoice not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
