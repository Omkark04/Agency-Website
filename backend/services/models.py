from django.db import models

class Service(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    short_desc = models.TextField(blank=True)
    long_desc = models.TextField(blank=True)
    created_by = models.ForeignKey('accounts.User', null=True, on_delete=models.SET_NULL, related_name='created_services')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'services'

class PricingPlan(models.Model):
    id = models.AutoField(primary_key=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='pricing_plans')
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_days = models.IntegerField()
    details = models.TextField(blank=True)
    extras = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pricing_plans'
