from django.db import models

class Media(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    id = models.AutoField(primary_key=True)

    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    project = models.ForeignKey("portfolio.PortfolioProject", null=True, blank=True, on_delete=models.SET_NULL)
    service = models.ForeignKey("services.Service", null=True, blank=True, on_delete=models.SET_NULL)

    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    url = models.URLField()  # Cloudinary URL
    thumbnail_url = models.URLField(blank=True)

    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'media'
