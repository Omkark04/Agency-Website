from django.db import models

class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("revision", "Revision"),
    ]
    id = models.AutoField(primary_key=True)
    client = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="orders")
    service = models.ForeignKey("services.Service", on_delete=models.CASCADE, related_name="orders")
    pricing_plan = models.ForeignKey("services.PriceCard", null=True, on_delete=models.SET_NULL, related_name="orders")
    title = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"

class Review(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey("portfolio.PortfolioProject", on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reviews"

import json

from django.db import models
from django.utils import timezone
import json

class Offer(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True, default='')
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    discount_code = models.CharField(max_length=50, blank=True, default='')
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_limited_time = models.BooleanField(default=False)
    icon_name = models.CharField(max_length=50, default='FiTag')
    gradient_colors = models.CharField(max_length=100, default='from-red-500 to-orange-500')
    button_text = models.CharField(max_length=50, default='Claim Offer')
    button_url = models.URLField(blank=True, default='')
    order_index = models.IntegerField(default=0)
    features = models.TextField(default='[]')  # Store as JSON string
    conditions = models.TextField(default='[]')  # Store as JSON string
    
    # REMOVE auto_now_add and auto_now for now, add them in a separate migration
    created_at = models.DateTimeField(default=timezone.now)  # Changed from auto_now_add
    updated_at = models.DateTimeField(default=timezone.now)  # Changed from auto_now

    class Meta:
        db_table = "offers"
        ordering = ['order_index', '-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-update updated_at on save
        if self.pk:
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)
    
    def get_features(self):
        try:
            return json.loads(self.features)
        except:
            return []
    
    def get_conditions(self):
        try:
            return json.loads(self.conditions)
        except:
            return []
    
    def set_features(self, features_list):
        self.features = json.dumps(features_list)
    
    def set_conditions(self, conditions_list):
        self.conditions = json.dumps(conditions_list)
    
    @property
    def remaining_days(self):
        now = timezone.now()
        if self.valid_to < now:
            return 0
        delta = self.valid_to - now
        return delta.days
    
    @property
    def is_expired(self):
        return self.valid_to < timezone.now()