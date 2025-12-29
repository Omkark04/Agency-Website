# payments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'payment-orders', views.PaymentOrderViewSet, basename='payment-order')

urlpatterns = [
    path('', include(router.urls)),
    path('create-order/', views.PaymentOrderViewSet.as_view({'post': 'create_order'}), name='create-payment-order'),
    path('request-payment/', views.create_payment_request, name='request-payment'),
    path('requests/', views.list_payment_requests, name='list-payment-requests'),
    path('transactions/', views.list_transactions, name='list-transactions'),
    path('verify/', views.verify_payment, name='verify-payment'),
    path('webhook/razorpay/', views.razorpay_webhook, name='razorpay-webhook'),
    path('webhook/paypal/', views.paypal_webhook, name='paypal-webhook'),
    path('order/<int:order_id>/transactions/', views.order_transactions, name='order-transactions'),
    path('retry/<int:transaction_id>/', views.retry_payment, name='retry-payment'),
    path('receipt/<str:transaction_id>/', views.download_receipt, name='download-receipt'),
]
