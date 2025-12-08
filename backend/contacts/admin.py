from django.contrib import admin
from .models import ContactSubmission

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'service', 'created_at', 'is_contacted')
    list_filter = ('service', 'is_contacted', 'created_at')
    search_fields = ('name', 'email', 'message')
    date_hierarchy = 'created_at'
    list_editable = ('is_contacted',)
