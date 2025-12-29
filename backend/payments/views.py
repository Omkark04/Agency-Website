# payments/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import json

from .models import PaymentRequest, PaymentOrder, Transaction, WebhookLog
from .serializers import (
    PaymentRequestSerializer, PaymentRequestCreateSerializer,
    PaymentOrderSerializer, PaymentOrderCreateSerializer,
    TransactionSerializer, PaymentVerificationSerializer,
    WebhookLogSerializer
)
from .services import RazorpayService, PayPalService, PaymentProcessor
from orders.models import Order
from notifications.models import Notification


class PaymentOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PaymentOrder operations
    """
    serializer_class = PaymentOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter payment orders based on user role"""
        user = self.request.user
        if user.role == 'admin':
            return PaymentOrder.objects.all()
        elif user.role == 'service_head':
            # Service heads can see orders from their department
            return PaymentOrder.objects.filter(
                order__service__department__team_head=user
            )
        else:
            # Clients can only see their own payment orders
            return PaymentOrder.objects.filter(user=user)
    
    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """
        Create a new payment order
        POST /api/payments/create-order/
        """
        serializer = PaymentOrderCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order_id = serializer.validated_data['order_id']
        gateway = serializer.validated_data['gateway']
        currency = serializer.validated_data['currency']
        amount = serializer.validated_data.get('amount')  # Optional amount for partial payments
        
        try:
            order = Order.objects.get(id=order_id)
            
            # Use provided amount or fall back to full order price
            payment_amount = amount if amount is not None else order.price
            
            # Create payment order based on gateway
            if gateway == 'razorpay':
                razorpay_service = RazorpayService()
                payment_order = razorpay_service.create_order(
                    order=order,
                    amount=payment_amount,
                    currency=currency
                )
                
                # Return data for Razorpay checkout
                response_data = {
                    'payment_order_id': payment_order.id,
                    'gateway': 'razorpay',
                    'gateway_order_id': payment_order.gateway_order_id,
                    'amount': str(payment_order.amount),
                    'currency': payment_order.currency,
                    'razorpay_key': settings.RAZORPAY_KEY_ID,
                    'order_details': {
                        'id': order.id,
                        'title': order.title,
                        'description': order.details
                    },
                    'customer': {
                        'name': request.user.get_full_name() or request.user.email,
                        'email': request.user.email,
                        'contact': request.user.phone or ''
                    }
                }
            
            elif gateway == 'paypal':
                paypal_service = PayPalService()
                payment_order = paypal_service.create_order(
                    order=order,
                    amount=payment_amount,
                    currency=currency
                )
                
                # Return data for PayPal checkout
                response_data = {
                    'payment_order_id': payment_order.id,
                    'gateway': 'paypal',
                    'gateway_order_id': payment_order.gateway_order_id,
                    'amount': str(payment_order.amount),
                    'currency': payment_order.currency,
                    'approval_url': payment_order.metadata.get('approval_url'),
                    'order_details': {
                        'id': order.id,
                        'title': order.title,
                        'description': order.details
                    }
                }
            
            else:
                return Response(
                    {'error': 'Invalid gateway'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_request(request):
    """
    Create a payment request and send email to client
    POST /api/payments/request-payment/
    
    Only admin and service heads can create payment requests
    """
    serializer = PaymentRequestCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        order_id = serializer.validated_data['order_id']
        amount = serializer.validated_data['amount']
        gateway = serializer.validated_data['gateway']
        currency = serializer.validated_data['currency']
        notes = serializer.validated_data.get('notes', '')
        
        order = Order.objects.get(id=order_id)
        
        # Create payment request
        payment_request = PaymentRequest.objects.create(
            order=order,
            requested_by=request.user,
            amount=amount,
            gateway=gateway,
            currency=currency,
            notes=notes
        )
        
        # Generate payment link
        payment_link = f"{settings.FRONTEND_URL}/payment/{payment_request.id}"
        payment_request.payment_link = payment_link
        payment_request.save()
        
        # Send email to client
        if order.client and order.client.email:
            try:
                gateway_display = "Razorpay" if gateway == "razorpay" else "PayPal"
                
                html_message = render_to_string('emails/payment_request.html', {
                    'client_name': order.client.get_full_name() or order.client.email,
                    'order_id': order.id,
                    'order_title': order.title,
                    'amount': amount,
                    'currency': currency,
                    'gateway_display': gateway_display,
                    'payment_link': payment_link,
                    'expires_at': payment_request.expires_at.strftime('%B %d, %Y'),
                    'notes': notes,
                    'requested_by': request.user.get_full_name() or request.user.email,
                    'company_email': settings.COMPANY_EMAIL,
                    'company_phone': getattr(settings, 'COMPANY_PHONE', ''),
                })
                
                plain_message = strip_tags(html_message)
                
                send_mail(
                    subject=f'Payment Request for Order #{order.id}',
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[order.client.email],
                    html_message=html_message,
                    fail_silently=True,
                )
            except Exception as email_error:
                # Log email error but don't fail the request
                print(f"Failed to send email: {email_error}")
        
        # Create dashboard notification
        if order.client:
            Notification.objects.create(
                user=order.client,
                title="Payment Request Received",
                message=f"You have a payment request of {currency} {amount} for Order #{order.id}. Check your email for the payment link.",
                notification_type="payment_received",
                order=order
            )
        
        return Response({
            'success': True,
            'message': 'Payment request created and email sent successfully',
            'payment_request': PaymentRequestSerializer(payment_request).data
        }, status=status.HTTP_201_CREATED)
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Error creating payment request: {e}")
        print(traceback.format_exc())
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_payment_requests(request):
    """
    List payment requests based on user role
    GET /api/payments/requests/
    """
    user = request.user
    
    if user.role == 'admin':
        payment_requests = PaymentRequest.objects.all()
    elif user.role == 'service_head':
        # Service heads can see requests for their department's orders
        payment_requests = PaymentRequest.objects.filter(
            order__service__department__team_head=user
        )
    else:
        # Clients can see their own payment requests
        payment_requests = PaymentRequest.objects.filter(order__client=user)
    
    # Filter by status if provided
    status_filter = request.query_params.get('status')
    if status_filter:
        payment_requests = payment_requests.filter(status=status_filter)
    
    serializer = PaymentRequestSerializer(payment_requests, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    Verify payment after client-side completion
    POST /api/payments/verify/
    """
    serializer = PaymentVerificationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    gateway = serializer.validated_data['gateway']
    
    try:
        if gateway == 'razorpay':
            razorpay_order_id = serializer.validated_data['razorpay_order_id']
            razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
            razorpay_signature = serializer.validated_data['razorpay_signature']
            
            # Verify signature
            razorpay_service = RazorpayService()
            is_valid = razorpay_service.verify_signature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            )
            
            if not is_valid:
                return Response(
                    {'error': 'Invalid payment signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get payment order
            payment_order = PaymentOrder.objects.get(gateway_order_id=razorpay_order_id)
            
            # Fetch payment details from Razorpay
            payment_details = razorpay_service.fetch_payment(razorpay_payment_id)
            
            # Process successful payment
            transaction = PaymentProcessor.process_payment_success(
                payment_order=payment_order,
                transaction_data={
                    'transaction_id': razorpay_payment_id,
                    'signature': razorpay_signature,
                    'payment_method': payment_details.get('method', 'other'),
                    'gateway_response': payment_details
                }
            )
            
            return Response({
                'success': True,
                'message': 'Payment verified successfully',
                'transaction': TransactionSerializer(transaction).data
            })
        
        elif gateway == 'paypal':
            paypal_payment_id = serializer.validated_data['paypal_payment_id']
            paypal_payer_id = serializer.validated_data['paypal_payer_id']
            
            # Execute PayPal payment
            paypal_service = PayPalService()
            result = paypal_service.execute_payment(paypal_payment_id, paypal_payer_id)
            
            if not result['success']:
                return Response(
                    {'error': 'PayPal payment execution failed', 'details': result.get('error')},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get payment order
            payment_order = PaymentOrder.objects.get(gateway_order_id=paypal_payment_id)
            
            # Process successful payment
            transaction = PaymentProcessor.process_payment_success(
                payment_order=payment_order,
                transaction_data={
                    'transaction_id': paypal_payment_id,
                    'payment_method': 'paypal',
                    'gateway_response': result['payment']
                }
            )
            
            return Response({
                'success': True,
                'message': 'Payment verified successfully',
                'transaction': TransactionSerializer(transaction).data
            })
        
        else:
            return Response(
                {'error': 'Invalid gateway'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except PaymentOrder.DoesNotExist:
        return Response(
            {'error': 'Payment order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    """
    Handle Razorpay webhook events
    POST /api/payments/webhook/razorpay/
    """
    # Get webhook signature
    webhook_signature = request.headers.get('X-Razorpay-Signature', '')
    
    # Get raw body
    payload = request.body.decode('utf-8')
    
    # Create webhook log
    webhook_log = WebhookLog.objects.create(
        gateway='razorpay',
        event_type=request.data.get('event', 'unknown'),
        payload=request.data,
        headers=dict(request.headers),
        signature=webhook_signature,
        status='received'
    )
    
    try:
        # Verify webhook signature
        razorpay_service = RazorpayService()
        is_verified = razorpay_service.verify_webhook_signature(payload, webhook_signature)
        
        webhook_log.is_verified = is_verified
        webhook_log.status = 'processing'
        webhook_log.save()
        
        if not is_verified:
            webhook_log.status = 'failed'
            webhook_log.error_message = 'Invalid webhook signature'
            webhook_log.save()
            return Response({'status': 'invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process webhook event
        event = request.data.get('event')
        payload_data = request.data.get('payload', {})
        payment_entity = payload_data.get('payment', {}).get('entity', {})
        
        if event == 'payment.captured':
            # Payment successful
            payment_id = payment_entity.get('id')
            order_id = payment_entity.get('order_id')
            
            try:
                payment_order = PaymentOrder.objects.get(gateway_order_id=order_id)
                
                # Process payment success
                transaction = PaymentProcessor.process_payment_success(
                    payment_order=payment_order,
                    transaction_data={
                        'transaction_id': payment_id,
                        'payment_method': payment_entity.get('method', 'other'),
                        'gateway_response': payment_entity
                    }
                )
                
                webhook_log.transaction = transaction
                webhook_log.status = 'processed'
                webhook_log.save()
            
            except PaymentOrder.DoesNotExist:
                webhook_log.status = 'ignored'
                webhook_log.error_message = 'Payment order not found'
                webhook_log.save()
        
        elif event == 'payment.failed':
            # Payment failed
            payment_id = payment_entity.get('id')
            order_id = payment_entity.get('order_id')
            
            try:
                payment_order = PaymentOrder.objects.get(gateway_order_id=order_id)
                
                # Process payment failure
                PaymentProcessor.process_payment_failure(
                    payment_order=payment_order,
                    error_data={
                        'transaction_id': payment_id,
                        'error_code': payment_entity.get('error_code', ''),
                        'error_message': payment_entity.get('error_description', 'Payment failed'),
                        'gateway_response': payment_entity
                    }
                )
                
                webhook_log.status = 'processed'
                webhook_log.save()
            
            except PaymentOrder.DoesNotExist:
                webhook_log.status = 'ignored'
                webhook_log.error_message = 'Payment order not found'
                webhook_log.save()
        
        else:
            webhook_log.status = 'ignored'
            webhook_log.error_message = f'Unhandled event type: {event}'
            webhook_log.save()
        
        return Response({'status': 'success'})
    
    except Exception as e:
        webhook_log.status = 'failed'
        webhook_log.error_message = str(e)
        webhook_log.save()
        return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def paypal_webhook(request):
    """
    Handle PayPal webhook events
    POST /api/payments/webhook/paypal/
    """
    # Create webhook log
    webhook_log = WebhookLog.objects.create(
        gateway='paypal',
        event_type=request.data.get('event_type', 'unknown'),
        payload=request.data,
        headers=dict(request.headers),
        status='received'
    )
    
    try:
        # For production, implement proper PayPal webhook verification
        # using PayPal's webhook verification API
        
        webhook_log.status = 'processing'
        webhook_log.save()
        
        # Process webhook event
        event_type = request.data.get('event_type')
        resource = request.data.get('resource', {})
        
        if event_type == 'PAYMENT.SALE.COMPLETED':
            # Payment completed
            payment_id = resource.get('parent_payment')
            
            try:
                payment_order = PaymentOrder.objects.get(gateway_order_id=payment_id)
                
                # Process payment success
                transaction = PaymentProcessor.process_payment_success(
                    payment_order=payment_order,
                    transaction_data={
                        'transaction_id': resource.get('id'),
                        'payment_method': 'paypal',
                        'gateway_response': resource
                    }
                )
                
                webhook_log.transaction = transaction
                webhook_log.status = 'processed'
                webhook_log.save()
            
            except PaymentOrder.DoesNotExist:
                webhook_log.status = 'ignored'
                webhook_log.error_message = 'Payment order not found'
                webhook_log.save()
        
        else:
            webhook_log.status = 'ignored'
            webhook_log.error_message = f'Unhandled event type: {event_type}'
            webhook_log.save()
        
        return Response({'status': 'success'})
    
    except Exception as e:
        webhook_log.status = 'failed'
        webhook_log.error_message = str(e)
        webhook_log.save()
        return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_transactions(request, order_id):
    """
    Get all transactions for an order
    GET /api/payments/order/<order_id>/transactions/
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and order.client != user:
            return Response(
                {'error': 'You do not have permission to view these transactions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transactions = Transaction.objects.filter(order=order).order_by('-created_at')
        serializer = TransactionSerializer(transactions, many=True)
        
        return Response(serializer.data)
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retry_payment(request, transaction_id):
    """
    Retry a failed payment
    POST /api/payments/retry/<transaction_id>/
    """
    try:
        transaction = Transaction.objects.get(id=transaction_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and transaction.user != user:
            return Response(
                {'error': 'You do not have permission to retry this payment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if can retry
        if not transaction.can_retry():
            return Response(
                {'error': 'This transaction cannot be retried'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Increment retry count
        transaction.retry_count += 1
        transaction.save()
        
        # Create new payment order
        order = transaction.order
        gateway = transaction.gateway
        
        if gateway == 'razorpay':
            razorpay_service = RazorpayService()
            payment_order = razorpay_service.create_order(
                order=order,
                amount=transaction.amount,
                currency=transaction.currency
            )
        elif gateway == 'paypal':
            paypal_service = PayPalService()
            payment_order = paypal_service.create_order(
                order=order,
                amount=transaction.amount,
                currency=transaction.currency
            )
        else:
            return Response(
                {'error': 'Invalid gateway'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'success': True,
            'message': 'New payment order created for retry',
            'payment_order': PaymentOrderSerializer(payment_order).data
        })
    
    except Transaction.DoesNotExist:
        return Response(
            {'error': 'Transaction not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_receipt(request, transaction_id):
    """
    Download receipt PDF for a transaction
    GET /api/payments/receipt/<transaction_id>/
    """
    try:
        transaction = Transaction.objects.get(transaction_id=transaction_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and transaction.user != user:
            return Response(
                {'error': 'You do not have permission to download this receipt'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate receipt PDF
        from .receipt_generator import ReceiptPDFGenerator
        from django.http import HttpResponse
        
        generator = ReceiptPDFGenerator(transaction)
        pdf_file = generator.generate()
        
        # Create HTTP response with PDF
        response = HttpResponse(pdf_file.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt_{transaction_id}.pdf"'
        
        return response
    
    except Transaction.DoesNotExist:
        return Response(
            {'error': 'Transaction not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
