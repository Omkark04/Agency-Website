# orders/workflow_models.py
from django.db import models
from django.utils import timezone


class OrderStatusHistory(models.Model):
    """
    Track all status changes for orders with complete audit trail
    """
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="status_history"
    )
    
    # Status transition
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    
    # Who made the change
    changed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_status_changes"
    )
    
    # Additional context
    notes = models.TextField(blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "order_status_history"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["order", "-timestamp"]),
            models.Index(fields=["to_status"]),
            models.Index(fields=["changed_by"]),
        ]
        verbose_name_plural = "Order Status Histories"
    
    def __str__(self):
        return f"Order #{self.order_id}: {self.from_status} → {self.to_status}"
