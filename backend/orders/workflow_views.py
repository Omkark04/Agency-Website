# orders/workflow_views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
import cloudinary.uploader

from .models import Order
from .workflow_models import OrderStatusHistory
from .workflow import OrderWorkflow
from .workflow_serializers import (
    OrderStatusHistorySerializer,
    OrderStatusUpdateSerializer,
    OrderDeliverableSerializer,
    OrderWorkflowInfoSerializer
)
from notifications.models import Notification
from accounts.models import User


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """
    Update order status with validation
    POST /api/orders/<order_id>/update-status/
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'Only admins and service heads can update order status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Service heads can only update orders for their department's services
        if user.role == 'service_head':
            from services.models import Department
            user_dept = Department.objects.filter(team_head=user).first()
            if not user_dept:
                return Response(
                    {'error': 'You are not assigned to any department'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if order.service.department != user_dept:
                return Response(
                    {'error': 'You can only update orders for services in your department'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Validate and update status
        serializer = OrderStatusUpdateSerializer(
            data=request.data,
            context={'order': order}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_status = serializer.validated_data['new_status']
        notes = serializer.validated_data.get('notes', '')
        
        try:
            # Update status using Order model method
            order.update_status(new_status, user, notes)
            
            # Send notification to client
            if order.client:
                status_display = dict(Order.STATUS_CHOICES).get(new_status, new_status)
                Notification.objects.create(
                    user=order.client,
                    title="Order Status Updated",
                    message=f"Order #{order.id} status has been updated to: {status_display}",
                    notification_type="order_status_update",
                    link=f"/dashboard/orders/{order.id}"
                )
            
            # Send notification to admin if status is payment_done
            if new_status == 'payment_done':
                admin_users = User.objects.filter(role='admin')
                for admin in admin_users:
                    Notification.objects.create(
                        user=admin,
                        title="Payment Received",
                        message=f"Payment received for Order #{order.id}",
                        notification_type="payment_received",
                        link=f"/dashboard/admin/orders/{order.id}"
                    )
            
            return Response({
                'success': True,
                'message': 'Order status updated successfully',
                'order': {
                    'id': order.id,
                    'status': order.status,
                    'status_display': dict(Order.STATUS_CHOICES).get(order.status),
                    'status_updated_at': order.status_updated_at,
                    'status_updated_by': user.email
                }
            })
        
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_status_history(request, order_id):
    """
    Get status history timeline for an order
    GET /api/orders/<order_id>/status-history/
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and order.client != user:
            return Response(
                {'error': 'You do not have permission to view this order'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get status history
        history = OrderStatusHistory.objects.filter(order=order).order_by('-timestamp')
        serializer = OrderStatusHistorySerializer(history, many=True)
        
        return Response({
            'order_id': order.id,
            'current_status': order.status,
            'current_status_display': dict(Order.STATUS_CHOICES).get(order.status),
            'history': serializer.data
        })
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_deliverable(request, order_id):
    """
    Upload deliverable file for an order
    POST /api/orders/<order_id>/upload-deliverable/
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'Only admins and service heads can upload deliverables'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Service heads can only upload for their department's services
        if user.role == 'service_head':
            from services.models import Department
            user_dept = Department.objects.filter(team_head=user).first()
            if not user_dept:
                return Response(
                    {'error': 'You are not assigned to any department'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if order.service.department != user_dept:
                return Response(
                    {'error': 'You can only upload deliverables for services in your department'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Validate file
        serializer = OrderDeliverableSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        file = serializer.validated_data['file']
        description = serializer.validated_data.get('description', '')
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            folder=f"deliverables/order_{order.id}",
            resource_type="auto"
        )
        
        # Add to order deliverables
        deliverable_data = {
            'url': upload_result['secure_url'],
            'public_id': upload_result['public_id'],
            'filename': file.name,
            'description': description,
            'uploaded_by': user.email,
            'uploaded_at': timezone.now().isoformat()
        }
        
        order.deliverables.append(deliverable_data)
        order.save()
        
        # Send notification to client
        if order.client:
            Notification.objects.create(
                user=order.client,
                title="New Deliverable Uploaded",
                message=f"A new deliverable has been uploaded for Order #{order.id}",
                notification_type="deliverable_uploaded",
                link=f"/dashboard/orders/{order.id}"
            )
        
        return Response({
            'success': True,
            'message': 'Deliverable uploaded successfully',
            'deliverable': deliverable_data
        })
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_workflow_info(request, order_id):
    """
    Get workflow information for an order
    GET /api/orders/<order_id>/workflow-info/
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and order.client != user:
            return Response(
                {'error': 'You do not have permission to view this order'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get workflow info
        workflow_info = OrderWorkflow.get_status_info(order.status)
        
        # Add current status (missing field that caused KeyError)
        workflow_info['current_status'] = order.status
        workflow_info['current_status_display'] = dict(Order.STATUS_CHOICES).get(order.status)
        
        # Rename 'color' to 'status_color' to match serializer
        workflow_info['status_color'] = workflow_info.pop('color', 'gray')
        
        # Add allowed next statuses with display names
        allowed_next = []
        for status_value in workflow_info['allowed_next']:
            allowed_next.append({
                'value': status_value,
                'display': dict(Order.STATUS_CHOICES).get(status_value, status_value)
            })
        workflow_info['allowed_next_statuses'] = allowed_next
        
        # Add progress info
        workflow_info['progress_percentage'] = OrderWorkflow.get_progress_percentage(order.status)
        workflow_info['is_terminal'] = OrderWorkflow.is_terminal_status(order.status)
        
        serializer = OrderWorkflowInfoSerializer(workflow_info)
        
        return Response(serializer.data)
    
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
