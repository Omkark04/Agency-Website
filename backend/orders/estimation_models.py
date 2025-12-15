# orders/estimation_models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


class Estimation(models.Model):
    """
    Service estimation with cost breakdown and PDF generation
    """
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent to Client"),
        ("approved", "Approved by Client"),
        ("rejected", "Rejected by Client"),
        ("expired", "Expired"),
    ]
    
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Relations
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="estimations"
    )
    
    # Basic details
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Cost breakdown - JSONField with structure:
    # [{"item": "Design", "description": "UI/UX Design", "quantity": 1, "rate": 5000, "amount": 5000}]
    cost_breakdown = models.JSONField(default=list, blank=True)
    
    # Calculated amounts
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Timeline
    estimated_timeline_days = models.IntegerField(
        default=7,
        validators=[MinValueValidator(1)]
    )
    
    # Validity
    valid_until = models.DateField(null=True, blank=True)
    
    # PDF storage
    pdf_url = models.URLField(blank=True, help_text="Cloudinary URL for generated PDF")
    pdf_public_id = models.CharField(max_length=255, blank=True, help_text="Cloudinary public ID")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    
    # Tracking
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_estimations"
    )
    
    # Notes
    internal_notes = models.TextField(blank=True, help_text="Internal notes not visible to client")
    client_notes = models.TextField(blank=True, help_text="Notes visible to client")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = "estimations"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order"]),
            models.Index(fields=["status"]),
            models.Index(fields=["uuid"]),
        ]
    
    def __str__(self):
        return f"Estimation for Order #{self.order_id} - {self.title}"
    
    def calculate_totals(self):
        """Calculate subtotal, tax, and total amounts"""
        from decimal import Decimal
        
        # Calculate subtotal from cost breakdown
        self.subtotal = sum(item.get('amount', 0) for item in self.cost_breakdown)
        
        # Calculate tax amount - convert subtotal to Decimal to match tax_percentage type
        self.tax_amount = (Decimal(str(self.subtotal)) * self.tax_percentage) / 100
        self.total_amount = self.subtotal + self.tax_amount
    
    def save(self, *args, **kwargs):
        # Auto-calculate totals before saving
        self.calculate_totals()
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Check if estimation has expired"""
        if self.valid_until:
            return timezone.now().date() > self.valid_until
        return False


class Invoice(models.Model):
    """
    Invoice generation for completed orders
    """
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent to Client"),
        ("pending", "Payment Pending"),
        ("partial", "Partially Paid"),
        ("paid", "Fully Paid"),
        ("overdue", "Overdue"),
        ("cancelled", "Cancelled"),
    ]
    
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Relations
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="invoices"
    )
    estimation = models.ForeignKey(
        Estimation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices"
    )
    
    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    
    # Line items - JSONField with structure:
    # [{"item": "Web Development", "description": "Full stack development", "quantity": 1, "rate": 50000, "amount": 50000}]
    line_items = models.JSONField(default=list, blank=True)
    
    # Amounts
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Payment tracking
    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Dates
    invoice_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    
    # PDF storage
    pdf_url = models.URLField(blank=True, help_text="Cloudinary URL for generated PDF")
    pdf_public_id = models.CharField(max_length=255, blank=True, help_text="Cloudinary public ID")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    
    # Tracking
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_invoices"
    )
    
    # Notes
    notes = models.TextField(blank=True)
    terms_and_conditions = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = "invoices"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["invoice_number"]),
            models.Index(fields=["order"]),
            models.Index(fields=["status"]),
            models.Index(fields=["uuid"]),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - Order #{self.order_id}"
    
    def calculate_totals(self):
        """Calculate subtotal, tax, and total from line items"""
        from decimal import Decimal
        
        self.subtotal = sum(
            float(item.get("amount", 0)) 
            for item in self.line_items
        )
        # Convert subtotal to Decimal to match tax_percentage type
        self.tax_amount = (Decimal(str(self.subtotal)) * self.tax_percentage) / 100
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
    
    def save(self, *args, **kwargs):
        # Generate invoice number if not exists
        if not self.invoice_number:
            # Format: INV-YYYYMMDD-XXXX
            today = timezone.now().strftime("%Y%m%d")
            last_invoice = Invoice.objects.filter(
                invoice_number__startswith=f"INV-{today}"
            ).order_by("-invoice_number").first()
            
            if last_invoice:
                last_num = int(last_invoice.invoice_number.split("-")[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.invoice_number = f"INV-{today}-{new_num:04d}"
        
        # Auto-calculate totals
        self.calculate_totals()
        
        # Update status based on payment
        if self.amount_paid >= self.total_amount:
            self.status = "paid"
            if not self.paid_at:
                self.paid_at = timezone.now()
        elif self.amount_paid > 0:
            self.status = "partial"
        
        super().save(*args, **kwargs)
    
    @property
    def balance_due(self):
        """Calculate remaining balance"""
        return self.total_amount - self.amount_paid
    
    def is_overdue(self):
        """Check if invoice is overdue"""
        if self.due_date and self.status not in ["paid", "cancelled"]:
            return timezone.now().date() > self.due_date
        return False
