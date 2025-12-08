from django.db import models
from django.utils import timezone

class ContactSubmission(models.Model):
    SERVICE_CHOICES = [
        ('social_media', 'Social Media Design'),
        ('web_dev', 'Web Development'),
        ('mobile_dev', 'Mobile App Development'),
        ('ui_ux', 'UI/UX Design'),
        ('branding', 'Branding'),
        ('other', 'Other')
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    service = models.CharField(max_length=50, choices=SERVICE_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    is_contacted = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} - {self.service}"
    
    class Meta:
        ordering = ['-created_at']
