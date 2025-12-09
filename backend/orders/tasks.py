# orders/tasks.py
"""
Celery tasks for orders app.
Background tasks for order processing and notifications.
"""
from celery import shared_task
from django.contrib.auth import get_user_model
from notifications.tasks import send_notification_with_email

User = get_user_model()


@shared_task
def notify_order_status_change(order_id, new_status):
    """
    Notify client when order status changes.
    
    Args:
        order_id: Order ID
        new_status: New order status
    
    Returns:
        dict: Notification result
    """
    try:
        from orders.models import Order
        order = Order.objects.get(id=order_id)
        
        # Create notification message
        status_messages = {
            'pending': 'Your order has been received and is pending review.',
            'in_progress': 'Your order is now in progress!',
            'completed': 'Your order has been completed successfully!',
            'cancelled': 'Your order has been cancelled.',
        }
        
        message = status_messages.get(
            new_status,
            f'Your order status has been updated to: {new_status}'
        )
        
        # Send notification with email
        result = send_notification_with_email(
            user_id=order.client.id,
            title=f'Order Update: {order.title}',
            message=message,
            notification_type='order_update',
            send_email=True
        )
        
        return result
    except Exception as e:
        print(f"Failed to notify order status change: {str(e)}")
        return {'error': str(e)}


@shared_task
def send_order_confirmation(order_id):
    """
    Send order confirmation email and notification.
    
    Args:
        order_id: Order ID
    
    Returns:
        dict: Result
    """
    try:
        from orders.models import Order
        order = Order.objects.get(id=order_id)
        
        message = f"""
        Thank you for your order!
        
        Order Details:
        - Service: {order.service.title}
        - Price: ${order.price}
        - Status: {order.status}
        
        We'll notify you when your order status changes.
        """
        
        result = send_notification_with_email(
            user_id=order.client.id,
            title=f'Order Confirmation: {order.title}',
            message=message.strip(),
            notification_type='order_update',
            send_email=True
        )
        
        return result
    except Exception as e:
        print(f"Failed to send order confirmation: {str(e)}")
        return {'error': str(e)}
