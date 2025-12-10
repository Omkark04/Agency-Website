from django.db import models
from django.utils import timezone


class ContactSubmission(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)

    # ✅ Link to actual Service model (dynamic services)
    service = models.ForeignKey(
        "services.Service",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_requests"
    )

    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    is_contacted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.service.title if self.service else 'No Service'}"

    class Meta:
        ordering = ['-created_at']
