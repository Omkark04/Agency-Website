from django.db import models
from cloudinary.models import CloudinaryField

class PortfolioProject(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    service = models.ForeignKey("services.Service", on_delete=models.SET_NULL, null=True, related_name="portfolio_projects")
    client_name = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, related_name="created_projects")
    is_featured = models.BooleanField(default=False)
    
    # Image fields for portfolio project
    featured_image = CloudinaryField('image', null=True, blank=True)
    images = models.JSONField(default=list, blank=True, help_text="List of Cloudinary URLs for project images")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "portfolio_projects"
