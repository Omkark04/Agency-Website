from rest_framework import serializers
from .models import Testimonial

class TestimonialSerializer(serializers.ModelSerializer):
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
        read_only_fields = ['is_approved', 'created_at', 'updated_at']

class TestimonialSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = [
            'client_name', 'client_role', 'client_company', 'content',
            'rating', 'email', 'phone', 'project_type', 'service',
            'consent_to_display'
        ]