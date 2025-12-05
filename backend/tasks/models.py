from django.db import models

class Task(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey('accounts.User', null=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20)
    priority = models.SmallIntegerField(default=2)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Create your models here.
