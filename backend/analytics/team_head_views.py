# analytics/team_head_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from payments.models import Transaction
from accounts.models import User
from services.models import Service
from accounts.permissions import IsTeamHeadOrAdmin
from accounts.utils import get_user_department


class TeamHeadDashboardMetricsView(APIView):
    """
    Dashboard metrics endpoint for team head (service_head) users.
    Filters all data by the team head's department.
    """
    permission_classes = [IsTeamHeadOrAdmin]

    def get(self, request):
        user = request.user
        
        # Get team head's department
        department = get_user_department(user)
        if not department:
            return Response(
                {'error': 'User does not have a department assigned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        department_id = department.id
        
        # Date range for recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)

        # Filter orders by department through service relationship
        department_orders = Order.objects.filter(
            service__department_id=department_id
        )

        # Total orders for this department
        total_orders = department_orders.count()
        recent_orders = department_orders.filter(created_at__gte=thirty_days_ago).count()

        # Total revenue for this department
        total_revenue = department_orders.aggregate(
            total=Sum('price')
        )['total'] or 0

        recent_revenue = department_orders.filter(
            created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('price'))['total'] or 0

        # Active clients for this department (clients with at least one order)
        active_clients = User.objects.filter(
            role='client',
            orders__service__department_id=department_id
        ).distinct().count()

        # Orders by status for this department
        orders_by_status = department_orders.values('status').annotate(
            count=Count('id')
        )

        # Services in this department with their performance
        services_performance = Service.objects.filter(
            department_id=department_id
        ).annotate(
            total_orders=Count('orders'),
            total_revenue=Sum('orders__price'),
            completed_orders=Count('orders', filter=Q(orders__status='completed')),
            pending_orders=Count('orders', filter=Q(orders__status='pending')),
        ).values(
            'id', 'title',
            'total_orders', 'total_revenue',
            'completed_orders', 'pending_orders'
        ).order_by('-total_revenue')

        # Recent orders for this department (last 10)
        recent_orders_data = department_orders.select_related(
            'client', 'service'
        ).order_by('-created_at')[:10].values(
            'id', 'title', 'status', 'price',
            'client__email', 'service__title', 'created_at'
        )

        # Team members in this department
        team_members = User.objects.filter(
            department_id=department_id,
            role__in=['team_member', 'service_head']
        ).count()

        return Response({
            'overview': {
                'total_orders': total_orders,
                'recent_orders': recent_orders,
                'total_revenue': float(total_revenue),
                'recent_revenue': float(recent_revenue),
                'active_clients': active_clients,
                'team_members': team_members,
            },
            'orders_by_status': list(orders_by_status),
            'services_performance': list(services_performance),
            'recent_orders': list(recent_orders_data),
            'department': {
                'id': department.id,
                'title': department.title,
            }
        })


class TeamHeadServicePerformanceView(APIView):
    """
    Service performance metrics for team head's department.
    """
    permission_classes = [IsTeamHeadOrAdmin]

    def get(self, request):
        user = request.user
        
        department = get_user_department(user)
        if not department:
            return Response(
                {'error': 'User does not have a department assigned'},
                status=status.HTTP_400_BAD_REQUEST
            )

        service_stats = Service.objects.filter(
            department_id=department.id
        ).annotate(
            total_orders=Count('orders'),
            total_revenue=Sum('orders__price'),
            completed_orders=Count('orders', filter=Q(orders__status='completed')),
            pending_orders=Count('orders', filter=Q(orders__status='pending')),
            in_progress_orders=Count('orders', filter=Q(orders__status='in_progress')),
        ).values(
            'id', 'title',
            'total_orders', 'total_revenue',
            'completed_orders', 'pending_orders', 'in_progress_orders'
        ).order_by('-total_revenue')

        return Response({
            'services': list(service_stats)
        })
