from django.contrib import admin
from .models import Offer, Order, Review
# Register your models here.
admin.site.register(Offer)
admin.site.register(Review)
admin.site.register(Order)