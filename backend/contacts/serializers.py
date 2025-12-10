from rest_framework import serializers
from .models import ContactSubmission
from services.models import Service


class ContactSubmissionSerializer(serializers.ModelSerializer):
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True),
        source='service',
        write_only=True
    )

    service = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ContactSubmission
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'service',
            'service_id',
            'message',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
