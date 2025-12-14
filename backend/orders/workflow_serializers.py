# orders/workflow_serializers.py
from rest_framework import serializers
from .workflow_models import OrderStatusHistory
from .models import Order
from .workflow import OrderWorkflow


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for OrderStatusHistory model"""
    
    changed_by_name = serializers.SerializerMethodField()
    from_status_display = serializers.SerializerMethodField()
    to_status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderStatusHistory
        fields = [
            'id', 'order', 'from_status', 'from_status_display',
            'to_status', 'to_status_display', 'changed_by',
            'changed_by_name', 'notes', 'metadata', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_changed_by_name(self, obj):
        """Get name of user who made the change"""
        if obj.changed_by:
            return obj.changed_by.get_full_name() or obj.changed_by.email
        return "System"
    
    def get_from_status_display(self, obj):
        """Get human-readable from status"""
        if obj.from_status:
            return dict(Order.STATUS_CHOICES).get(obj.from_status, obj.from_status)
        return None
    
    def get_to_status_display(self, obj):
        """Get human-readable to status"""
        return dict(Order.STATUS_CHOICES).get(obj.to_status, obj.to_status)


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status"""
    
    new_status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_new_status(self, value):
        """Validate status transition"""
        order = self.context.get('order')
        if not order:
            raise serializers.ValidationError("Order context is required")
        
        is_valid, error_msg = OrderWorkflow.validate_transition(order.status, value)
        if not is_valid:
            raise serializers.ValidationError(error_msg)
        
        return value


class OrderDeliverableSerializer(serializers.Serializer):
    """Serializer for uploading order deliverables"""
    
    file = serializers.FileField()
    description = serializers.CharField(required=False, allow_blank=True, max_length=255)
    
    def validate_file(self, value):
        """Validate file size"""
        # Max 50MB for deliverables
        max_size = 50 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 50MB")
        
        return value


class OrderWorkflowInfoSerializer(serializers.Serializer):
    """Serializer for order workflow information"""
    
    current_status = serializers.CharField()
    current_status_display = serializers.CharField()
    allowed_next_statuses = serializers.ListField()
    progress_percentage = serializers.IntegerField()
    is_terminal = serializers.BooleanField()
    status_color = serializers.CharField()
