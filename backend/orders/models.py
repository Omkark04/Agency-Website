from django.db import models

class Order(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    client = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE)
    pricing_plan = models.ForeignKey('services.PricingPlan', null=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Create your models here.
