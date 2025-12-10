from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

from rest_framework import serializers
from .models import Offer
import json

class OfferSerializer(serializers.ModelSerializer):
    features = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    conditions = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    remaining_days = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.DecimalField(
        source='discount_percent',
        max_digits=5,
        decimal_places=2
    )
    valid_until = serializers.DateTimeField(source='valid_to')

    class Meta:
        model = Offer
        fields = [
            'id', 'title', 'description', 'short_description',
            'discount_percent', 'discount_percentage', 'discount_code',
            'valid_from', 'valid_to', 'valid_until',
            'is_active', 'is_featured', 'is_limited_time',
            'icon_name', 'gradient_colors', 'button_text', 'button_url',
            'order_index', 'features', 'conditions',
            'remaining_days', 'is_expired',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def to_internal_value(self, data):
        # Convert discount_percentage to discount_percent
        if 'discount_percentage' in data:
            data['discount_percent'] = data.pop('discount_percentage')
        if 'valid_until' in data:
            data['valid_to'] = data.pop('valid_until')
        return super().to_internal_value(data)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure we return both names for compatibility
        data['discount_percentage'] = data['discount_percent']
        data['valid_until'] = data['valid_to']
        return data
    
    def create(self, validated_data):
        features = validated_data.pop('features', [])
        conditions = validated_data.pop('conditions', [])
        
        offer = Offer.objects.create(**validated_data)
        offer.set_features(features)
        offer.set_conditions(conditions)
        offer.save()
        return offer
    
    def update(self, instance, validated_data):
        features = validated_data.pop('features', None)
        conditions = validated_data.pop('conditions', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if features is not None:
            instance.set_features(features)
        if conditions is not None:
            instance.set_conditions(conditions)
        
        instance.save()
        return instance