# payments/serializers.py
from rest_framework import serializers
from .models import PaymentRequest, PaymentOrder, Transaction, WebhookLog
from orders.models import Order


class PaymentRequestSerializer(serializers.ModelSerializer):
    """Serializer for PaymentRequest model"""
    
    order_title = serializers.CharField(source='order.title', read_only=True)
    requested_by_email = serializers.EmailField(source='requested_by.email', read_only=True)
    client_email = serializers.EmailField(source='order.client.email', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PaymentRequest
        fields = [
            'id', 'order', 'order_title', 'requested_by', 'requested_by_email',
            'client_email', 'amount', 'gateway', 'currency', 'status',
            'payment_link', 'notes', 'metadata', 'payment_order',
            'created_at', 'updated_at', 'expires_at', 'paid_at', 'is_expired'
        ]
        read_only_fields = ['id', 'payment_link', 'payment_order', 'created_at', 'updated_at', 'paid_at']


class PaymentRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating payment requests"""
    
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    gateway = serializers.ChoiceField(choices=['razorpay', 'paypal'])
    currency = serializers.CharField(default='INR', max_length=3)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_order_id(self, value):
        """Validate that order exists"""
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")
        
        # Check if user has permission to create payment request for this order
        user = self.context['request'].user
        if user.role not in ['admin', 'service_head']:
            raise serializers.ValidationError("Only admin and service heads can create payment requests")
        
        # Service heads can only create requests for their department's orders
        if user.role == 'service_head':
            from services.models import Department
            user_dept = Department.objects.filter(team_head=user).first()
            if not user_dept or (hasattr(order.service, 'department') and order.service.department != user_dept):
                raise serializers.ValidationError("You can only create payment requests for orders in your department")
        
        return value
    
    def validate(self, data):
        """Additional validation"""
        # Validate currency based on gateway
        if data['gateway'] == 'razorpay' and data['currency'] not in ['INR']:
            raise serializers.ValidationError({"currency": "Razorpay only supports INR currency"})
        elif data['gateway'] == 'paypal' and data['currency'] not in ['USD', 'EUR', 'GBP']:
            raise serializers.ValidationError({"currency": "PayPal supports USD, EUR, GBP currencies"})
        
        # Validate amount doesn't exceed order price
        order = Order.objects.get(id=data['order_id'])
        if data['amount'] > order.price:
            raise serializers.ValidationError({"amount": "Payment request amount cannot exceed order price"})
        
        return data


class PaymentOrderSerializer(serializers.ModelSerializer):
    """Serializer for PaymentOrder model"""
    
    order_title = serializers.CharField(source='order.title', read_only=True)
    client_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = PaymentOrder
        fields = [
            'id', 'order', 'order_title', 'user', 'client_email',
            'gateway', 'gateway_order_id', 'amount', 'currency',
            'status', 'metadata', 'created_at', 'updated_at', 'expires_at'
        ]
        read_only_fields = ['id', 'gateway_order_id', 'created_at', 'updated_at']


class PaymentOrderCreateSerializer(serializers.Serializer):
    """Serializer for creating payment orders"""
    
    order_id = serializers.IntegerField()
    gateway = serializers.ChoiceField(choices=['razorpay', 'paypal'])
    currency = serializers.CharField(default='INR', max_length=3)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0, required=False)
    
    def validate_order_id(self, value):
        """Validate that order exists and belongs to user"""
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")
        
        # Check if user has access to this order
        user = self.context['request'].user
        if user.role == 'client' and order.client != user:
            raise serializers.ValidationError("You don't have access to this order")
        
        return value
    
    def validate(self, data):
        """Additional validation"""
        # Validate currency based on gateway
        if data['gateway'] == 'razorpay' and data['currency'] not in ['INR']:
            raise serializers.ValidationError("Razorpay only supports INR currency")
        elif data['gateway'] == 'paypal' and data['currency'] not in ['USD', 'EUR', 'GBP']:
            raise serializers.ValidationError("PayPal supports USD, EUR, GBP currencies")
        
        # Validate amount doesn't exceed order price if provided
        if 'amount' in data and data['amount']:
            order = Order.objects.get(id=data['order_id'])
            if data['amount'] > order.price:
                raise serializers.ValidationError({"amount": "Payment amount cannot exceed order price"})
        
        return data


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    
    order_title = serializers.CharField(source='order.title', read_only=True)
    client_email = serializers.EmailField(source='user.email', read_only=True)
    can_retry = serializers.BooleanField(read_only=True)
    gateway_display = serializers.CharField(source='get_gateway_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'uuid', 'order', 'order_title', 'user', 'client_email',
            'payment_order', 'gateway', 'gateway_display', 'transaction_id',
            'signature', 'is_verified', 'amount', 'currency',
            'payment_method', 'payment_method_display', 'status', 'status_display',
            'error_code', 'error_message', 'retry_count', 'max_retries',
            'can_retry', 'refund_amount', 'refund_reason', 'refunded_at',
            'receipt_pdf_url', 'receipt_pdf_dropbox_path',
            'gateway_response', 'metadata', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'transaction_id', 'is_verified', 'receipt_pdf_url',
            'receipt_pdf_dropbox_path', 'created_at', 'updated_at', 'completed_at'
        ]


class PaymentVerificationSerializer(serializers.Serializer):
    """Serializer for verifying payments"""
    
    gateway = serializers.ChoiceField(choices=['razorpay', 'paypal'])
    
    # Razorpay fields
    razorpay_order_id = serializers.CharField(required=False, allow_blank=True)
    razorpay_payment_id = serializers.CharField(required=False, allow_blank=True)
    razorpay_signature = serializers.CharField(required=False, allow_blank=True)
    
    # PayPal fields
    paypal_payment_id = serializers.CharField(required=False, allow_blank=True)
    paypal_payer_id = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate based on gateway"""
        if data['gateway'] == 'razorpay':
            required_fields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError(f"{field} is required for Razorpay")
        
        elif data['gateway'] == 'paypal':
            required_fields = ['paypal_payment_id', 'paypal_payer_id']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError(f"{field} is required for PayPal")
        
        return data


class WebhookLogSerializer(serializers.ModelSerializer):
    """Serializer for WebhookLog model"""
    
    class Meta:
        model = WebhookLog
        fields = [
            'id', 'gateway', 'event_type', 'payload', 'headers',
            'signature', 'is_verified', 'status', 'transaction',
            'error_message', 'created_at', 'processed_at'
        ]
        read_only_fields = ['id', 'created_at', 'processed_at']
