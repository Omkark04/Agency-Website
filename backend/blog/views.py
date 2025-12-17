from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Blog
from .serializers import BlogSerializer, BlogListSerializer, BlogCreateUpdateSerializer
from .permissions import IsAdminOrAuthor


class BlogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Blog CRUD operations
    
    Permissions:
    - List/Retrieve: Public (published blogs only for non-authenticated)
    - Create: Admin and Department Head only
    - Update/Delete: Admin (all blogs) or Author (own blogs only)
    """
    queryset = Blog.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'is_published', 'author']
    search_fields = ['title', 'excerpt', 'content', 'tags']
    ordering_fields = ['created_at', 'published_at', 'title']
    ordering = ['-is_featured', '-published_at', '-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return BlogListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BlogCreateUpdateSerializer
        return BlogSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on user permissions
        - Unauthenticated: Only published blogs
        - Authenticated non-admin: Published blogs + own drafts
        - Admin: All blogs
        """
        queryset = Blog.objects.all()
        user = self.request.user
        
        # For list and retrieve actions
        if self.action in ['list', 'retrieve']:
            if not user.is_authenticated:
                # Public: only published blogs
                queryset = queryset.filter(is_published=True)
            elif user.role != 'admin':
                # Non-admin authenticated: published blogs + own drafts
                queryset = queryset.filter(
                    Q(is_published=True) | Q(author=user)
                )
            # Admin sees all blogs (no filter)
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrAuthor()]
        return [IsAuthenticatedOrReadOnly()]
    
    def perform_create(self, serializer):
        """Set the author to the current user when creating"""
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def featured(self, request):
        """Get featured published blogs"""
        featured_blogs = Blog.objects.filter(is_featured=True, is_published=True)
        serializer = BlogListSerializer(featured_blogs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def categories(self, request):
        """Get all unique categories"""
        categories = Blog.objects.filter(
            is_published=True
        ).values_list('category', flat=True).distinct()
        # Filter out empty categories
        categories = [cat for cat in categories if cat]
        return Response({'categories': categories})
    
    @action(detail=False, methods=['get'])
    def my_blogs(self, request):
        """Get blogs created by the current user"""
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        my_blogs = Blog.objects.filter(author=request.user)
        serializer = BlogListSerializer(my_blogs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrAuthor])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a blog"""
        blog = self.get_object()
        blog.is_featured = not blog.is_featured
        blog.save()
        serializer = BlogSerializer(blog)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrAuthor])
    def toggle_publish(self, request, pk=None):
        """Toggle published status of a blog"""
        blog = self.get_object()
        blog.is_published = not blog.is_published
        blog.save()
        serializer = BlogSerializer(blog)
        return Response(serializer.data)
