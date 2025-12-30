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

    priority = models.PositiveIntegerField(
        default=999,
        unique=True,
        help_text="Display priority (lower number = higher priority, must be unique)"
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
        ordering = ["priority", "title"]
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
            models.Index(fields=['priority']),
        ]
class Service(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    logo = models.URLField(null=True, blank=True)

    short_description = models.TextField(blank=True)
    long_description = models.TextField(blank=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="services"
    )

    team_members = models.ManyToManyField(
        "accounts.User",
        blank=True,
        related_name="assigned_services",
        limit_choices_to={'role': 'team_member'},
        help_text="Team members assigned to this service"
    )

    priority = models.PositiveIntegerField(
        default=999,
        unique=True,
        help_text="Display priority within department (lower number = higher priority, must be unique)"
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
        ordering = ["department__priority", "priority", "title"]
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['department', 'is_active']),
            models.Index(fields=['created_at']),
            models.Index(fields=['priority']),
        ]

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
from django.db import models

# Add these models to your existing services/models.py

class PricingPlan(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.CharField(max_length=50)  # Could be "Custom" or "$499"
    price_numeric = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    billing_period = models.CharField(max_length=20, choices=[
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('one_time', 'One Time')
    ], default='one_time')
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    features = models.JSONField(default=list, blank=True)
    gradient_colors = models.CharField(max_length=100, default='from-blue-500 to-purple-500')
    button_text = models.CharField(max_length=50, default='Get Started')
    service = models.ForeignKey('Service', on_delete=models.SET_NULL, null=True, blank=True, related_name='pricing_plans')
    order_index = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "pricing_plans"
        ordering = ['order_index', 'price_numeric']
    
    def __str__(self):
        return f"{self.title} - {self.price}"

class PricingComparison(models.Model):
    id = models.AutoField(primary_key=True)
    feature = models.CharField(max_length=255)
    basic = models.CharField(max_length=255)
    growth = models.CharField(max_length=255)
    enterprise = models.CharField(max_length=255)
    is_important = models.BooleanField(default=False)
    order_index = models.IntegerField(default=0)
    
    class Meta:
        db_table = "pricing_comparisons"
        ordering = ['order_index']
    
    def __str__(self):
        return self.feature

