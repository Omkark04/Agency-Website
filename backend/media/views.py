from django.shortcuts import render

from rest_framework import viewsets
from .models import Media
from .serializers import MediaSerializer

class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import cloudinary.uploader

class UploadMediaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            folder="udyogworks/uploads/",
            resource_type="auto"   # handles image + video
        )

        url = upload_result.get("secure_url")
        thumbnail_url = upload_result.get("secure_url")

        # Optional: create thumbnail for images
        if upload_result.get("resource_type") == "image":
            thumbnail_url = cloudinary.CloudinaryImage(upload_result["public_id"]).build_url(
                width=400, height=400, crop="fill"
            )

        return Response({
            "url": url,
            "thumbnail_url": thumbnail_url,
            "public_id": upload_result.get("public_id")
        })
