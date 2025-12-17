from django.db import models
from django.utils import timezone


class NewsletterSubscription(models.Model):
    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="newsletter_subscription"
    )
    subscribed_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = "newsletter_subscriptions"
        verbose_name = "Newsletter Subscription"
        verbose_name_plural = "Newsletter Subscriptions"
    
    def __str__(self):
        return f"{self.user.email} - {'Active' if self.is_active else 'Inactive'}"
