from django.db import models
from django.utils.text import slugify

class Department(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    logo = models.URLField(null=True, blank=True)
    short_description = models.TextField(blank=True)

    # Team Head assignment → must be a user with role = service_head
    team_head = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="departments_managed"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "departments"
        ordering = ["title"]
class Service(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    logo = models.ImageField(upload_to="services/logos/", null=True, blank=True)

    short_description = models.TextField(blank=True)
    long_description = models.TextField(blank=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="services"
    )

    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_services"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "services"
        ordering = ["department", "title"]

class PriceCard(models.Model):
    PLAN_CHOICES = [
        ("basic", "Basic"),
        ("medium", "Medium"),
        ("premium", "Premium"),
    ]

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=20, choices=PLAN_CHOICES)
    
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="price_cards"
    )

    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="price_cards"
    )

    price = models.DecimalField(max_digits=12, decimal_places=2)
    revisions = models.PositiveIntegerField(default=1)
    
    description = models.TextField(blank=True)
    features = models.JSONField(blank=True, null=True)  # list of bullet points
    
    delivery_days = models.PositiveIntegerField(default=7)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.service.title}"

    class Meta:
        db_table = "price_cards"
        unique_together = ("title", "service")  # Basic/Medium/Premium must be unique per service
