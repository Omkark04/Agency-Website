# analytics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from payments.models import Transaction
from accounts.models import User
from services.models import Service, Department
from accounts.permissions import IsAdmin


class DashboardMetricsView(APIView):
    """
    Dashboard metrics endpoint for admin users.
    Provides overview statistics for the dashboard.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        # Date range for recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)

        # Total orders
        total_orders = Order.objects.count()
        recent_orders = Order.objects.filter(created_at__gte=thirty_days_ago).count()

        # Total revenue
        total_revenue = Transaction.objects.aggregate(
            total=Sum('amount')
        )['total'] or 0

        recent_revenue = Transaction.objects.filter(
            created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Active clients (clients with at least one order)
        active_clients = User.objects.filter(
            role='client',
            orders__isnull=False
        ).distinct().count()

        # Orders by status
        orders_by_status = Order.objects.values('status').annotate(
            count=Count('id')
        )

        # Revenue by department
        revenue_by_department = Order.objects.values(
            'service__department__title'
        ).annotate(
            revenue=Sum('price'),
            order_count=Count('id')
        ).order_by('-revenue')[:5]  # Top 5 departments

        # Recent orders (last 10)
        recent_orders_data = Order.objects.select_related(
            'client', 'service'
        ).order_by('-created_at')[:10].values(
            'id', 'title', 'status', 'price',
            'client__email', 'service__title', 'created_at'
        )

        return Response({
            'overview': {
                'total_orders': total_orders,
                'recent_orders': recent_orders,
                'total_revenue': float(total_revenue),
                'recent_revenue': float(recent_revenue),
                'active_clients': active_clients,
            },
            'orders_by_status': list(orders_by_status),
            'revenue_by_department': list(revenue_by_department),
            'recent_orders': list(recent_orders_data),
        })


class ServicePerformanceView(APIView):
    """
    Service performance metrics.
    Shows statistics for each service.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        service_stats = Service.objects.annotate(
            total_orders=Count('orders'),
            total_revenue=Sum('orders__price'),
            completed_orders=Count('orders', filter=Q(orders__status='completed')),
            pending_orders=Count('orders', filter=Q(orders__status='pending')),
        ).values(
            'id', 'title', 'department__title',
            'total_orders', 'total_revenue',
            'completed_orders', 'pending_orders'
        ).order_by('-total_revenue')

        return Response({
            'services': list(service_stats)
        })


class UserActivityView(APIView):
    """
    User activity metrics (admin only).
    Shows user registration trends and activity.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        # Users by role
        users_by_role = User.objects.values('role').annotate(
            count=Count('id')
        )

        # Recent registrations (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_registrations = User.objects.filter(
            date_joined__gte=thirty_days_ago
        ).count()

        # Top clients by order count
        top_clients = User.objects.filter(
            role='client'
        ).annotate(
            order_count=Count('orders'),
            total_spent=Sum('orders__price')
        ).order_by('-total_spent')[:10].values(
            'id', 'email', 'order_count', 'total_spent'
        )

        return Response({
            'users_by_role': list(users_by_role),
            'recent_registrations': recent_registrations,
            'top_clients': list(top_clients),
        })
