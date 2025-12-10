# portfolio/serializers.py
from rest_framework import serializers
from django.utils.text import slugify
from .models import PortfolioProject

class PortfolioProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = PortfolioProject
        fields = "__all__"
        read_only_fields = ["slug", "created_by"]

    def validate(self, data):
        if not data.get("featured_image"):
            raise serializers.ValidationError("At least one featured image is required.")
        return data

    def create(self, validated_data):
        request = self.context["request"]

        validated_data["slug"] = slugify(validated_data["title"])
        validated_data["created_by"] = request.user if request.user.is_authenticated else None

        return super().create(validated_data)
from rest_framework import serializers
from .models import PortfolioProject, CaseStudy

# Your existing PortfolioProjectSerializer...

class CaseStudySerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)
    service_id = serializers.IntegerField(source='service.id', read_only=True)
    
    class Meta:
        model = CaseStudy
        fields = [
            'id', 'title', 'slug', 'description', 'full_description',
            'client_name', 'client_logo', 'category', 'service_id',
            'service_title', 'featured_image', 'gallery_images',
            'technologies', 'duration', 'results', 'metrics',
            'challenges', 'solutions', 'is_featured', 'is_published',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']