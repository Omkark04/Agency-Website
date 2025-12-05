from django.db import models

class PortfolioProject(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    service = models.ForeignKey('services.Service', on_delete=models.SET_NULL, null=True)
    client_name = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# Create your models here.
