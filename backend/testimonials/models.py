# Create a new app: python manage.py startapp testimonials

from django.db import models

class Testimonial(models.Model):
    id = models.AutoField(primary_key=True)
    client_name = models.CharField(max_length=255)
    client_role = models.CharField(max_length=255, blank=True)  # Made optional
    client_company = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    avatar_url = models.URLField(blank=True)
    project_type = models.CharField(max_length=100, blank=True)
    service = models.ForeignKey('services.Service', on_delete=models.SET_NULL, null=True, blank=True, related_name='testimonials')
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)  # Made required
    consent_to_display = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "testimonials"
        ordering = ['-is_featured', '-created_at']
    
    def __str__(self):
        return f"{self.client_name} - {self.rating} stars"