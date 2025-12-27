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


class ServiceHeadMetricsView(APIView):
    """
    Dashboard metrics endpoint for service head users.
    Provides department-specific statistics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Ensure user is service_head and has a department
        if user.role != 'service_head':
            return Response(
                {'error': 'Only service heads can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not user.department:
            return Response(
                {'error': 'Service head must be assigned to a department'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        department = user.department
        
        # Get all services in this department
        department_services = Service.objects.filter(department=department)
        
        # Filter orders by department services
        department_orders = Order.objects.filter(service__in=department_services)
        
        # Date range for recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Total orders
        total_orders = department_orders.count()
        recent_orders_count = department_orders.filter(created_at__gte=thirty_days_ago).count()
        
        # Total revenue from department orders
        total_revenue = department_orders.aggregate(
            total=Sum('price')
        )['total'] or 0
        
        recent_revenue = department_orders.filter(
            created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('price'))['total'] or 0
        
        # Active clients (unique clients with orders in this department)
        active_clients = department_orders.values('client').distinct().count()
        
        # Team members in department
        team_members = User.objects.filter(
            department=department,
            role='team_member'
        ).count()
        
        # Services count
        services_count = department_services.filter(is_active=True).count()
        
        # Orders by status
        orders_by_status = department_orders.values('status').annotate(
            count=Count('id')
        )
        
        # Recent orders (last 10)
        recent_orders_data = department_orders.select_related(
            'client', 'service'
        ).order_by('-created_at')[:10].values(
            'id', 'title', 'status', 'price',
            'client__email', 'service__title', 'created_at'
        )
        
        # Services performance
        services_performance = department_services.annotate(
            total_orders=Count('orders'),
            total_revenue=Sum('orders__price')
        ).values(
            'id', 'title', 'total_orders', 'total_revenue'
        ).order_by('-total_revenue')
        
        return Response({
            'overview': {
                'total_orders': total_orders,
                'recent_orders': recent_orders_count,
                'total_revenue': float(total_revenue),
                'recent_revenue': float(recent_revenue),
                'active_clients': active_clients,
                'team_members': team_members,
                'services_count': services_count,
            },
            'department': {
                'id': department.id,
                'title': department.title,
            },
            'orders_by_status': list(orders_by_status),
            'recent_orders': list(recent_orders_data),
            'services_performance': list(services_performance),
        })


# ==================== GOOGLE ANALYTICS 4 VIEWS ====================

class GA4RealtimeView(APIView):
    """Get real-time active users from GA4"""
    permission_classes = [IsAdmin]
    
    def get(self, request):
        try:
            from .ga4_service import get_ga4_service
            ga4 = get_ga4_service()
            data = ga4.get_realtime_users()
            return Response(data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GA4OverviewView(APIView):
    """Get GA4 overview metrics"""
    permission_classes = [IsAdmin]
    
    def get(self, request):
        try:
            from .ga4_service import get_ga4_service
            days = int(request.query_params.get('days', 7))
            ga4 = get_ga4_service()
            
            overview = ga4.get_overview_metrics(days)
            trend = ga4.get_page_views_trend(days)
            
            return Response({
                'overview': overview,
                'trend': trend
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GA4PagesView(APIView):
    """Get top pages from GA4"""
    permission_classes = [IsAdmin]
    
    def get(self, request):
        try:
            from .ga4_service import get_ga4_service
            days = int(request.query_params.get('days', 7))
            limit = int(request.query_params.get('limit', 10))
            ga4 = get_ga4_service()
            
            pages = ga4.get_top_pages(days, limit)
            return Response({'pages': pages})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GA4SourcesView(APIView):
    """Get traffic sources from GA4"""
    permission_classes = [IsAdmin]
    
    def get(self, request):
        try:
            from .ga4_service import get_ga4_service
            days = int(request.query_params.get('days', 7))
            ga4 = get_ga4_service()
            
            sources = ga4.get_traffic_sources(days)
            return Response({'sources': sources})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GA4DevicesView(APIView):
    """Get device breakdown from GA4"""
    permission_classes = [IsAdmin]
    
    def get(self, request):
        try:
            from .ga4_service import get_ga4_service
            days = int(request.query_params.get('days', 7))
            ga4 = get_ga4_service()
            
            devices = ga4.get_device_breakdown(days)
            return Response({'devices': devices})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GA4DemographicsView(APIView):
    """Get user demographics from GA4"""
    permission_classes = [IsAdmin]
    
    def get(self, request):
        try:
            from .ga4_service import get_ga4_service
            days = int(request.query_params.get('days', 7))
            ga4 = get_ga4_service()
            
            demographics = ga4.get_user_demographics(days)
            return Response(demographics)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
