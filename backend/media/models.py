from django.db import models

class Media(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    id = models.AutoField(primary_key=True)
    owner_id = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='media_files')
    project_id = models.ForeignKey('portfolio.PortfolioProject', null=True, on_delete=models.CASCADE, related_name='media_files')
    service_id = models.ForeignKey('services.Service', null=True, on_delete=models.CASCADE, related_name='media_files')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    url = models.TextField()
    thumbnail_url = models.TextField(blank=True)
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'media'
