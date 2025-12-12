from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Avg, Count
from .models import Testimonial
from .serializers import TestimonialSerializer, TestimonialSubmissionSerializer, TestimonialAdminSerializer
from accounts.permissions import IsAdmin

class IsAdminOrReadOnly(AllowAny):
    """
    Custom permission: 
    - Anyone can read approved testimonials
    - Only admins can update/delete
    """
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        if request.method == 'POST':
            return True  # Anyone can submit
        # For PUT, PATCH, DELETE - admin only
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'admin'
    
    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        # Only admins can modify
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'admin'

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Testimonial.objects.all()
        user = self.request.user
        
        # Non-admin users only see approved testimonials
        if not (user and user.is_authenticated and getattr(user, 'role', '') == 'admin'):
            queryset = queryset.filter(is_approved=True)
        
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
        user = self.request.user
        # Admin gets full serializer with private fields
        if user and user.is_authenticated and getattr(user, 'role', '') == 'admin':
            if self.action in ['list', 'retrieve', 'update', 'partial_update']:
                return TestimonialAdminSerializer
        # Public submission uses submission serializer
        if self.action == 'create':
            return TestimonialSubmissionSerializer
        return TestimonialSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        """Admin-only endpoint to approve a testimonial"""
        testimonial = self.get_object()
        testimonial.is_approved = True
        testimonial.save()
        serializer = TestimonialAdminSerializer(testimonial)
        return Response({
            'message': 'Testimonial approved successfully',
            'testimonial': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        """Admin-only endpoint to reject/unapprove a testimonial"""
        testimonial = self.get_object()
        testimonial.is_approved = False
        testimonial.save()
        serializer = TestimonialAdminSerializer(testimonial)
        return Response({
            'message': 'Testimonial rejected successfully',
            'testimonial': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def toggle_featured(self, request, pk=None):
        """Admin-only endpoint to toggle featured status"""
        testimonial = self.get_object()
        testimonial.is_featured = not testimonial.is_featured
        testimonial.save()
        serializer = TestimonialAdminSerializer(testimonial)
        return Response({
            'message': f'Testimonial {"featured" if testimonial.is_featured else "unfeatured"} successfully',
            'testimonial': serializer.data
        })

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
