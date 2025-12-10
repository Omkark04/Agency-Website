# tasks/tasks.py
"""
Celery tasks for tasks app.
Background tasks for task assignment notifications.
"""
from celery import shared_task
from notifications.tasks import send_notification_with_email


@shared_task
def notify_task_assignment(task_id, assigned_to_id):
    """
    Notify user when a task is assigned to them.
    
    Args:
        task_id: Task ID
        assigned_to_id: User ID of assignee
    
    Returns:
        dict: Notification result
    """
    try:
        from tasks.models import Task
        task = Task.objects.get(id=task_id)
        
        message = f"""
        A new task has been assigned to you!
        
        Task: {task.title}
        Description: {task.description}
        Due Date: {task.due_date if task.due_date else 'Not set'}
        Priority: {task.priority}
        
        Please check your dashboard for more details.
        """
        
        result = send_notification_with_email(
            user_id=assigned_to_id,
            title=f'New Task Assigned: {task.title}',
            message=message.strip(),
            notification_type='task_assigned',
            send_email=True
        )
        
        return result
    except Exception as e:
        print(f"Failed to notify task assignment: {str(e)}")
        return {'error': str(e)}


@shared_task
def notify_task_status_change(task_id, new_status):
    """
    Notify relevant users when task status changes.
    
    Args:
        task_id: Task ID
        new_status: New task status
    
    Returns:
        dict: Notification result
    """
    try:
        from tasks.models import Task
        task = Task.objects.get(id=task_id)
        
        message = f'Task "{task.title}" status changed to: {new_status}'
        
        # Notify the assigned user
        if task.assigned_to:
            result = send_notification_with_email(
                user_id=task.assigned_to.id,
                title=f'Task Status Update: {task.title}',
                message=message,
                notification_type='task_assigned',
                send_email=False  # Don't spam email for every status change
            )
            return result
        
        return {'message': 'No user to notify'}
    except Exception as e:
        print(f"Failed to notify task status change: {str(e)}")
        return {'error': str(e)}
