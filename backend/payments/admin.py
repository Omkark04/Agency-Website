# payments/admin.py
from django.contrib import admin
from .models import PaymentRequest, PaymentOrder, Transaction, WebhookLog


@admin.register(PaymentRequest)
class PaymentRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'amount', 'currency', 'gateway', 'status', 'requested_by', 'created_at', 'expires_at']
    list_filter = ['status', 'gateway', 'created_at']
    search_fields = ['order__title', 'order__id', 'requested_by__email']
    readonly_fields = ['created_at', 'updated_at', 'paid_at']
    date_hierarchy = 'created_at'


@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'gateway_order_id', 'order', 'gateway', 'amount', 'currency', 'status', 'created_at']
    list_filter = ['gateway', 'status', 'created_at']
    search_fields = ['gateway_order_id', 'order__title', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


admin.site.register(Transaction)


@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'gateway', 'event_type', 'status', 'is_verified', 'created_at']
    list_filter = ['gateway', 'status', 'is_verified', 'created_at']
    search_fields = ['event_type', 'transaction__transaction_id']
    readonly_fields = ['created_at', 'processed_at']
    date_hierarchy = 'created_at'