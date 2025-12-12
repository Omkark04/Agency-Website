from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
import cloudinary.uploader
from .models import Media
from .serializers import MediaSerializer

class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    
    # Enhanced filtering and searching
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['media_type', 'owner', 'project', 'service']
    search_fields = ['caption', 'file_name']
    ordering_fields = ['created_at', 'id', 'file_size']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Custom filtering for specific searches
        caption_filter = self.request.query_params.get('caption__icontains')
        if caption_filter:
            queryset = queryset.filter(caption__icontains=caption_filter)
            
        # Filter by hero images
        is_hero = self.request.query_params.get('is_hero')
        if is_hero:
            queryset = queryset.filter(caption__icontains='hero')
            
        return queryset

class UploadMediaView(APIView):
    permission_classes = [AllowAny]  # Allow public uploads for form submissions

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        
        # Validate file size (10MB limit matching frontend)
        max_size = 10 * 1024 * 1024  # 10MB
        if file.size > max_size:
            return Response({"error": "File size exceeds 10MB limit"}, status=400)
        
        # Validate file type
        allowed_types = [
            'image/jpeg', 'image/jpg', 'image/png', 
            'image/gif', 'image/webp', 'image/svg+xml',
            'video/mp4', 'video/webm', 'video/quicktime'
        ]
        if file.content_type not in allowed_types:
            return Response({"error": "File type not allowed. Supported: JPG, PNG, GIF, WebP, SVG, MP4, WebM, MOV"}, status=400)
        
        # Upload to Cloudinary
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder="udyogworks/uploads/",
                resource_type="auto",  # handles image + video
                timeout=30  # 30 second timeout
            )
        except Exception as e:
            return Response({"error": f"Upload failed: {str(e)}"}, status=500)

        url = upload_result.get("secure_url")
        thumbnail_url = upload_result.get("secure_url")
        
        # Generate thumbnail for images
        if upload_result.get("resource_type") == "image":
            thumbnail_url = cloudinary.CloudinaryImage(upload_result["public_id"]).build_url(
                width=400, 
                height=400, 
                crop="fill",
                quality="auto"
            )
        
        # Determine media type
        if file.content_type.startswith('image/'):
            media_type = 'image'
        elif file.content_type.startswith('video/'):
            media_type = 'video'
        else:
            media_type = 'document'
        
        # Create media record in database
        try:
            media = Media.objects.create(
                url=url,
                thumbnail_url=thumbnail_url,
                media_type=media_type,
                caption=request.data.get('caption', file.name),
                file_name=file.name,
                file_size=file.size,
                mime_type=file.content_type,
                owner=request.user if request.user.is_authenticated else None,
                public_id=upload_result.get('public_id'),
                project_id=request.data.get('project'),
                service_id=request.data.get('service')
            )
            
            return Response({
                "id": media.id,
                "url": media.url,
                "thumbnail_url": media.thumbnail_url,
                "media_type": media.media_type,
                "caption": media.caption,
                "file_name": media.file_name,
                "file_size": media.file_size,
                "mime_type": media.mime_type,
                "owner": media.owner.id if media.owner else None,
                "project": media.project_id,
                "service": media.service_id,
                "created_at": media.created_at.isoformat() if media.created_at else None,
                "public_id": upload_result.get("public_id")
            }, status=201)
            
        except Exception as e:
            # Rollback cloudinary upload if database save fails
            try:
                cloudinary.uploader.destroy(upload_result.get('public_id'))
            except:
                pass
            return Response({"error": f"Database save failed: {str(e)}"}, status=500)