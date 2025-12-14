from django.db import models
from django.utils import timezone
from services.models import Service
from accounts.models import User


class ServiceForm(models.Model):
    """Custom form template for a service"""
    service = models.ForeignKey(
        Service, 
        on_delete=models.CASCADE, 
        related_name='forms'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='created_forms'
    )
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'service_forms'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.service.title} - {self.title}"


class ServiceFormField(models.Model):
    """Individual field in a service form"""
    FIELD_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('short_text', 'Short Text'),
        ('long_text', 'Long Text'),
        ('dropdown', 'Dropdown'),
        ('checkbox', 'Checkbox'),
        ('multi_select', 'Multi Select'),
        ('media', 'Media Upload'),
    ]
    
    form = models.ForeignKey(
        ServiceForm, 
        on_delete=models.CASCADE, 
        related_name='fields'
    )
    label = models.CharField(max_length=255)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    required = models.BooleanField(default=False)
    placeholder = models.CharField(max_length=255, blank=True)
    help_text = models.TextField(blank=True)
    options = models.JSONField(null=True, blank=True)  # For dropdown/multi_select
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'service_form_fields'
        ordering = ['order']
    
    def __str__(self):
        return f"{self.form.title} - {self.label}"


class ServiceFormSubmission(models.Model):
    """User submission of a service form"""
    form = models.ForeignKey(
        ServiceForm, 
        on_delete=models.CASCADE, 
        related_name='submissions'
    )
    service = models.ForeignKey(
        Service, 
        on_delete=models.CASCADE,
        related_name='form_submissions'
    )
    submitted_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='form_submissions'
    )
    client_email = models.EmailField(blank=True)
    data = models.JSONField(default=dict)  # {field_id: value}
    files = models.JSONField(default=dict)  # {field_id: [urls]}
    submission_summary = models.TextField(blank=True)  # Human-readable summary
    order = models.ForeignKey(
        'orders.Order', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='submission'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'service_form_submissions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Submission for {self.form.title} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def generate_summary(self):
        """Generate a human-readable summary from submission data"""
        summary_parts = []
        for field_id, value in list(self.data.items())[:3]:  # First 3 fields
            try:
                field = self.form.fields.get(id=field_id)
                summary_parts.append(f"{field.label}: {value}")
            except ServiceFormField.DoesNotExist:
                pass
        return " | ".join(summary_parts) if summary_parts else "Form submission"
