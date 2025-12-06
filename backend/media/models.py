from django.db import models

class Media(models.Model):
    MEDIA_TYPE_CHOICES = [
        ("image", "Image"),
        ("video", "Video"),
    ]
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="media_files")
    project = models.ForeignKey("portfolio.PortfolioProject", null=True, on_delete=models.CASCADE, related_name="media_files")
    service = models.ForeignKey("services.Service", null=True, on_delete=models.CASCADE, related_name="media_files")
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    url = models.TextField()
    thumbnail_url = models.TextField(blank=True, null=True)
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "media"
