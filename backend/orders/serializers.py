# orders/serializers.py
from rest_framework import serializers
from .models import Order, Offer
import json

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class OfferSerializer(serializers.ModelSerializer):
    features = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        default=list
    )
    conditions = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        default=list
    )
    remaining_days = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.FloatField(read_only=True)
    valid_until = serializers.DateTimeField(
        source='valid_to',
        required=False,
        allow_null=True
    )
    
    # For compatibility with frontend
    discount_percent = serializers.FloatField(
        source='discount_percentage',
        read_only=True
    )
    is_limited_time = serializers.BooleanField(
        source='offer_type',
        read_only=True
    )
    
    class Meta:
        model = Offer
        fields = [
            'id', 'title', 'description', 'short_description', 'image',
            'offer_type', 'original_price', 'discounted_price',
            'discount_type', 'discount_value', 'discount_percent', 'discount_percentage',
            'discount_code', 'terms', 'valid_from', 'valid_to', 'valid_until',
            'is_active', 'is_featured', 'priority', 'cta_text', 'cta_link',
            'icon_name', 'gradient_colors', 'button_text', 'button_url',
            'features', 'conditions', 'remaining_days', 'is_expired',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'discount_percentage', 'discounted_price']
        
    def to_internal_value(self, data):
        # Make a copy to avoid mutating original
        data_copy = data.copy()
        
        # Handle discount_percentage -> discount_value conversion if needed
        if 'discount_percentage' in data_copy and 'discount_type' in data_copy:
            if data_copy['discount_type'] == 'percent':
                data_copy['discount_value'] = data_copy.pop('discount_percentage')
        
        # Handle valid_until -> valid_to conversion  
        if 'valid_until' in data_copy:
            data_copy['valid_to'] = data_copy.pop('valid_until')
        
        # Handle offer_type -> is_limited_time for compatibility
        if 'is_limited_time' in data_copy:
            if data_copy['is_limited_time']:
                data_copy['offer_type'] = 'limited'
        
        return super().to_internal_value(data_copy)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure we return both names for compatibility
        data['valid_until'] = data['valid_to']
        data['is_limited_time'] = data['offer_type'] == 'limited'
        return data
    
    def create(self, validated_data):
        features = validated_data.pop('features', [])
        conditions = validated_data.pop('conditions', [])
        
        # Handle image upload
        image = validated_data.pop('image', None)
        
        offer = Offer.objects.create(**validated_data)
        
        if image:
            offer.image = image
        
        offer.set_features(features)
        offer.set_conditions(conditions)
        offer.save()
        return offer
    
    def update(self, instance, validated_data):
        features = validated_data.pop('features', None)
        conditions = validated_data.pop('conditions', None)
        image = validated_data.pop('image', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if image is not None:
            instance.image = image
        
        if features is not None:
            instance.set_features(features)
        if conditions is not None:
            instance.set_conditions(conditions)
        
        instance.save()
        return instance