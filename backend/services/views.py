from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department, PriceCard, Service
from .serializers import DepartmentSerializer, ServiceSerializer, PriceCardSerializer
from accounts.permissions import IsAdmin
from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from .models import Department, PriceCard, Service, PricingPlan, PricingComparison, SpecialOffer
from .serializers import (
    DepartmentSerializer, ServiceSerializer, PriceCardSerializer,
    PricingPlanSerializer, PricingComparisonSerializer, SpecialOfferSerializer
)

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

class SpecialOfferViewSet(viewsets.ModelViewSet):
    queryset = SpecialOffer.objects.filter(is_active=True)
    serializer_class = SpecialOfferSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'is_featured', 'is_limited_time']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Show only current offers
        now = timezone.now()
        queryset = queryset.filter(valid_from__lte=now, valid_until__gte=now)
        queryset = queryset.order_by('order_index', '-is_featured')
        return queryset

class CurrentDealView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        now = timezone.now()
        
        # Find the most relevant limited time offer
        deal = SpecialOffer.objects.filter(
            is_active=True,
            is_limited_time=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).order_by('-is_featured', 'valid_until').first()
        
        if not deal:
            return Response({})
        
        # Calculate remaining days
        remaining_days = (deal.valid_until - now).days
        if remaining_days < 0:
            remaining_days = 0
        
        return Response({
            'id': deal.id,
            'title': deal.title,
            'subtitle': 'Limited Time Offer',
            'description': deal.description,
            'discount_percentage': deal.discount_percentage,
            'valid_until': deal.valid_until,
            'remaining_days': remaining_days,
            'is_active': deal.is_active,
            'features': deal.features,
            'button_text': deal.button_text,
            'button_url': deal.button_url
        })

class OfferStatsView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        now = timezone.now()
        
        active_offers = SpecialOffer.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).count()
        
        limited_time_offers = SpecialOffer.objects.filter(
            is_active=True,
            is_limited_time=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).count()
        
        # Calculate average discount
        avg_discount = SpecialOffer.objects.filter(
            is_active=True,
            discount_percentage__isnull=False,
            valid_from__lte=now,
            valid_until__gte=now
        ).aggregate(avg=Avg('discount_percentage'))['avg'] or 0
        
        return Response({
            'active_offers': active_offers,
            'limited_time_offers': limited_time_offers,
            'average_discount': float(avg_discount)
        })

class PublicServiceListView(generics.ListAPIView):
    """Public endpoint for listing services (no auth required)"""
    queryset = Service.objects.filter(is_active=True).order_by('department', 'title')
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']