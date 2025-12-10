from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)

    ROLE_CHOICES = [
        ("client", "Client"),
        ("admin", "Admin"),
        ("service_head", "Service Head"),
        ("team_member", "Team Member"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="client")
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)

    service = models.ForeignKey(
        "services.Service",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="team_heads"
    )

    # Account lockout fields
    failed_login_attempts = models.IntegerField(default=0)
    lockout_until = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def clean(self):
        # ✅ ENFORCE SINGLE ADMIN
        if self.role == "admin":
            existing_admin = User.objects.filter(role="admin").exclude(pk=self.pk)
            if existing_admin.exists():
                raise ValidationError("Only ONE admin user is allowed in the system.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

    def is_locked_out(self):
        """Check if the account is currently locked out."""
        if self.lockout_until and self.lockout_until > timezone.now():
            return True
        return False

    def increment_failed_login(self):
        """Increment failed login attempts and lock account if threshold reached."""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:  # Lock after 5 failed attempts
            self.lockout_until = timezone.now() + timedelta(minutes=15)  # 15 minute lockout
        self.save()

    def reset_failed_login(self):
        """Reset failed login attempts after successful login."""
        self.failed_login_attempts = 0
        self.lockout_until = None
        self.save()

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
