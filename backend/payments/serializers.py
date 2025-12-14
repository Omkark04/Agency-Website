# payments/serializers.py
from rest_framework import serializers
from .models import PaymentOrder, Transaction, WebhookLog
from orders.models import Order


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
        
        return data


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    
    order_title = serializers.CharField(source='order.title', read_only=True)
    client_email = serializers.EmailField(source='user.email', read_only=True)
    can_retry = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'order', 'order_title', 'user', 'client_email',
            'payment_order', 'gateway', 'transaction_id', 'signature',
            'is_verified', 'amount', 'currency', 'payment_method',
            'status', 'error_code', 'error_message', 'retry_count',
            'max_retries', 'can_retry', 'refund_amount', 'refund_reason',
            'refunded_at', 'gateway_response', 'metadata',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'is_verified', 'created_at',
            'updated_at', 'completed_at'
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
