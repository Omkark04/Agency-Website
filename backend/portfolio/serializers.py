# portfolio/serializers.py
from rest_framework import serializers
from django.utils.text import slugify
from .models import PortfolioProject, CaseStudy

class PortfolioProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProject
        fields = "__all__"
        read_only_fields = ["slug", "created_by"]
    
    def to_representation(self, instance):
        """Customize the output to include service details"""
        data = super().to_representation(instance)
        
        # Replace service ID with service details for read operations
        if instance.service:
            data['service'] = {
                'id': instance.service.id,
                'name': instance.service.title,
                'icon': instance.service.icon_name if hasattr(instance.service, 'icon_name') else None
            }
        else:
            data['service'] = None
            
        return data

    def validate(self, data):
        # Only require featured_image on creation, not update
        if not self.instance and not data.get("featured_image"):
            raise serializers.ValidationError("At least one featured image is required.")
        return data

    def create(self, validated_data):
        request = self.context.get("request")

        if "title" in validated_data:
            validated_data["slug"] = slugify(validated_data["title"])
        
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "title" in validated_data and validated_data["title"] != instance.title:
            validated_data["slug"] = slugify(validated_data["title"])
            
        return super().update(instance, validated_data)

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