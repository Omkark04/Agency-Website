from django.contrib import admin
from .models import ServiceForm, ServiceFormField, ServiceFormSubmission


@admin.register(ServiceForm)
class ServiceFormAdmin(admin.ModelAdmin):
    list_display = ['title', 'service', 'is_active', 'created_by', 'created_at']
    list_filter = ['is_active', 'service', 'created_at']
    search_fields = ['title', 'description', 'service__title']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Form Details', {
            'fields': ('service', 'title', 'description', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ServiceFormField)
class ServiceFormFieldAdmin(admin.ModelAdmin):
    list_display = ['label', 'form', 'field_type', 'required', 'order']
    list_filter = ['field_type', 'required', 'form']
    search_fields = ['label', 'form__title']
    ordering = ['form', 'order']


@admin.register(ServiceFormSubmission)
class ServiceFormSubmissionAdmin(admin.ModelAdmin):
    list_display = ['form', 'service', 'submitted_by', 'client_email', 'created_at', 'order']
    list_filter = ['service', 'form', 'created_at']
    search_fields = ['client_email', 'submission_summary', 'submitted_by__username']
    readonly_fields = ['created_at', 'submission_summary', 'data', 'files']
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('form', 'service', 'submitted_by', 'client_email')
        }),
        ('Data', {
            'fields': ('data', 'files', 'submission_summary')
        }),
        ('Related', {
            'fields': ('order', 'created_at')
        }),
    )
    
    def has_add_permission(self, request):
        # Submissions should only be created via API
        return False
