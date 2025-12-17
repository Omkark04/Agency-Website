from django.db import models
from django.utils.text import slugify
from django.utils import timezone


class Blog(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, max_length=255)
    excerpt = models.TextField(max_length=500, help_text="Short description for preview")
    content = models.TextField(help_text="Full blog content (supports rich text)")
    
    author = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="blog_posts"
    )
    
    category = models.CharField(max_length=100, blank=True)
    featured_image = models.URLField(blank=True, help_text="URL to featured image (Cloudinary)")
    gallery_images = models.JSONField(default=list, blank=True, help_text="Array of image URLs")
    tags = models.JSONField(default=list, blank=True, help_text="Array of tag strings")
    
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "blogs"
        ordering = ['-is_featured', '-published_at', '-created_at']
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Auto-generate slug from title if not provided
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Blog.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        # Set published_at when first published
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
