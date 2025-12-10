from django.shortcuts import render

from rest_framework import viewsets
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from django.utils import timezone
from .models import Offer
from .serializers import OfferSerializer

class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    
    def get_queryset(self):
        queryset = Offer.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by featured
        is_featured = self.request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        # Filter by limited time
        is_limited_time = self.request.query_params.get('is_limited_time')
        if is_limited_time is not None:
            queryset = queryset.filter(is_limited_time=is_limited_time.lower() == 'true')
        
        # Filter active offers (valid dates)
        now = timezone.now()
        queryset = queryset.filter(valid_from__lte=now, valid_to__gte=now)
        
        return queryset.order_by('order_index', '-created_at')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        now = timezone.now()
        
        # Active offers (valid and active)
        active_offers = Offer.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        ).count()
        
        # Limited time offers
        limited_time_offers = Offer.objects.filter(
            is_limited_time=True,
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        ).count()
        
        # Average discount
        avg_discount = Offer.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        ).aggregate(avg=Avg('discount_percent'))['avg'] or 0
        
        return Response({
            'active_offers': active_offers,
            'limited_time_offers': limited_time_offers,
            'average_discount': float(avg_discount)
        })
    
    @action(detail=False, methods=['get'])
    def current_deal(self, request):
        now = timezone.now()
        
        # Get featured active offer, or latest active offer
        current_deal = Offer.objects.filter(
            is_active=True,
            is_featured=True,
            valid_from__lte=now,
            valid_to__gte=now
        ).first()
        
        if not current_deal:
            current_deal = Offer.objects.filter(
                is_active=True,
                valid_from__lte=now,
                valid_to__gte=now
            ).order_by('-discount_percent', '-created_at').first()
        
        if current_deal:
            serializer = self.get_serializer(current_deal)
            return Response(serializer.data)
        
        return Response({
            'title': 'No current deals',
            'subtitle': 'Check back soon for new offers!',
            'description': 'We update our offers regularly. Subscribe to our newsletter to be notified.',
            'discount_percentage': 0,
            'valid_until': now.isoformat(),
            'remaining_days': 0,
            'is_active': False,
            'features': ['Subscribe for updates'],
            'button_text': 'Subscribe',
            'button_url': '/newsletter'
        })
