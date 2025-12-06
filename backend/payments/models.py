from django.db import models

class Transaction(models.Model):
    GATEWAY_CHOICES = [
        ('stripe', 'Stripe'),
        ('razorpay', 'Razorpay'),
    ]
    id = models.AutoField(primary_key=True)
    order_id = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='transactions')
    user_id = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    gateway_response = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transactions'
