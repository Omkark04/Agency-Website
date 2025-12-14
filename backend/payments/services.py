# payments/services.py
"""
Payment gateway integration services for Razorpay and PayPal
"""
import razorpay
import paypalrestsdk
import hmac
import hashlib
from django.conf import settings
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
    
    def fetch_payment(self, payment_id):
        """Fetch payment details from Razorpay"""
        try:
            return self.client.payment.fetch(payment_id)
        except Exception as e:
            print(f"Error fetching payment: {e}")
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
            }
        )
        
        # Update order status to payment_done
        order = payment_order.order
        try:
            order.update_status("payment_done", payment_order.user, "Payment received successfully")
        except ValueError:
            # If transition is not allowed, just save a note
            pass
        
        # Send notification to client
        Notification.objects.create(
            user=payment_order.user,
            title="Payment Successful",
            message=f"Your payment of {payment_order.currency} {payment_order.amount} for Order #{order.id} has been received successfully.",
            notification_type="payment_success",
            link=f"/dashboard/orders/{order.id}"
        )
        
        # Send notification to admin
        from accounts.models import User
        admin_users = User.objects.filter(role="admin")
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                title="Payment Received",
                message=f"Payment of {payment_order.currency} {payment_order.amount} received for Order #{order.id}",
                notification_type="payment_received",
                link=f"/dashboard/admin/orders/{order.id}"
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
            notification_type="payment_failed",
            link=f"/dashboard/orders/{payment_order.order.id}/payment"
        )
        
        return transaction
