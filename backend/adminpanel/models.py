import uuid
from django.db import models
from services.models import Service

class Offer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    discount_percent = models.PositiveIntegerField()
    valid_till = models.DateField()
    banner_url = models.TextField(blank=True, null=True)
    applicable_services = models.ManyToManyField(Service)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
