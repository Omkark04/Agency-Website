# tasks/serializers.py
from rest_framework import serializers
from .models import Task
from accounts.models import User
from orders.models import Order


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    
    assignee_name = serializers.SerializerMethodField()
    assignee_details = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    order_title = serializers.CharField(source='order.title', read_only=True)
    order_details = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    due_date_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'order', 'order_title', 'order_details', 'title', 'description',
            'assignee', 'assignee_name', 'assignee_details', 'status', 'status_label',
            'priority', 'priority_label', 'due_date', 'due_date_formatted',
            'attachments', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'completed_at', 'can_edit'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']
    
    def get_assignee_name(self, obj):
        """Get assignee name"""
        if obj.assignee:
            return obj.assignee.get_full_name() or obj.assignee.email
        return None
    
    def get_assignee_details(self, obj):
        """Get detailed assignee info"""
        if obj.assignee:
            return {
                'id': obj.assignee.id,
                'name': obj.assignee.username,
                'email': obj.assignee.email,
                'avatar': obj.assignee.avatar_url or '',
                'role': obj.assignee.role
            }
        return None
    
    def get_created_by_name(self, obj):
        """Get creator name"""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None
    
    def get_order_details(self, obj):
        """Get order details"""
        if obj.order:
            return {
                'id': obj.order.id,
                'title': obj.order.title,
                'status': obj.order.status,
                'client': obj.order.client.username if obj.order.client else 'Unknown'
            }
        return None
    
    def get_can_edit(self, obj):
        """Check if current user can edit this task"""
        request = self.context.get('request')
        if request and request.user:
            return obj.can_edit(request.user)
        return False
    
    def get_due_date_formatted(self, obj):
        """Get formatted due date"""
        if obj.due_date:
            return obj.due_date.isoformat()
        return None


class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tasks"""
    
    class Meta:
        model = Task
        fields = [
            'order', 'title', 'description', 'assignee',
            'status', 'priority', 'due_date', 'attachments'
        ]
    
    def validate_order(self, value):
        """Validate order exists"""
        if not Order.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Order not found")
        return value
    
    def validate_assignee(self, value):
        """Validate assignee is a team member or service head"""
        if value and value.role not in ['team_member', 'service_head', 'admin']:
            raise serializers.ValidationError("Assignee must be a team member, service head, or admin")
        return value
    
    def validate_attachments(self, value):
        """Validate attachments is a list of URLs"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Attachments must be a list")
        
        for attachment in value:
            if not isinstance(attachment, (str, dict)):
                raise serializers.ValidationError("Each attachment must be a string URL or dict")
        
        return value
    
    def create(self, validated_data):
        """Create task with creator"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tasks"""
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'assignee', 'status',
            'priority', 'due_date', 'attachments'
        ]
    
    def validate_assignee(self, value):
        """Validate assignee is a team member or service head"""
        if value and value.role not in ['team_member', 'service_head', 'admin']:
            raise serializers.ValidationError("Assignee must be a team member, service head, or admin")
        return value


class TaskAttachmentSerializer(serializers.Serializer):
    """Serializer for task file attachments"""
    
    file = serializers.FileField()
    description = serializers.CharField(required=False, allow_blank=True, max_length=255)
    
    def validate_file(self, value):
        """Validate file size and type"""
        # Max 10MB
        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        
        # Allowed file types
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'application/zip'
        ]
        
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "File type not allowed. Allowed types: images, PDF, Word, Excel, text, ZIP"
            )
        
        return value
