from django.db import models

class Media(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    project = models.ForeignKey('portfolio.PortfolioProject', null=True, on_delete=models.CASCADE)
    service = models.ForeignKey('services.Service', null=True, on_delete=models.CASCADE)
    media_type = models.CharField(max_length=10)
    url = models.TextField()
    thumbnail_url = models.TextField(blank=True)
    caption = models.CharField(max_length=255, blank=True)
    size_bytes = models.BigIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Create your models here.
