# orders/estimation_views.py
from rest_framework import status, viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
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
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['order', 'status']
    ordering_fields = ['created_at', 'invoice_date', 'due_date']
    ordering = ['-created_at']
    
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
            
            serializer = EstimationCreateSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                estimation = serializer.save(created_by=user)
                
                # Generate PDF is handled downstream but we can wrap it here too just in case
                # The serializer.save() triggers signal or logic or explicit call?
                # In the original code, PDF generation was explicit here:
                
                # Generate PDF
                try:
                    pdf_generator = EstimationPDFGenerator(estimation)
                    pdf_generator.upload_to_dropbox()
                except Exception as e:
                    # Log but don't fail the request
                    print(f"PDF generation failed: {e}")
                
                return Response(EstimationSerializer(estimation).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': 'Internal server error', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_estimation_pdf(request, estimation_id):
    """
    Generate PDF for estimation
    POST /api/estimations/<estimation_id>/generate-pdf/
    """
    import traceback
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Attempting to generate PDF for estimation {estimation_id}")
        estimation = Estimation.objects.get(id=estimation_id)
        logger.info(f"Found estimation: {estimation.title}")
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'Only admins and service heads can generate PDFs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate and upload PDF
        try:
            logger.info("Creating PDF generator...")
            pdf_generator = EstimationPDFGenerator(estimation)
            
            logger.info("Uploading to Cloudinary...")
            result = pdf_generator.upload_to_dropbox()
            
            # Save PDF URL and file path to estimation
            estimation.pdf_url = result['download_url']
            estimation.pdf_file_path = result['file_path']
            estimation.save(update_fields=['pdf_url', 'pdf_file_path'])
            
            logger.info(f"PDF generated successfully: {result['download_url']}")
            return Response({
                'success': True,
                'message': 'PDF generated successfully',
                'pdf_url': result['download_url'],
                'pdf_file_path': result['file_path']
            })
        except RuntimeError as e:
            # WeasyPrint not available
            logger.error(f"WeasyPrint RuntimeError: {str(e)}")
            return Response(
                {
                    'error': 'PDF generation is not available',
                    'message': str(e),
                    'details': 'WeasyPrint requires GTK+ libraries to be installed on Windows'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            # Log the full traceback
            logger.error(f"Error generating PDF: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {
                    'error': 'Failed to generate PDF',
                    'message': str(e),
                    'traceback': traceback.format_exc()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Estimation.DoesNotExist:
        return Response(
            {'error': 'Estimation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {
                'error': str(e),
                'traceback': traceback.format_exc()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_estimation(request, estimation_id):
    """
    Send estimation to client
    POST /api/estimations/<estimation_id>/send/
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        estimation = Estimation.objects.get(id=estimation_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'Only admins and service heads can send estimations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Try to generate PDF if not already generated (optional - won't block if it fails)
        if not estimation.pdf_url:
            try:
                logger.info(f"Attempting to generate PDF for estimation {estimation_id}")
                pdf_generator = EstimationPDFGenerator(estimation)
                pdf_generator.upload_to_dropbox()
                logger.info("PDF generated successfully")
            except Exception as e:
                # Log the error but don't block sending
                logger.warning(f"PDF generation failed, but continuing to send estimation: {str(e)}")
        
        # Update status to sent
        estimation.status = 'sent'
        estimation.sent_at = timezone.now()
        estimation.save()
        
        # Create notification for client
        if estimation.order.client:
            Notification.objects.create(
                user=estimation.order.client,
                title="New Estimation Received",
                message=f"You have received an estimation for Order #{estimation.order.id}: {estimation.title}",
                notification_type="estimation_received"
            )
        
        return Response({
            'success': True,
            'message': 'Estimation sent to client successfully' + (' (PDF generation failed - will be available later)' if not estimation.pdf_url else ''),
            'estimation': EstimationSerializer(estimation).data,
            'pdf_generated': bool(estimation.pdf_url)
        })
    
    except Estimation.DoesNotExist:
        return Response(
            {'error': 'Estimation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error sending estimation: {str(e)}")
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
    import logging
    import traceback
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Invoice generation request for order {order_id} from user {request.user.id}")
        logger.info(f"Request data: {request.data}")
        
        order = Order.objects.get(id=order_id)
        logger.info(f"Found order: {order.title}")
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            logger.warning(f"Unauthorized invoice generation attempt by user {user.id} with role {user.role}")
            return Response(
                {'error': 'Only admins and service heads can generate invoices'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate and create invoice
        data = request.data.copy()
        data['order_id'] = order.id
        
        logger.info(f"Validating invoice data with serializer")
        serializer = InvoiceGenerateSerializer(data=data)
        
        if not serializer.is_valid():
            logger.error(f"Invoice validation failed: {serializer.errors}")
            logger.error(f"Request data: {request.data}")
            return Response(
                {
                    'error': 'Validation failed',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create invoice
        logger.info("Creating invoice object")
        invoice_data = serializer.validated_data
        try:
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
                referral_policies=invoice_data.get('referral_policies', ''),
                # Sender details
                department_head_name=invoice_data.get('department_head_name', ''),
                department_head_email=invoice_data.get('department_head_email', ''),
                department_head_phone=invoice_data.get('department_head_phone', ''),
                # Client details
                client_name=invoice_data.get('client_name', ''),
                client_email=invoice_data.get('client_email', ''),
                client_phone=invoice_data.get('client_phone', ''),
                client_address=invoice_data.get('client_address', ''),
                # Signature details
                chairperson_name=invoice_data.get('chairperson_name', ''),
                vice_chairperson_name=invoice_data.get('vice_chairperson_name', ''),
                created_by=user,
                status='draft'
            )
            logger.info(f"Invoice created successfully: {invoice.invoice_number}")
        except Exception as e:
            logger.error(f"Failed to create invoice object: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Failed to create invoice',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Generate PDF
        try:
            logger.info(f"Generating PDF for invoice {invoice.invoice_number}")
            pdf_generator = InvoicePDFGenerator(invoice)
            result = pdf_generator.upload_to_dropbox()
            
            # Save PDF URL and file path to invoice
            invoice.pdf_url = result.get('download_url')
            invoice.pdf_file_path = result.get('file_path')
            invoice.save(update_fields=['pdf_url', 'pdf_file_path'])
            
            logger.info(f"PDF generated and saved successfully: {result.get('download_url')}")
        except Exception as e:
            logger.error(f"PDF generation failed for invoice {invoice.invoice_number}: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Don't fail the entire request if PDF generation fails
            logger.warning("Continuing without PDF - invoice created but PDF generation failed")
        
        # Send notification to client
        try:
            if order.client:
                Notification.objects.create(
                    user=order.client,
                    title="Invoice Generated",
                    message=f"Invoice {invoice.invoice_number} has been generated for Order #{order.id}",
                    notification_type="invoice_generated"
                )
                logger.info(f"Notification sent to client {order.client.id}")
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
            # Don't fail the request if notification fails
        
        logger.info(f"Invoice generation completed successfully for order {order_id}")
        return Response({
            'success': True,
            'message': 'Invoice generated successfully',
            'invoice': InvoiceSerializer(invoice).data
        }, status=status.HTTP_201_CREATED)
    
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found")
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Unexpected error in invoice generation: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response(
            {
                'error': 'Failed to generate invoice',
                'details': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, invoice_id):
    """
    Download invoice PDF
    GET /api/invoices/<invoice_id>/download/
    """
    import logging
    import traceback
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Invoice download request for invoice {invoice_id} from user {request.user.id}")
        
        invoice = Invoice.objects.get(id=invoice_id)
        logger.info(f"Found invoice: {invoice.invoice_number}")
        
        # Check permissions
        user = request.user
        if user.role == 'client' and invoice.order.client != user:
            logger.warning(f"Unauthorized invoice download attempt by user {user.id}")
            return Response(
                {'error': 'You do not have permission to download this invoice'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate PDF if not exists
        if not invoice.pdf_url:
            logger.info(f"PDF not found for invoice {invoice.invoice_number}, generating now")
            try:
                pdf_generator = InvoicePDFGenerator(invoice)
                result = pdf_generator.upload_to_dropbox()
                logger.info(f"PDF generated successfully: {result.get('download_url')}")
            except Exception as e:
                logger.error(f"Failed to generate PDF for invoice {invoice.invoice_number}: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                return Response(
                    {
                        'error': 'Failed to generate PDF',
                        'details': str(e)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Return PDF URL for download
        logger.info(f"Returning PDF URL for invoice {invoice.invoice_number}")
        return Response({
            'pdf_url': invoice.pdf_url,
            'invoice_number': invoice.invoice_number
        })
    
    except Invoice.DoesNotExist:
        logger.error(f"Invoice {invoice_id} not found")
        return Response(
            {'error': 'Invoice not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Unexpected error in invoice download: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response(
            {
                'error': 'Failed to download invoice',
                'details': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_invoice_pdf(request, invoice_id):
    """
    Generate PDF for an existing invoice
    POST /api/invoices/<invoice_id>/generate-pdf/
    """
    import logging
    import traceback
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Attempting to generate PDF for invoice {invoice_id}")
        invoice = Invoice.objects.get(id=invoice_id)
        logger.info(f"Found invoice: {invoice.invoice_number}")
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            logger.warning(f"Unauthorized PDF generation attempt by user {user.id}")
            return Response(
                {'error': 'Only admins and service heads can generate PDFs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate and upload PDF
        try:
            logger.info(f"Creating PDF generator for invoice {invoice.invoice_number}")
            pdf_generator = InvoicePDFGenerator(invoice)
            
            logger.info("Uploading to Dropbox...")
            result = pdf_generator.upload_to_dropbox()
            
            # Save PDF URL and file path to invoice
            invoice.pdf_url = result.get('download_url')
            invoice.pdf_file_path = result.get('file_path')
            invoice.save(update_fields=['pdf_url', 'pdf_file_path'])
            
            logger.info(f"PDF generated and saved successfully: {result.get('download_url')}")
            return Response({
                'success': True,
                'message': 'PDF generated successfully',
                'pdf_url': result.get('download_url'),
                'pdf_file_path': result.get('file_path')
            })
        except RuntimeError as e:
            # WeasyPrint not available
            logger.error(f"WeasyPrint RuntimeError: {str(e)}")
            return Response(
                {
                    'error': 'PDF generation is not available',
                    'message': str(e),
                    'details': 'WeasyPrint requires GTK+ libraries to be installed on Windows'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            # Log the full traceback
            logger.error(f"Error generating PDF: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {
                    'error': 'Failed to generate PDF',
                    'message': str(e),
                    'traceback': traceback.format_exc()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Invoice.DoesNotExist:
        logger.error(f"Invoice {invoice_id} not found")
        return Response(
            {'error': 'Invoice not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {
                'error': str(e),
                'traceback': traceback.format_exc()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
