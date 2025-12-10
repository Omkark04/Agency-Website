# notifications/tasks.py
"""
Celery tasks for notifications app.
Background tasks for sending emails and creating notifications.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


@shared_task
def send_email_notification(subject, message, recipient_email):
    """
    Send email notification asynchronously.
    
    Args:
        subject: Email subject
        message: Email body
        recipient_email: Recipient email address
    
    Returns:
        bool: True if sent successfully
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        # Log the error (you can add proper logging here)
        print(f"Failed to send email to {recipient_email}: {str(e)}")
        return False


@shared_task
def create_notification_task(user_id, title, message, notification_type='system', order_id=None, task_id=None):
    """
    Create a notification asynchronously.
    
    Args:
        user_id: User ID to create notification for
        title: Notification title
        message: Notification message
        notification_type: Type of notification
        order_id: Optional order ID
        task_id: Optional task ID
    
    Returns:
        int: Created notification ID
    """
    try:
        user = User.objects.get(id=user_id)
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            order_id=order_id,
            task_id=task_id
        )
        return notification.id
    except User.DoesNotExist:
        print(f"User {user_id} not found")
        return None
    except Exception as e:
        print(f"Failed to create notification: {str(e)}")
        return None


@shared_task
def send_notification_with_email(user_id, title, message, notification_type='system', send_email=True):
    """
    Create notification and optionally send email.
    
    Args:
        user_id: User ID
        title: Notification title
        message: Notification message
        notification_type: Type of notification
        send_email: Whether to also send email
    
    Returns:
        dict: Result with notification_id and email_sent status
    """
    # Create notification
    notification_id = create_notification_task(user_id, title, message, notification_type)
    
    result = {
        'notification_id': notification_id,
        'email_sent': False
    }
    
    if send_email and notification_id:
        try:
            user = User.objects.get(id=user_id)
            email_sent = send_email_notification(
                subject=title,
                message=message,
                recipient_email=user.email
            )
            result['email_sent'] = email_sent
        except User.DoesNotExist:
            pass
    
    return result


@shared_task
def bulk_create_notifications(user_ids, title, message, notification_type='system'):
    """
    Create notifications for multiple users.
    
    Args:
        user_ids: List of user IDs
        title: Notification title
        message: Notification message
        notification_type: Type of notification
    
    Returns:
        dict: Count of created notifications
    """
    created_count = 0
    for user_id in user_ids:
        notification_id = create_notification_task(user_id, title, message, notification_type)
        if notification_id:
            created_count += 1
    
    return {
        'total_users': len(user_ids),
        'created_count': created_count
    }
