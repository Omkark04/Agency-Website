from django.contrib import admin
from .models import Service, PricingPlan

# Register your models here.
admin.site.register(Service)
admin.site.register(PricingPlan)