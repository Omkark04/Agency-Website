# portfolio/models.py
from django.db import models

class PortfolioProject(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)

    slug = models.SlugField(unique=True, blank=True)

    description = models.TextField(blank=True)

    service = models.ForeignKey(
        "services.Service",
        on_delete=models.SET_NULL,
        null=True,
        related_name="portfolio_projects"
    )

    client_name = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_projects"
    )

    is_featured = models.BooleanField(default=False)

    # ✅ CHANGE TO URLField (YOU ALREADY UPLOAD TO CLOUDINARY)
    featured_image = models.URLField()

    images = models.JSONField(default=list, blank=True)

    video = models.URLField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "portfolio_projects"

    def __str__(self):
        return self.title
from django.db import models

# Add this to your existing portfolio/models.py

class CaseStudy(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    full_description = models.TextField(blank=True)
    client_name = models.CharField(max_length=255)
    client_logo = models.URLField(blank=True)
    category = models.CharField(max_length=100)
    service = models.ForeignKey('services.Service', on_delete=models.SET_NULL, null=True, blank=True)
    featured_image = models.URLField()
    gallery_images = models.JSONField(default=list, blank=True)
    technologies = models.JSONField(default=list, blank=True)
    duration = models.CharField(max_length=100)
    results = models.TextField()
    metrics = models.JSONField(default=list, blank=True)
    challenges = models.JSONField(default=list, blank=True)
    solutions = models.JSONField(default=list, blank=True)
    testimonial = models.ForeignKey('testimonials.Testimonial', on_delete=models.SET_NULL, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "case_studies"
        verbose_name_plural = "Case Studies"
        ordering = ['-is_featured', '-created_at']
    
    def __str__(self):
        return self.title