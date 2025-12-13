from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assignee_details = serializers.SerializerMethodField()
    order_details = serializers.SerializerMethodField()
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    due_date_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assignee', 'status', 'priority',
            'due_date', 'attachments', 'created_at', 'order',
            'assignee_details', 'order_details', 'priority_label', 
            'status_label', 'due_date_formatted'
        ]
        read_only_fields = ['id', 'created_at', 'assignee_details', 'order_details', 
                           'priority_label', 'status_label', 'due_date_formatted']
        extra_kwargs = {
            'order': {'required': False},  # Make order optional for updates
            'title': {'required': False},  # Make title optional for updates
            'description': {'required': False},
        }

    def get_fields(self):
        fields = super().get_fields()
        # Add extra fields to the field list
        return fields

    def get_assignee_details(self, obj):
        if obj.assignee:
            return {
                'id': obj.assignee.id,
                'name': obj.assignee.username,
                'email': obj.assignee.email,
                'avatar': obj.assignee.avatar_url or '',
                'role': obj.assignee.role
            }
        return None

    def get_order_details(self, obj):
        if obj.order:
            return {
                'id': obj.order.id,
                'title': obj.order.title,
                'status': obj.order.status,
                'client': obj.order.client.username if obj.order.client else 'Unknown'
            }
        return None

    def get_due_date_formatted(self, obj):
        if obj.due_date:
            return obj.due_date.isoformat()
        return None
