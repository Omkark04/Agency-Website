# orders/models.py
from django.db import models
from django.utils import timezone
import json

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

class Offer(models.Model):
    OFFER_TYPES = [
        ("seasonal", "Seasonal Offer"),
        ("limited", "Limited Time"),
        ("bundle", "Bundle Offer"),
        ("launch", "Launch Offer"),
    ]
    
    DISCOUNT_TYPES = [
        ("percent", "Percentage"),
        ("flat", "Flat Amount"),
    ]
    
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True, default='')
    image = models.ImageField(upload_to="offers/", null=True, blank=True)
    
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPES, default="seasonal")
    
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default="percent")
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    discount_code = models.CharField(max_length=50, blank=True, default='')
    terms = models.TextField(blank=True, default='')
    
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    priority = models.IntegerField(default=0)
    
    cta_text = models.CharField(max_length=100, default="Claim Offer")
    cta_link = models.URLField(blank=True, default='')
    
    # Design fields (optional, for backward compatibility)
    icon_name = models.CharField(max_length=50, default='FiTag', blank=True)
    gradient_colors = models.CharField(max_length=100, default='from-red-500 to-orange-500', blank=True)
    button_text = models.CharField(max_length=50, default='Claim Offer', blank=True)
    button_url = models.URLField(blank=True, default='')
    features = models.TextField(default='[]')  # Store as JSON string
    conditions = models.TextField(default='[]')  # Store as JSON string
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "offers"
        ordering = ['priority', '-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-update updated_at on save
        if self.pk:
            self.updated_at = timezone.now()
        
        # Calculate discounted price if not set
        if self.original_price and not self.discounted_price:
            if self.discount_type == 'percent':
                discount_amount = (self.original_price * self.discount_value) / 100
                self.discounted_price = self.original_price - discount_amount
            elif self.discount_type == 'flat':
                self.discounted_price = self.original_price - self.discount_value
        
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
    
    @property
    def discount_percentage(self):
        if self.discount_type == 'percent':
            return float(self.discount_value)
        elif self.original_price and self.discounted_price:
            return float(((self.original_price - self.discounted_price) / self.original_price) * 100)
        return 0
    
    def __str__(self):
        return self.title