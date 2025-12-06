# accounts/models.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom user model.
    - We keep username for compatibility, but use email as unique identifier.
    """
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

    # Optional link to the Service this user heads (only for service_head)
    service = models.ForeignKey(
        "services.Service", on_delete=models.SET_NULL, null=True, blank=True, related_name="team_heads"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
