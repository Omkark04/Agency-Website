from django.contrib import admin
from .models import Offer, Order, Review
from .estimation_models import Estimation, Invoice
# Register your models here.
admin.site.register(Offer)
admin.site.register(Review)
admin.site.register(Order)
admin.site.register(Estimation)
admin.site.register(Invoice)