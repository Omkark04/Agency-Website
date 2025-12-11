# orders/views.py
from django.shortcuts import render
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Avg, Q
from django.utils import timezone
from .models import Order, Offer
from .serializers import OrderSerializer, OfferSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    parser_classes = [MultiPartParser, FormParser]  # Add this for file uploads
    
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
        
        # Filter by offer type
        offer_type = self.request.query_params.get('offer_type')
        if offer_type:
            queryset = queryset.filter(offer_type=offer_type)
        
        # Filter by limited time (legacy support)
        is_limited_time = self.request.query_params.get('is_limited_time')
        if is_limited_time is not None:
            if is_limited_time.lower() == 'true':
                queryset = queryset.filter(offer_type='limited')
        
        # Filter active offers (valid dates) unless explicitly disabled
        show_expired = self.request.query_params.get('show_expired')
        if show_expired is None or show_expired.lower() == 'false':
            now = timezone.now()
            queryset = queryset.filter(
                Q(valid_to__gte=now) | Q(valid_to__isnull=True)
            )
        
        return queryset.order_by('priority', '-created_at')
    
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
            offer_type='limited',
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        ).count()
        
        # Average discount
        active_qs = Offer.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        )
        
        avg_discount = 0
        if active_qs.exists():
            total_percentage = 0
            count = 0
            for offer in active_qs:
                total_percentage += offer.discount_percentage
                count += 1
            avg_discount = total_percentage / count if count > 0 else 0
        
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
            ).order_by('-priority', '-created_at').first()
        
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
            'cta_text': 'Subscribe',
            'cta_link': '/newsletter'
        })

    def create(self, request, *args, **kwargs):
        print("=== CREATE OFFER REQUEST ===")
        print("Request data:", request.data)
        print("Files:", request.FILES)
        print("Request content type:", request.content_type)
        
        # Handle multipart form data
        if request.content_type.startswith('multipart/form-data'):
            # For file uploads, data is in request.data (not request.data)
            pass
        
        # Add serializer validation debug
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("=== SERIALIZER ERRORS ===")
            print("Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Save the offer
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print("=== CREATE ERROR ===")
            print("Error:", str(e))
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )