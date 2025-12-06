from django.contrib import admin
from .models import PriceCard, Service, Department

# Register your models here.
admin.site.register(Service)
admin.site.register(PriceCard)
admin.site.register(Department)