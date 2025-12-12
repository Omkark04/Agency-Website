# orders/models.py
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.utils.text import slugify
import math


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("revision", "Revision"),
    ]
    id = models.AutoField(primary_key=True)
    client = models.ForeignKey(
        "accounts.User", 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="orders"
    )
    client_email = models.EmailField(blank=True)  # For guest orders from forms
    service = models.ForeignKey("services.Service", on_delete=models.CASCADE, related_name="orders")
    pricing_plan = models.ForeignKey("services.PriceCard", null=True, on_delete=models.SET_NULL, related_name="orders")
    title = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"


class Review(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey("portfolio.PortfolioProject", on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reviews"


# services/models.py  (or orders/models.py if you want to keep offers there)
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import math
from services.models import Service, Department

class Offer(models.Model):
    """
    Offer model: supports multi-service offers, image upload, creator tracking,
    approval workflow, and computed properties (remaining_days, discount_percentage).
    """

    OFFER_TYPES = [
        ("seasonal", "Seasonal Offer"),
        ("limited", "Limited Time"),
        ("bundle", "Bundle Offer"),
        ("launch", "Launch Offer"),
    ]

    DISCOUNT_TYPES = [
        ("percent", "Percentage"),
        ("flat", "Flat Amount"),
    ]

    id = models.AutoField(primary_key=True)

    # Core marketing fields
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    short_description = models.CharField(max_length=500, blank=True, default="")

    # Image handling (same pattern as other models)
    image = models.ImageField(upload_to="offers/", null=True, blank=True)

    # Offer categorization & services covered
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPES, default="seasonal")
    services = models.ManyToManyField(
        "services.Service",
        related_name="offers",
        blank=True,
        help_text="Services covered by this offer (can be multiple)."
    )

    # Pricing / discount
    original_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)]
    )
    discounted_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)]
    )

    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default="percent")
    discount_value = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )  # percentage (0-100) or flat amount depending on discount_type

    discount_code = models.CharField(max_length=50, blank=True, default="")
    terms = models.TextField(blank=True, default="")  # free-text T&C

    # Validity / timing
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField(null=True, blank=True)

    # Status & visibility
    is_active = models.BooleanField(default=True)       # soft toggle for public visibility
    is_featured = models.BooleanField(default=False)    # shown in featured carousels
    is_limited_time = models.BooleanField(default=False) # UX: special badge/priority
    is_approved = models.BooleanField(default=False)    # admin must approve before public listing

    # Creator/Audit (who created the offer)
    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_offers",
        help_text="User who created the offer (admin or team head)."
    )
    # Snapshot of creator's department to make filtering easier even if relationships change later
    created_by_department = models.ForeignKey(
        "services.Department",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="offers_created",
        help_text="Optional snapshot of department for the creator (useful for team-head scoping)."
    )

    # Approval metadata
    approved_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_offers",
        help_text="Admin who approved the offer."
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    # CTA and UI fields
    cta_text = models.CharField(max_length=100, default="Claim Offer")
    cta_link = models.URLField(blank=True, default="")

    icon_name = models.CharField(max_length=50, default="tag", blank=True)
    gradient_colors = models.CharField(max_length=100, default="from-red-500 to-orange-500", blank=True)
    button_text = models.CharField(max_length=50, default="Claim Offer", blank=True)
    button_url = models.URLField(blank=True, default="")

    # Structured arrays
    features = models.JSONField(default=list, blank=True)    # example: ["Free SSL", "1-year hosting"]
    conditions = models.JSONField(default=list, blank=True)  # example: ["New customers only"]

    # Priority & metadata
    priority = models.IntegerField(default=0, help_text="Higher priority shows earlier in ordered lists")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "offers"
        ordering = ["-priority", "-created_at"]
        indexes = [
            models.Index(fields=["is_active"]),
            models.Index(fields=["is_featured"]),
            models.Index(fields=["is_approved"]),
            models.Index(fields=["valid_to"]),
        ]

    def save(self, *args, **kwargs):
        """
        - Ensure slug uniqueness (naive loop; for high-concurrency use a pre-created unique field or transaction).
        - Auto-calc discounted_price when original_price present and discounted_price not provided.
        - Clamp discount_value when discount_type == 'percent' between 0 and 100.
        - Update approved_at when is_approved becomes True and approved_at is empty.
        """
        # Slug generation
        if not self.slug:
            base = (self.title or "offer")[:200]
            candidate = slugify(base)
            if not candidate:
                candidate = f"offer-{int(timezone.now().timestamp())}"
            slug_candidate = candidate
            counter = 0
            while Offer.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
                counter += 1
                slug_candidate = f"{candidate[:190]}-{counter}"
            self.slug = slug_candidate

        # Normalize discount value for percent
        if self.discount_type == "percent":
            try:
                dv = float(self.discount_value or 0)
            except Exception:
                dv = 0.0
            dv = max(0.0, min(100.0, dv))
            self.discount_value = dv

        # Auto-calc discounted_price
        if self.original_price is not None:
            # If discounted_price not provided or zero, calculate it
            if (self.discounted_price is None) or (float(self.discounted_price) <= 0):
                try:
                    op = float(self.original_price)
                    if self.discount_type == "percent":
                        new_price = op - ((op * float(self.discount_value)) / 100.0)
                    else:
                        new_price = op - float(self.discount_value or 0)
                    new_price = max(new_price, 0.0)
                    # Round to 2 decimals and set
                    self.discounted_price = round(new_price, 2)
                except Exception:
                    # do not break save on numeric errors
                    pass

        # If approved now but approved_at is empty, populate approved_at timestamp
        if self.is_approved and not self.approved_at:
            self.approved_at = timezone.now()

        super().save(*args, **kwargs)

    # --- Helper methods & properties ---

    @property
    def remaining_days(self):
        """Return remaining days (ceil). If valid_to is None => None (indefinite)."""
        if not self.valid_to:
            return None
        now = timezone.now()
        if now >= self.valid_to:
            return 0
        delta = self.valid_to - now
        return math.ceil(delta.total_seconds() / (24 * 3600))

    @property
    def is_expired(self):
        """True when current time is after valid_to."""
        if not self.valid_to:
            return False
        return timezone.now() > self.valid_to

    @property
    def is_currently_valid(self):
        """Offer is active, approved and in its validity window."""
        now = timezone.now()
        if not self.is_active or not self.is_approved:
            return False
        if self.valid_from and now < self.valid_from:
            return False
        if self.valid_to and now > self.valid_to:
            return False
        return True

    @property
    def discount_percentage(self):
        """Return percent equivalent of discount (float)."""
        try:
            if self.discount_type == "percent":
                return float(self.discount_value or 0)
            if self.original_price and self.discounted_price:
                op = float(self.original_price)
                dp = float(self.discounted_price)
                if op <= 0:
                    return 0.0
                return round(((op - dp) / op) * 100.0, 2)
        except Exception:
            return 0.0
        return 0.0

    # Convenience: check whether a given service is covered
    def includes_service(self, service_obj):
        return self.services.filter(pk=service_obj.pk).exists()

    def to_public_dict(self):
        """Lightweight dict useful for serializers / caching public offers."""
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "short_description": self.short_description,
            "description": self.description,
            "image": self.image.url if self.image else None,
            "offer_type": self.offer_type,
            "services": list(self.services.values("id", "title", "slug")),
            "original_price": float(self.original_price) if self.original_price is not None else None,
            "discounted_price": float(self.discounted_price) if self.discounted_price is not None else None,
            "discount_type": self.discount_type,
            "discount_value": float(self.discount_value or 0),
            "discount_code": self.discount_code,
            "cta_text": self.cta_text,
            "cta_link": self.cta_link,
            "is_active": self.is_active,
            "is_featured": self.is_featured,
            "is_limited_time": self.is_limited_time,
            "is_approved": self.is_approved,
            "remaining_days": self.remaining_days,
            "is_expired": self.is_expired,
            "features": self.features or [],
            "conditions": self.conditions or [],
            "icon_name": self.icon_name,
        }

    def __str__(self):
        return self.title
