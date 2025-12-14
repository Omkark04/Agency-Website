from django.db import models
from cloudinary.models import CloudinaryField

class Task(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("done", "Done"),
    ]
    PRIORITY_CHOICES = [(1, "Low"), (2, "Medium"), (3, "High"), (4, "Urgent")]

    id = models.AutoField(primary_key=True)
    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey("accounts.User", null=True, on_delete=models.SET_NULL, related_name="assigned_tasks")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    priority = models.SmallIntegerField(choices=PRIORITY_CHOICES, default=2)
    due_date = models.DateField(null=True, blank=True)
    
    # File attachments for tasks
    attachments = models.JSONField(default=list, blank=True, help_text="List of Cloudinary URLs for task attachments")
    
    # Tracking
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tasks"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "tasks"
        ordering = ["-priority", "due_date", "-created_at"]
    
    def __str__(self):
        return f"Task #{self.id} - {self.title}"
    
    def save(self, *args, **kwargs):
        # Auto-set completed_at when status changes to done
        if self.status == "done" and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
        elif self.status != "done":
            self.completed_at = None
        super().save(*args, **kwargs)
    
    def can_edit(self, user):
        """Check if user can edit this task"""
        if user.role in ["admin", "service_head"]:
            return True
        # Team members can edit tasks assigned to them
        if user.role == "team_member" and self.assignee == user:
            return True
        return False
    
    def can_view(self, user):
        """Check if user can view this task"""
        # Admin and service heads can view all tasks
        if user.role in ["admin", "service_head"]:
            return True
        # Clients can view tasks for their orders
        if user.role == "client" and self.order.client == user:
            return True
        # Team members can view tasks assigned to them
        if user.role == "team_member" and self.assignee == user:
            return True
        return False
