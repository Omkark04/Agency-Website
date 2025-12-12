from rest_framework import serializers
from django.db.models import Q
from .models import ServiceForm, ServiceFormField, ServiceFormSubmission
from orders.models import Order
from notifications.models import Notification
from accounts.models import User
from services.models import Service


class ServiceFormFieldSerializer(serializers.ModelSerializer):
    """Serializer for form fields"""
    
    class Meta:
        model = ServiceFormField
        fields = [
            'id', 'form', 'label', 'field_type', 'required', 
            'placeholder', 'help_text', 'options', 'order'
        ]
        read_only_fields = ['id']
    
    def validate_options(self, value):
        """Validate options for dropdown/multi_select fields"""
        field_type = self.initial_data.get('field_type')
        if field_type in ['dropdown', 'multi_select']:
            if not value or not isinstance(value, list):
                raise serializers.ValidationError(
                    "Options must be a non-empty list for dropdown/multi_select fields"
                )
        return value


class ServiceFormSerializer(serializers.ModelSerializer):
    """Serializer for service forms"""
    fields = ServiceFormFieldSerializer(many=True, read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = ServiceForm
        fields = [
            'id', 'service', 'service_title', 'title', 'description', 
            'is_active', 'created_by', 'created_by_name', 
            'created_at', 'updated_at', 'fields'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class ServiceFormSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for form submissions"""
    form_title = serializers.CharField(source='form.title', read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)
    submitted_by_name = serializers.CharField(source='submitted_by.username', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    
    class Meta:
        model = ServiceFormSubmission
        fields = [
            'id', 'form', 'form_title', 'service', 'service_title',
            'submitted_by', 'submitted_by_name', 'client_email',
            'data', 'files', 'submission_summary', 
            'order', 'order_id', 'created_at'
        ]
        read_only_fields = ['id', 'order', 'submission_summary', 'created_at']
    
    def validate(self, attrs):
        """Validate submission data against form fields"""
        form = attrs.get('form')
        data = attrs.get('data', {})
        
        if not form:
            raise serializers.ValidationError("Form is required")
        
        # Validate required fields
        for field in form.fields.filter(required=True):
            field_key = str(field.id)
            if field_key not in data or not data[field_key]:
                raise serializers.ValidationError({
                    field_key: f"Field '{field.label}' is required"
                })
        
        # Validate dropdown/multi-select options
        for field in form.fields.filter(field_type__in=['dropdown', 'multi_select']):
            field_key = str(field.id)
            if field_key in data and field.options:
                value = data[field_key]
                
                if field.field_type == 'multi_select':
                    # Value should be a list
                    if not isinstance(value, list):
                        raise serializers.ValidationError({
                            field_key: f"Field '{field.label}' must be a list"
                        })
                    # Check all values are valid options
                    if not all(v in field.options for v in value):
                        raise serializers.ValidationError({
                            field_key: f"Invalid option for '{field.label}'"
                        })
                else:
                    # Single value must be in options
                    if value not in field.options:
                        raise serializers.ValidationError({
                            field_key: f"Invalid option for '{field.label}'"
                        })
        
        # Validate number fields
        for field in form.fields.filter(field_type='number'):
            field_key = str(field.id)
            if field_key in data:
                try:
                    float(data[field_key])
                except (ValueError, TypeError):
                    raise serializers.ValidationError({
                        field_key: f"Field '{field.label}' must be a number"
                    })
        
        return attrs
    
    def create(self, validated_data):
        """Create submission and associated order"""
        # Create submission
        submission = super().create(validated_data)
        
        # Generate summary
        submission.submission_summary = submission.generate_summary()
        
        # Create Order
        order = self._create_order(submission)
        submission.order = order
        submission.save()
        
        # Send notifications
        self._send_notifications(submission, order)
        
        return submission
    
    def _create_order(self, submission):
        """Create an order from the submission"""
        # Determine client and email
        client = submission.submitted_by
        client_email = submission.client_email
        
        if client and not client_email:
            client_email = client.email
        
        # Get service price (use original_price or 0)
        price = getattr(submission.service, 'original_price', 0) or 0
        
        # Create order
        order = Order.objects.create(
            service=submission.service,
            client=client,
            client_email=client_email,
            title=f"{submission.form.title} - {submission.submission_summary[:50]}",
            details=f"Form submission ID: {submission.id}\n\nSubmission: {submission.submission_summary}",
            status='pending',
            price=price,
        )
        
        return order
    
    def _send_notifications(self, submission, order):
        """Send notifications to admins and service head"""
        # Notify all admins
        admins = User.objects.filter(role='admin', is_active=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title="New Form Submission",
                message=f"New submission for {submission.service.title} - {submission.form.title}. Order #{order.id} created.",
                notification_type='order_update',
                order=order
            )
        
        # Notify service/department head
        if submission.service.department and submission.service.department.team_head:
            team_head = submission.service.department.team_head
            Notification.objects.create(
                user=team_head,
                title="New Form Submission",
                message=f"New submission for {submission.service.title}. Order #{order.id} created.",
                notification_type='order_update',
                order=order
            )
        
        # TODO: Send email notifications
        # This would use Django's email backend
        # send_mail(
        #     subject=f"New Form Submission - {submission.form.title}",
        #     message=f"...",
        #     from_email=settings.DEFAULT_FROM_EMAIL,
        #     recipient_list=[admin.email for admin in admins],
        # )
