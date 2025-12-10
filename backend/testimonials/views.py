from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count
from .models import Testimonial
from .serializers import TestimonialSerializer, TestimonialSubmissionSerializer

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.filter(is_approved=True)
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
    
    # Remove filter_backends and handle filtering manually
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Apply filtering manually
        is_featured = self.request.query_params.get('is_featured')
        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
            
        is_approved = self.request.query_params.get('is_approved')
        if is_approved:
            queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
            
        service = self.request.query_params.get('service')
        if service:
            queryset = queryset.filter(service=service)
        
        # Apply ordering
        queryset = queryset.order_by('-is_featured', '-created_at')
        
        # Apply limit if specified
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
                
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TestimonialSubmissionSerializer
        return TestimonialSerializer

class TestimonialStatsView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        total = Testimonial.objects.filter(is_approved=True).count()
        featured_count = Testimonial.objects.filter(is_approved=True, is_featured=True).count()
        
        # Calculate average rating
        avg_rating = Testimonial.objects.filter(
            is_approved=True
        ).aggregate(avg=Avg('rating'))['avg'] or 0
        
        # By service
        by_service = Testimonial.objects.filter(
            is_approved=True,
            service__isnull=False
        ).values('service__id', 'service__title').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total': total,
            'average_rating': float(avg_rating),
            'featured_count': featured_count,
            'by_service': [{
                'service_id': item['service__id'],
                'service_title': item['service__title'],
                'count': item['count']
            } for item in by_service]
        })