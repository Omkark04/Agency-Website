from rest_framework import serializers
from .models import Testimonial

class TestimonialSerializer(serializers.ModelSerializer):
    """Public serializer for approved testimonials"""
    service_title = serializers.CharField(source='service.title', read_only=True)
    service_id = serializers.IntegerField(source='service.id', read_only=True)
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'client_name', 'client_role', 'client_company',
            'content', 'rating', 'avatar_url', 'project_type',
            'service_id', 'service_title', 'is_approved', 'is_featured',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['is_approved', 'is_featured', 'created_at', 'updated_at']

class TestimonialSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for client submissions"""
    class Meta:
        model = Testimonial
        fields = [
            'client_name', 'client_role', 'client_company', 'content',
            'rating', 'email', 'phone', 'project_type', 'service',
            'consent_to_display'
        ]
        
    def validate_phone(self, value):
        """Ensure phone number is provided"""
        if not value or not value.strip():
            raise serializers.ValidationError("Phone number is required.")
        return value
    
    def validate_rating(self, value):
        """Ensure rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class TestimonialAdminSerializer(serializers.ModelSerializer):
    """Admin serializer with all fields including private data"""
    service_title = serializers.CharField(source='service.title', read_only=True)
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'client_name', 'client_role', 'client_company',
            'content', 'rating', 'avatar_url', 'project_type',
            'service', 'service_title', 'is_approved', 'is_featured',
            'email', 'phone', 'consent_to_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']