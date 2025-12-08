from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser


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

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
