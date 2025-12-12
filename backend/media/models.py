from django.db import models

class Media(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),  # Add document type
    ]

    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True, blank=True)
    project = models.ForeignKey("portfolio.PortfolioProject", null=True, blank=True, on_delete=models.SET_NULL)
    service = models.ForeignKey("services.Service", null=True, blank=True, on_delete=models.SET_NULL)
    
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    url = models.URLField()  # Cloudinary URL
    thumbnail_url = models.URLField(blank=True)
    
    # Add these missing fields
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.IntegerField(null=True, blank=True)  # Store size in bytes
    mime_type = models.CharField(max_length=100, blank=True)
    public_id = models.CharField(max_length=255, blank=True)  # Cloudinary public ID
    
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'media'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.file_name or 'Media'} ({self.media_type})"
    
    @property
    def formatted_size(self):
        """Return human-readable file size"""
        if not self.file_size:
            return "0 Bytes"
        for unit in ['Bytes', 'KB', 'MB', 'GB']:
            if self.file_size < 1024.0:
                return f"{self.file_size:.2f} {unit}"
            self.file_size /= 1024.0
        return f"{self.file_size:.2f} TB"