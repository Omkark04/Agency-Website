from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class PaymentOrder(models.Model):
    """
    Represents a payment order created before actual payment.
    This is the initial step in the payment flow.
    """
    STATUS_CHOICES = [
        ("created", "Created"),
        ("attempted", "Attempted"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("expired", "Expired"),
    ]
    
    GATEWAY_CHOICES = [
        ("razorpay", "Razorpay"),
        ("paypal", "PayPal"),
    ]
    
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(
        "orders.Order", 
        on_delete=models.CASCADE, 
        related_name="payment_orders"
    )
    user = models.ForeignKey(
        "accounts.User", 
        on_delete=models.CASCADE, 
        related_name="payment_orders"
    )
    
    # Gateway details
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    gateway_order_id = models.CharField(max_length=255, unique=True)
    
    # Amount details
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default="INR")  # INR, USD, etc.
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = "payment_orders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["gateway_order_id"]),
            models.Index(fields=["status"]),
            models.Index(fields=["order"]),
        ]
    
    def __str__(self):
        return f"{self.gateway} - {self.gateway_order_id} - {self.amount} {self.currency}"
    
    def is_expired(self):
        """Check if payment order has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class Transaction(models.Model):
    """
    Represents an actual payment transaction.
    Created after payment is attempted/completed.
    """
    GATEWAY_CHOICES = [
        ("razorpay", "Razorpay"),
        ("paypal", "PayPal"),
    ]
    
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
        ("partially_refunded", "Partially Refunded"),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ("card", "Credit/Debit Card"),
        ("upi", "UPI"),
        ("netbanking", "Net Banking"),
        ("wallet", "Wallet"),
        ("paypal", "PayPal"),
        ("other", "Other"),
    ]
    
    id = models.AutoField(primary_key=True)
    
    # Relations
    order = models.ForeignKey(
        "orders.Order", 
        on_delete=models.CASCADE, 
        related_name="transactions"
    )
    user = models.ForeignKey(
        "accounts.User", 
        on_delete=models.CASCADE, 
        related_name="transactions"
    )
    payment_order = models.ForeignKey(
        PaymentOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions"
    )
    
    # Gateway details
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    transaction_id = models.CharField(max_length=255, unique=True, db_index=True)
    
    # Payment verification
    signature = models.CharField(max_length=500, blank=True)
    is_verified = models.BooleanField(default=False)
    
    # Amount details
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default="INR")
    
    # Payment method
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES,
        default="other"
    )
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    # Error handling
    error_code = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    
    # Retry mechanism
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    
    # Refund tracking
    refund_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    refund_reason = models.TextField(blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    
    # Gateway response
    gateway_response = models.JSONField(default=dict, blank=True)
    
    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = "transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["transaction_id"]),
            models.Index(fields=["status"]),
            models.Index(fields=["gateway"]),
            models.Index(fields=["order"]),
            models.Index(fields=["is_verified"]),
        ]
    
    def __str__(self):
        return f"{self.gateway} - {self.transaction_id} - {self.status}"
    
    def can_retry(self):
        """Check if transaction can be retried"""
        return self.status == "failed" and self.retry_count < self.max_retries
    
    def mark_success(self):
        """Mark transaction as successful"""
        self.status = "success"
        self.is_verified = True
        self.completed_at = timezone.now()
        self.save()
    
    def mark_failed(self, error_code="", error_message=""):
        """Mark transaction as failed"""
        self.status = "failed"
        self.error_code = error_code
        self.error_message = error_message
        self.save()


class WebhookLog(models.Model):
    """
    Log all webhook calls for debugging and audit trail
    """
    GATEWAY_CHOICES = [
        ("razorpay", "Razorpay"),
        ("paypal", "PayPal"),
    ]
    
    STATUS_CHOICES = [
        ("received", "Received"),
        ("processing", "Processing"),
        ("processed", "Processed"),
        ("failed", "Failed"),
        ("ignored", "Ignored"),
    ]
    
    id = models.AutoField(primary_key=True)
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    event_type = models.CharField(max_length=100)
    
    # Webhook data
    payload = models.JSONField(default=dict)
    headers = models.JSONField(default=dict)
    
    # Verification
    signature = models.CharField(max_length=500, blank=True)
    is_verified = models.BooleanField(default=False)
    
    # Processing status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="received")
    
    # Related transaction (if found)
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="webhook_logs"
    )
    
    # Error tracking
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = "webhook_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["gateway"]),
            models.Index(fields=["event_type"]),
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
        ]
    
    def __str__(self):
        return f"{self.gateway} - {self.event_type} - {self.status}"
