from rest_framework import viewsets, status
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department, PriceCard, Service
from .serializers import DepartmentSerializer, ServiceSerializer, PriceCardSerializer
from accounts.permissions import IsAdmin
from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Department, PriceCard, Service, PricingPlan, PricingComparison
from .serializers import (
    DepartmentSerializer, ServiceSerializer, PriceCardSerializer,
    PricingPlanSerializer, PricingComparisonSerializer
)

User = get_user_model()

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by("title")
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("department", "title")
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["department"]
    
    def get_queryset(self):
        """
        Optionally filter services by department.
        """
        queryset = super().get_queryset()
        department_id = self.request.query_params.get('department')
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        return queryset


class PriceCardViewSet(viewsets.ModelViewSet):
    queryset = PriceCard.objects.all().order_by("service", "price")
    serializer_class = PriceCardSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["service", "department"]


class PricingPlanViewSet(viewsets.ModelViewSet):
    queryset = PricingPlan.objects.filter(is_active=True)
    serializer_class = PricingPlanSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'service', 'is_popular']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Add ordering
        queryset = queryset.order_by('order_index', 'price_numeric')
        return queryset

class PricingComparisonListView(generics.ListAPIView):
    queryset = PricingComparison.objects.all()
    serializer_class = PricingComparisonSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return super().get_queryset().order_by('order_index')

class PricingStatsView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        total_plans = PricingPlan.objects.count()
        active_plans = PricingPlan.objects.filter(is_active=True).count()
        popular_plans = PricingPlan.objects.filter(is_popular=True, is_active=True).count()
        
        # Calculate average price
        avg_price = PricingPlan.objects.filter(
            is_active=True, 
            price_numeric__isnull=False
        ).aggregate(avg=Avg('price_numeric'))['avg'] or 0
        
        return Response({
            'total_plans': total_plans,
            'active_plans': active_plans,
            'popular_plans': popular_plans,
            'average_price': float(avg_price)
        })



class PublicServiceListView(generics.ListAPIView):
    """Public endpoint for listing services (no auth required)"""
    queryset = Service.objects.filter(is_active=True).order_by('department', 'title')
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_department(request):
    """
    Get department where the authenticated user is assigned as team_head.
    Returns department data or null if user is not a team head of any department.
    """
    user = request.user
    
    # Find department where this user is the team_head
    try:
        department = Department.objects.get(team_head=user)
        serializer = DepartmentSerializer(department)
        return Response({
            'department': serializer.data,
            'has_department': True
        })
    except Department.DoesNotExist:
        return Response({
            'department': None,
            'has_department': False,
            'message': 'No department assigned to this user as team head'
        })
    except Department.MultipleObjectsReturned:
        # If somehow user is team_head of multiple departments, return the first one
        department = Department.objects.filter(team_head=user).first()
        serializer = DepartmentSerializer(department)
        return Response({
            'department': serializer.data,
            'has_department': True,
            'warning': 'User is team head of multiple departments, returning first one'
        })