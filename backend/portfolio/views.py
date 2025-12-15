# portfolio/views.py
from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .models import PortfolioProject, CaseStudy
from .serializers import PortfolioProjectSerializer, CaseStudySerializer

class PortfolioProjectViewSet(viewsets.ModelViewSet):
    queryset = PortfolioProject.objects.all()
    serializer_class = PortfolioProjectSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_featured', 'service', 'service__department']
    
    def get_serializer_context(self):
        return {"request": self.request}

class CaseStudyViewSet(viewsets.ModelViewSet):
    queryset = CaseStudy.objects.filter(is_published=True)
    serializer_class = CaseStudySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    
    # Instead of filterset_fields, we'll handle filtering manually
    # to avoid the recursive filtering issue
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Apply filtering manually
        is_featured = self.request.query_params.get('is_featured')
        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
            
        is_published = self.request.query_params.get('is_published')
        if is_published:
            queryset = queryset.filter(is_published=is_published.lower() == 'true')
            
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
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

class CaseStudyBySlugView(generics.RetrieveAPIView):
    queryset = CaseStudy.objects.filter(is_published=True)
    serializer_class = CaseStudySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

class CaseStudyStatsView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        total = CaseStudy.objects.filter(is_published=True).count()
        featured = CaseStudy.objects.filter(is_published=True, is_featured=True).count()
        
        # By category
        by_category = CaseStudy.objects.filter(is_published=True).values('category').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # By service
        by_service = CaseStudy.objects.filter(is_published=True, service__isnull=False).values(
            'service__id', 'service__title'
        ).annotate(count=Count('id')).order_by('-count')
        
        return Response({
            'total': total,
            'featured': featured,
            'by_category': list(by_category),
            'by_service': [{
                'service_id': item['service__id'],
                'service_title': item['service__title'],
                'count': item['count']
            } for item in by_service]
        })