# orders/estimation_models.py
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid


def get_today():
    """Helper function to get today's date for invoice_date default"""
    return timezone.now().date()


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
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Discount amount to be deducted from subtotal"
    )
    
    # Timeline
    estimated_timeline_days = models.IntegerField(
        default=7,
        validators=[MinValueValidator(1)]
    )
    delivery_date = models.DateField(
        null=True,
        blank=True,
        help_text="Expected delivery date for the project"
    )
    
    # Sender Details (Department Head)
    department_head_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Name of department head sending the estimation"
    )
    department_head_email = models.EmailField(
        blank=True,
        help_text="Email of department head"
    )
    department_head_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Phone number of department head"
    )
    
    # Client Details (for PDF)
    client_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Client's full name for estimation PDF"
    )
    client_email = models.EmailField(
        blank=True,
        help_text="Client's email for estimation PDF"
    )
    client_address = models.TextField(
        blank=True,
        help_text="Client's full address for estimation PDF"
    )
    client_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Client's phone number for estimation PDF"
    )
    
    # PDF storage (Dropbox)
    pdf_url = models.URLField(blank=True, help_text="Dropbox download URL for generated PDF")
    pdf_file_path = models.CharField(max_length=500, blank=True, help_text="Dropbox file path")
    
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
        
        # Convert subtotal to Decimal to ensure correct arithmetic
        self.subtotal = Decimal(str(self.subtotal))
        
        # Calculate tax amount
        self.tax_amount = (self.subtotal * self.tax_percentage) / 100
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
    
    def save(self, *args, **kwargs):
        # Auto-calculate totals before saving
        self.calculate_totals()
        super().save(*args, **kwargs)
    



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
    invoice_date = models.DateField(default=get_today)
    due_date = models.DateField(null=True, blank=True)
    
    # PDF storage (Dropbox)
    pdf_url = models.URLField(blank=True, help_text="Dropbox download URL for generated PDF")
    pdf_file_path = models.CharField(max_length=500, blank=True, help_text="Dropbox file path")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    
    # Tracking
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_invoices"
    )
    
    # Sender Details (Department Head)
    department_head_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Name of department head sending the invoice"
    )
    department_head_email = models.EmailField(
        blank=True,
        help_text="Email of department head"
    )
    department_head_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Phone number of department head"
    )
    
    # Client Details (for PDF)
    client_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Client's full name for invoice PDF"
    )
    client_email = models.EmailField(
        blank=True,
        help_text="Client's email for invoice PDF"
    )
    client_address = models.TextField(
        blank=True,
        help_text="Client's full address for invoice PDF"
    )
    client_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Client's phone number for invoice PDF"
    )
    
    # Signature Details
    chairperson_name = models.CharField(
        max_length=255,
        default="Omkar Vaijanath Kangule",
        help_text="Name of chairperson for signature"
    )
    vice_chairperson_name = models.CharField(
        max_length=255,
        default="Rahul Vishnu Bhatambare",
        help_text="Name of vice-chairperson for signature"
    )
    
    # Notes
    notes = models.TextField(blank=True)
    terms_and_conditions = models.TextField(blank=True)
    referral_policies = models.TextField(
        blank=True,
        help_text="Referral policies and team notes"
    )
    
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
        # Convert subtotal to Decimal to ensure correct arithmetic
        self.subtotal = Decimal(str(self.subtotal))
        
        # Calculate tax amount
        self.tax_amount = (self.subtotal * self.tax_percentage) / 100
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
