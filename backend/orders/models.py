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
    pricing_plan = models.ForeignKey("services.PricingPlan", null=True, on_delete=models.SET_NULL, related_name="orders")
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
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "offers"
