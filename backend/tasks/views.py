# tasks/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
import cloudinary.uploader

from .models import Task
from .serializers import (
    TaskSerializer, TaskCreateSerializer,
    TaskUpdateSerializer, TaskAttachmentSerializer
)
from orders.models import Order
from notifications.models import Notification


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Task CRUD operations
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'assignee', 'order__service__department']
    
    def get_queryset(self):
        """Filter tasks based on user role"""
        user = self.request.user
        if user.role in ['admin', 'service_head']:
            return Task.objects.all()
        elif user.role == 'team_member':
            # Team members can see tasks assigned to them
            return Task.objects.filter(assignee=user)
        else:
            # Clients can see tasks for their orders
            return Task.objects.filter(order__client=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        """Create task with creator"""
        task = serializer.save()
        
        # Send notification to assignee
        if task.assignee:
            Notification.objects.create(
                user=task.assignee,
                title="New Task Assigned",
                message=f"You have been assigned a new task: {task.title}",
                notification_type="task_assigned",
                link=f"/dashboard/tasks/{task.id}"
            )
    
    def perform_update(self, serializer):
        """Update task and send notifications"""
        old_task = self.get_object()
        old_assignee = old_task.assignee
        old_status = old_task.status
        
        task = serializer.save()
        
        # Notify if assignee changed
        if task.assignee and task.assignee != old_assignee:
            Notification.objects.create(
                user=task.assignee,
                title="Task Assigned to You",
                message=f"You have been assigned to task: {task.title}",
                notification_type="task_assigned",
                link=f"/dashboard/tasks/{task.id}"
            )
        
        # Notify if status changed to done
        if task.status == 'done' and old_status != 'done':
            # Notify order client
            if task.order.client:
                Notification.objects.create(
                    user=task.order.client,
                    title="Task Completed",
                    message=f"Task '{task.title}' for Order #{task.order.id} has been completed",
                    notification_type="task_completed",
                    link=f"/dashboard/orders/{task.order.id}/tasks"
                )
    
    def destroy(self, request, *args, **kwargs):
        """Delete task with permission check"""
        task = self.get_object()
        
        # Only admin and service heads can delete tasks
        if request.user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'Only admins and service heads can delete tasks'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_tasks(request, order_id):
    """
    List or create tasks for an order
    GET/POST /api/orders/<order_id>/tasks/
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and order.client != user:
            return Response(
                {'error': 'You do not have permission to access this order'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'GET':
            # List tasks
            tasks = Task.objects.filter(order=order).order_by('-priority', 'due_date')
            
            # Filter by status if provided
            status_filter = request.query_params.get('status')
            if status_filter:
                tasks = tasks.filter(status=status_filter)
            
            serializer = TaskSerializer(tasks, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create task (admin/service_head only)
            if user.role not in ['admin', 'service_head']:
                return Response(
                    {'error': 'Only admins and service heads can create tasks'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            data = request.data.copy()
            data['order'] = order.id
            
            serializer = TaskCreateSerializer(
                data=data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                task = serializer.save()
                
                # Send notification to assignee
                if task.assignee:
                    Notification.objects.create(
                        user=task.assignee,
                        title="New Task Assigned",
                        message=f"You have been assigned a new task: {task.title}",
                        notification_type="task_assigned",
                        link=f"/dashboard/tasks/{task.id}"
                    )
                
                return Response(
                    TaskSerializer(task, context={'request': request}).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_task_attachment(request, task_id):
    """
    Upload attachment for a task
    POST /api/tasks/<task_id>/upload-attachment/
    """
    try:
        task = Task.objects.get(id=task_id)
        
        # Check permissions
        user = request.user
        if not task.can_edit(user):
            return Response(
                {'error': 'You do not have permission to edit this task'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate file
        serializer = TaskAttachmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        file = serializer.validated_data['file']
        description = serializer.validated_data.get('description', '')
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            folder=f"tasks/task_{task.id}",
            resource_type="auto"
        )
        
        # Add to task attachments
        attachment_data = {
            'url': upload_result['secure_url'],
            'public_id': upload_result['public_id'],
            'filename': file.name,
            'description': description,
            'uploaded_by': user.email,
            'uploaded_at': timezone.now().isoformat()
        }
        
        task.attachments.append(attachment_data)
        task.save()
        
        return Response({
            'success': True,
            'message': 'Attachment uploaded successfully',
            'attachment': attachment_data
        })
    
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_task_attachment(request, task_id):
    """
    Remove attachment from a task
    DELETE /api/tasks/<task_id>/remove-attachment/
    """
    try:
        task = Task.objects.get(id=task_id)
        
        # Check permissions
        user = request.user
        if not task.can_edit(user):
            return Response(
                {'error': 'You do not have permission to edit this task'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get public_id from request
        public_id = request.data.get('public_id')
        if not public_id:
            return Response(
                {'error': 'public_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find and remove attachment
        task.attachments = [
            att for att in task.attachments
            if att.get('public_id') != public_id
        ]
        task.save()
        
        # Delete from Cloudinary
        try:
            cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Error deleting from Cloudinary: {e}")
        
        return Response({
            'success': True,
            'message': 'Attachment removed successfully'
        })
    
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
