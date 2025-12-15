# tasks/urls_order_tasks.py
# Separate URL file for order-specific task endpoints
# This is included from orders/urls.py to maintain RESTful structure

from django.urls import path
from . import views

urlpatterns = [
    path('', views.order_tasks, name='order-tasks'),
]
