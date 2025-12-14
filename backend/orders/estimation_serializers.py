# orders/estimation_serializers.py
from rest_framework import serializers
from .estimation_models import Estimation, Invoice
from .models import Order
from accounts.models import User


class EstimationSerializer(serializers.ModelSerializer):
    """Serializer for Estimation model"""
    
    order_title = serializers.CharField(source='order.title', read_only=True)
    client_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Estimation
        fields = [
            'id', 'uuid', 'order', 'order_title', 'title', 'description',
            'cost_breakdown', 'subtotal', 'tax_percentage', 'tax_amount',
            'total_amount', 'estimated_timeline_days', 'valid_until',
            'pdf_url', 'pdf_public_id', 'status', 'created_by',
            'created_by_name', 'client_name', 'internal_notes',
            'client_notes', 'created_at', 'updated_at', 'sent_at',
            'approved_at', 'rejected_at', 'is_expired'
        ]
        read_only_fields = [
            'id', 'uuid', 'subtotal', 'tax_amount', 'total_amount',
            'pdf_url', 'pdf_public_id', 'created_at', 'updated_at',
            'sent_at', 'approved_at', 'rejected_at'
        ]
    
    def get_client_name(self, obj):
        """Get client name"""
        if obj.order.client:
            return obj.order.client.get_full_name() or obj.order.client.email
        return obj.order.client_email
    
    def get_created_by_name(self, obj):
        """Get creator name"""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None


class EstimationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating estimations"""
    
    class Meta:
        model = Estimation
        fields = [
            'order', 'title', 'description', 'cost_breakdown',
            'tax_percentage', 'estimated_timeline_days', 'valid_until',
            'internal_notes', 'client_notes'
        ]
    
    def validate_order(self, value):
        """Validate order exists"""
        if not Order.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Order not found")
        return value
    
    def validate_cost_breakdown(self, value):
        """Validate cost breakdown structure"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Cost breakdown must be a list")
        
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each cost item must be a dictionary")
            
            required_fields = ['item', 'amount']
            for field in required_fields:
                if field not in item:
                    raise serializers.ValidationError(f"Each cost item must have '{field}' field")
            
            # Validate amount is numeric
            try:
                float(item['amount'])
            except (ValueError, TypeError):
                raise serializers.ValidationError("Amount must be a number")
        
        return value
    
    def create(self, validated_data):
        """Create estimation with creator"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model"""
    
    order_title = serializers.CharField(source='order.title', read_only=True)
    client_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'uuid', 'order', 'order_title', 'estimation',
            'invoice_number', 'title', 'line_items', 'subtotal',
            'tax_percentage', 'tax_amount', 'discount_amount',
            'total_amount', 'amount_paid', 'balance_due',
            'invoice_date', 'due_date', 'pdf_url', 'pdf_public_id',
            'status', 'created_by', 'created_by_name', 'client_name',
            'notes', 'terms_and_conditions', 'created_at', 'updated_at',
            'sent_at', 'paid_at', 'is_overdue'
        ]
        read_only_fields = [
            'id', 'uuid', 'invoice_number', 'subtotal', 'tax_amount',
            'total_amount', 'pdf_url', 'pdf_public_id', 'created_at',
            'updated_at', 'sent_at', 'paid_at'
        ]
    
    def get_client_name(self, obj):
        """Get client name"""
        if obj.order.client:
            return obj.order.client.get_full_name() or obj.order.client.email
        return obj.order.client_email
    
    def get_created_by_name(self, obj):
        """Get creator name"""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None


class InvoiceGenerateSerializer(serializers.Serializer):
    """Serializer for generating invoices"""
    
    order_id = serializers.IntegerField()
    estimation_id = serializers.IntegerField(required=False, allow_null=True)
    title = serializers.CharField(max_length=255)
    line_items = serializers.ListField()
    tax_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    due_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    terms_and_conditions = serializers.CharField(required=False, allow_blank=True)
    
    def validate_order_id(self, value):
        """Validate order exists"""
        try:
            Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")
        return value
    
    def validate_estimation_id(self, value):
        """Validate estimation exists if provided"""
        if value:
            try:
                Estimation.objects.get(id=value)
            except Estimation.DoesNotExist:
                raise serializers.ValidationError("Estimation not found")
        return value
    
    def validate_line_items(self, value):
        """Validate line items structure"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Line items must be a list")
        
        if len(value) == 0:
            raise serializers.ValidationError("At least one line item is required")
        
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each line item must be a dictionary")
            
            required_fields = ['item', 'amount']
            for field in required_fields:
                if field not in item:
                    raise serializers.ValidationError(f"Each line item must have '{field}' field")
            
            # Validate amount is numeric
            try:
                float(item['amount'])
            except (ValueError, TypeError):
                raise serializers.ValidationError("Amount must be a number")
        
        return value
