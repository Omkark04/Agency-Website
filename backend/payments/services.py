# payments/services.py
"""
Payment gateway integration services for Razorpay and PayPal
"""
import razorpay
import paypalrestsdk
import hmac
import hashlib
from django.conf import settings
from django.core.mail import send_mail
from decimal import Decimal
from .models import PaymentOrder, Transaction, WebhookLog


class RazorpayService:
    """
    Razorpay payment gateway integration
    """
    
    def __init__(self):
        self.client = razorpay.Client(auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET
        ))
    
    def create_order(self, order, amount, currency="INR"):
        """
        Create a Razorpay order
        
        Args:
            order: Order instance
            amount: Amount in currency units (e.g., 1000 for ₹1000)
            currency: Currency code (default: INR)
        
        Returns:
            PaymentOrder instance
        """
        # Convert amount to paise (Razorpay uses smallest currency unit)
        amount_paise = int(Decimal(amount) * 100)
        
        # Create Razorpay order
        razorpay_order = self.client.order.create({
            "amount": amount_paise,
            "currency": currency,
            "receipt": f"order_{order.id}",
            "notes": {
                "order_id": order.id,
                "order_title": order.title,
            }
        })
        
        # Create PaymentOrder record
        payment_order = PaymentOrder.objects.create(
            order=order,
            user=order.client,
            gateway="razorpay",
            gateway_order_id=razorpay_order["id"],
            amount=amount,
            currency=currency,
            status="created",
            metadata=razorpay_order
        )
        
        return payment_order
    
    def verify_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """
        Verify Razorpay payment signature
        
        Returns:
            bool: True if signature is valid
        """
        try:
            # Generate expected signature
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, razorpay_signature)
        except Exception as e:
            print(f"Signature verification error: {e}")
            return False
    
    def verify_webhook_signature(self, payload, signature):
        """
        Verify Razorpay webhook signature
        
        Returns:
            bool: True if signature is valid
        """
        try:
            expected_signature = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            print(f"Webhook signature verification error: {e}")
            return False
    
    def fetch_payment(self, payment_id, timeout=10):
        """
        Fetch payment details from Razorpay
        
        Args:
            payment_id: Razorpay payment ID
            timeout: Request timeout in seconds (default: 10)
        
        Returns:
            dict: Payment details or None on error
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Set timeout for the request to prevent hanging
            import requests
            response = requests.get(
                f"https://api.razorpay.com/v1/payments/{payment_id}",
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
                timeout=timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            logger.error(f"Timeout fetching payment {payment_id} from Razorpay (timeout={timeout}s)")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error fetching payment from Razorpay: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching payment {payment_id}: {e}")
            return None


class PayPalService:
    """
    PayPal payment gateway integration
    """
    
    def __init__(self):
        paypalrestsdk.configure({
            "mode": settings.PAYPAL_MODE,  # sandbox or live
            "client_id": settings.PAYPAL_CLIENT_ID,
            "client_secret": settings.PAYPAL_CLIENT_SECRET
        })
    
    def create_order(self, order, amount, currency="USD"):
        """
        Create a PayPal order
        
        Args:
            order: Order instance
            amount: Amount in currency units
            currency: Currency code (default: USD)
        
        Returns:
            PaymentOrder instance
        """
        # Create PayPal payment
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{settings.FRONTEND_URL}/payment/success",
                "cancel_url": f"{settings.FRONTEND_URL}/payment/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": order.title,
                        "sku": f"order_{order.id}",
                        "price": str(amount),
                        "currency": currency,
                        "quantity": 1
                    }]
                },
                "amount": {
                    "total": str(amount),
                    "currency": currency
                },
                "description": f"Payment for Order #{order.id}"
            }]
        })
        
        if payment.create():
            # Create PaymentOrder record
            payment_order = PaymentOrder.objects.create(
                order=order,
                user=order.client,
                gateway="paypal",
                gateway_order_id=payment.id,
                amount=amount,
                currency=currency,
                status="created",
                metadata={
                    "payment_id": payment.id,
                    "approval_url": next(
                        (link.href for link in payment.links if link.rel == "approval_url"),
                        None
                    )
                }
            )
            return payment_order
        else:
            raise Exception(f"PayPal payment creation failed: {payment.error}")
    
    def execute_payment(self, payment_id, payer_id):
        """
        Execute/capture PayPal payment after user approval
        
        Returns:
            dict: Payment execution result
        """
        payment = paypalrestsdk.Payment.find(payment_id)
        
        if payment.execute({"payer_id": payer_id}):
            return {
                "success": True,
                "payment": payment.to_dict()
            }
        else:
            return {
                "success": False,
                "error": payment.error
            }
    
    def verify_webhook_signature(self, headers, payload):
        """
        Verify PayPal webhook signature
        
        Note: PayPal webhook verification is more complex and typically
        requires calling PayPal's verification API
        """
        # For production, implement proper webhook verification
        # using PayPal's webhook verification API
        return True


class PaymentProcessor:
    """
    High-level payment processing logic
    """
    
    @staticmethod
    def process_payment_success(payment_order, transaction_data):
        """
        Process successful payment
        
        Args:
            payment_order: PaymentOrder instance
            transaction_data: Dict with transaction details
        """
        from orders.models import Order
        from notifications.models import Notification
        from django.core.mail import EmailMessage
        from django.template.loader import render_to_string
        from django.utils.html import strip_tags
        from django.conf import settings
        from django.utils import timezone
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Update payment order status
        payment_order.status = "paid"
        payment_order.save()
        
        # Create/update transaction
        transaction, created = Transaction.objects.update_or_create(
            transaction_id=transaction_data.get("transaction_id"),
            defaults={
                "order": payment_order.order,
                "user": payment_order.user,
                "payment_order": payment_order,
                "gateway": payment_order.gateway,
                "amount": payment_order.amount,
                "currency": payment_order.currency,
                "status": "success",
                "is_verified": True,
                "payment_method": transaction_data.get("payment_method", "other"),
                "signature": transaction_data.get("signature", ""),
                "gateway_response": transaction_data.get("gateway_response", {}),
                "completed_at": timezone.now(),
            }
        )
        
        # Update order status to payment_done
        order = payment_order.order
        try:
            order.update_status("payment_done", payment_order.user, "Payment received successfully")
        except ValueError:
            # If transition is not allowed, just save a note
            pass
        
        # Update payment request if exists
        # Check direct relationship first
        if hasattr(payment_order, 'payment_request'):
            payment_requests = payment_order.payment_request.all()
            for pr in payment_requests:
                logger.info(f"Marking linked payment request {pr.id} as paid")
                pr.mark_paid()
        
        # Also check for any pending payment requests for this order with matching amount
        # This handles cases where the link wasn't established during creation
        from .models import PaymentRequest
        matching_requests = PaymentRequest.objects.filter(
            order=order,
            status='pending',
            amount=payment_order.amount
        )
        for pr in matching_requests:
            logger.info(f"Marking matching payment request {pr.id} as paid")
            pr.mark_paid()
            # Link it to the payment order for future reference
            pr.payment_order = payment_order
            pr.save()
        
        # Generate receipt PDF and upload to Dropbox (non-blocking)
        try:
            from .receipt_generator import ReceiptPDFGenerator
            generator = ReceiptPDFGenerator(transaction)
            result = generator.upload_to_dropbox()
            transaction.receipt_pdf_url = result['download_url']
            transaction.receipt_pdf_dropbox_path = result['file_path']
            transaction.save(update_fields=['receipt_pdf_url', 'receipt_pdf_dropbox_path'])
            logger.info(f"Receipt PDF generated and uploaded for transaction {transaction.id}")
        except Exception as e:
            logger.error(f"Receipt PDF generation/upload failed: {e}")
            # Non-blocking - payment still succeeds
        
        # Send all emails asynchronously to prevent SMTP timeouts from blocking verification
        import threading
        
        def send_emails_async():
            """Send all emails in background thread"""
            import logging
            logger = logging.getLogger(__name__)
            
            # Send email to client with receipt
            if payment_order.user and payment_order.user.email:
                try:
                    html_message = render_to_string('emails/payment_success_client.html', {
                        'client_name': payment_order.user.get_full_name() or payment_order.user.email,
                        'order_id': order.id,
                        'order_title': order.title,
                        'amount': payment_order.amount,
                        'currency': payment_order.currency,
                        'transaction_id': transaction.transaction_id,
                        'payment_method': transaction.get_payment_method_display(),
                        'payment_date': transaction.completed_at.strftime('%B %d, %Y'),
                        'dashboard_link': f"{settings.FRONTEND_URL}/client-dashboard/orders/{order.id}",
                        'company_email': settings.COMPANY_EMAIL,
                    })
                    
                    plain_message = strip_tags(html_message)
                    
                    email = EmailMessage(
                        subject=f'Payment Receipt - Order #{order.id}',
                        body=plain_message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[payment_order.user.email],
                    )
                    email.content_subtype = "html"
                    email.body = html_message
                    
                    # Attach receipt PDF if generated
                    if receipt_pdf:
                        receipt_pdf.seek(0)
                        email.attach(
                            f'receipt_{transaction.transaction_id}.pdf',
                            receipt_pdf.read(),
                            'application/pdf'
                        )
                    
                    # Set timeout for SMTP connection
                    from django.core.mail import get_connection
                    connection = get_connection(timeout=10)
                    email.connection = connection
                    email.send(fail_silently=True)
                    logger.info(f"Client email sent successfully for transaction {transaction.id}")
                except Exception as e:
                    logger.error(f"Failed to send client email: {e}")
            
            # Send email and notification to admin users
            try:
                from accounts.models import User
                admin_users = User.objects.filter(role="admin")
                for admin in admin_users:
                    # Send email
                    try:
                        html_message = render_to_string('emails/payment_success_admin.html', {
                            'admin_name': admin.get_full_name() or 'Admin',
                            'client_name': payment_order.user.get_full_name() or payment_order.user.email,
                            'client_email': payment_order.user.email,
                            'order_id': order.id,
                            'order_title': order.title,
                            'amount': payment_order.amount,
                            'currency': payment_order.currency,
                            'gateway': payment_order.get_gateway_display(),
                            'transaction_id': transaction.transaction_id,
                            'payment_date': transaction.completed_at.strftime('%B %d, %Y %I:%M %p'),
                            'dashboard_link': f"{settings.FRONTEND_URL}/admin/orders/{order.id}",
                        })
                        
                        plain_message = strip_tags(html_message)
                        
                        from django.core.mail import get_connection
                        connection = get_connection(timeout=10)
                        send_mail(
                            subject=f'Payment Received - Order #{order.id}',
                            message=plain_message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[admin.email],
                            html_message=html_message,
                            fail_silently=True,
                            connection=connection
                        )
                    except Exception as e:
                        logger.error(f"Failed to send admin email: {e}")
            except Exception as e:
                logger.error(f"Failed to process admin emails: {e}")
            
            # Send email to service head if applicable
            try:
                if hasattr(order.service, 'department') and order.service.department and order.service.department.team_head:
                    service_head = order.service.department.team_head
                    try:
                        html_message = render_to_string('emails/payment_success_admin.html', {
                            'admin_name': service_head.get_full_name() or 'Service Head',
                            'client_name': payment_order.user.get_full_name() or payment_order.user.email,
                            'client_email': payment_order.user.email,
                            'order_id': order.id,
                            'order_title': order.title,
                            'amount': payment_order.amount,
                            'currency': payment_order.currency,
                            'gateway': payment_order.get_gateway_display(),
                            'transaction_id': transaction.transaction_id,
                            'payment_date': transaction.completed_at.strftime('%B %d, %Y %I:%M %p'),
                            'dashboard_link': f"{settings.FRONTEND_URL}/service-head/orders/{order.id}",
                        })
                        
                        plain_message = strip_tags(html_message)
                        
                        from django.core.mail import get_connection
                        connection = get_connection(timeout=10)
                        send_mail(
                            subject=f'Payment Received - Order #{order.id}',
                            message=plain_message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[service_head.email],
                            html_message=html_message,
                            fail_silently=True,
                            connection=connection
                        )
                    except Exception as e:
                        logger.error(f"Failed to send service head email: {e}")
            except Exception as e:
                logger.error(f"Failed to process service head email: {e}")
            
            logger.info(f"Email sending complete for transaction {transaction.id}")
        
        # Start email sending in background thread (daemon so it doesn't block shutdown)
        email_thread = threading.Thread(target=send_emails_async, daemon=True)
        email_thread.start()
        logger.info(f"Started async email sending for transaction {transaction.id}")
        
        # Send notification to client (quick, non-blocking)
        Notification.objects.create(
            user=payment_order.user,
            title="Payment Successful",
            message=f"Your payment of {payment_order.currency} {payment_order.amount} for Order #{order.id} has been received successfully.",
            notification_type="payment_received",
            order=order
        )
        
        # Send notifications to admin users (quick, non-blocking)
        from accounts.models import User
        admin_users = User.objects.filter(role="admin")
        for admin in admin_users:
            # Create dashboard notification
            Notification.objects.create(
                user=admin,
                title="Payment Received",
                message=f"Payment of {payment_order.currency} {payment_order.amount} received for Order #{order.id}",
                notification_type="payment_received",
                order=order
            )
        
        
        # Send notification to service head if applicable
        if hasattr(order.service, 'department') and order.service.department and order.service.department.team_head:
            service_head = order.service.department.team_head
            # Create dashboard notification
            Notification.objects.create(
                user=service_head,
                title="Payment Received",
                message=f"Payment of {payment_order.currency} {payment_order.amount} received for Order #{order.id}",
                notification_type="payment_received",
                order=order
            )
        
        return transaction
    
    @staticmethod
    def process_payment_failure(payment_order, error_data):
        """
        Process failed payment
        
        Args:
            payment_order: PaymentOrder instance
            error_data: Dict with error details
        """
        from notifications.models import Notification
        
        # Update payment order status
        payment_order.status = "failed"
        payment_order.save()
        
        # Create failed transaction
        transaction = Transaction.objects.create(
            order=payment_order.order,
            user=payment_order.user,
            payment_order=payment_order,
            gateway=payment_order.gateway,
            transaction_id=error_data.get("transaction_id", f"failed_{payment_order.id}"),
            amount=payment_order.amount,
            currency=payment_order.currency,
            status="failed",
            error_code=error_data.get("error_code", ""),
            error_message=error_data.get("error_message", "Payment failed"),
            gateway_response=error_data.get("gateway_response", {})
        )
        
        # Send notification to client
        Notification.objects.create(
            user=payment_order.user,
            title="Payment Failed",
            message=f"Your payment for Order #{payment_order.order.id} failed. Please try again.",
            notification_type="system",
            order=payment_order.order
        )
        
        return transaction
