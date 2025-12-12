# orders/serializers.py
from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import Order, Offer

# Import Service for PrimaryKeyRelatedField
try:
    from services.models import Service
except Exception:
    # fallback if import path differs; DRF will raise if queryset invalid
    Service = None


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class OfferSerializer(serializers.ModelSerializer):
    """
    Serializer for Offer model.

    - services: PrimaryKeyRelatedField for writing (many-to-many)
    - services_info: read-only detailed list for frontend
    - features & conditions: ListField for JSON friendly arrays
    - created_by / created_by_email: read-only metadata
    - remaining_days / is_expired / discount_percentage: computed read-only fields
    """

    services = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all() if Service is not None else None,
        many=True,
        required=False,
        write_only=True,
    )
    services_info = serializers.SerializerMethodField(read_only=True)

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

    # Metadata fields (read-only)
    created_by = serializers.CharField(source='created_by.username', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    created_by_department = serializers.CharField(source='created_by_department.title', read_only=True)
    approved_by = serializers.CharField(source='approved_by.username', read_only=True)
    approved_at = serializers.DateTimeField(read_only=True)

    # Backwards/compatibility aliases expected by frontend
    valid_until = serializers.DateTimeField(source='valid_to', required=False, allow_null=True)
    discount_percent = serializers.FloatField(source='discount_percentage', read_only=True)
    is_limited_time = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Offer
        fields = [
            'id', 'title', 'slug', 'description', 'short_description', 'image',
            'services', 'services_info',
            'offer_type', 'original_price', 'discounted_price',
            'discount_type', 'discount_value', 'discount_percent', 'discount_percentage',
            'discount_code', 'terms', 'valid_from', 'valid_to', 'valid_until',
            'is_active', 'is_featured', 'is_limited_time', 'is_limited_time', 'priority',
            'cta_text', 'cta_link', 'icon_name', 'gradient_colors', 'button_text', 'button_url',
            'features', 'conditions',
            'remaining_days', 'is_expired',
            'created_by', 'created_by_email', 'created_by_department',
            'is_approved', 'approved_by', 'approved_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'discount_percentage', 'discounted_price',
            'remaining_days', 'is_expired',
            'created_by', 'created_by_email', 'created_by_department',
            'approved_by', 'approved_at',
            'created_at', 'updated_at'
        ]

    def get_services_info(self, obj):
        return list(obj.services.values('id', 'title', 'slug'))

    def get_is_limited_time(self, obj):
        # Maintain compatibility with frontend boolean "is_limited_time"
        return obj.offer_type == 'limited' or bool(getattr(obj, 'is_limited_time', False))

    def validate(self, attrs):
        """
        Validate discount ranges & date logic.
        - If discount_type == 'percent', ensure 0 <= discount_value <= 100
        - If valid_to and valid_from provided, ensure valid_to >= valid_from
        """
        discount_type = attrs.get('discount_type', getattr(self.instance, 'discount_type', None))
        discount_value = attrs.get('discount_value', getattr(self.instance, 'discount_value', None))

        if discount_type == 'percent' and discount_value is not None:
            try:
                dv = float(discount_value)
            except Exception:
                raise ValidationError({"discount_value": "Percent discount must be numeric."})
            if dv < 0 or dv > 100:
                raise ValidationError({"discount_value": "Percent discount must be between 0 and 100."})

        valid_from = attrs.get('valid_from', getattr(self.instance, 'valid_from', None))
        valid_to = attrs.get('valid_to', getattr(self.instance, 'valid_to', None))
        if valid_from and valid_to:
            if valid_to < valid_from:
                raise ValidationError({"valid_to": "valid_to must be the same or after valid_from."})

        return super().validate(attrs)

    def to_internal_value(self, data):
        """
        Normalize input keys for compatibility:
        - valid_until -> valid_to
        - discount_percentage -> discount_value (if discount_type == 'percent')
        - Parse JSON stringified arrays from FormData (features, conditions, services)
        """
        import json
        import logging
        from django.utils.datastructures import MultiValueDict
        
        logger = logging.getLogger(__name__)
        
        # Convert MultiValueDict to regular dict, extracting single values
        if isinstance(data, MultiValueDict):
            # For MultiValueDict, get single values for most fields
            # but preserve lists for fields that should be lists
            converted_data = {}
            for key in data.keys():
                # Get the value(s) for this key
                values = data.getlist(key)
                # For most fields, we want the single value
                # The list fields will be JSON strings that we'll parse later
                converted_data[key] = values[0] if len(values) == 1 else values
            data = converted_data
        else:
            data = data.copy()
        
        logger.info(f"OfferSerializer.to_internal_value - Incoming data keys: {list(data.keys())}")

        # valid_until compatibility
        if 'valid_until' in data and 'valid_to' not in data:
            data['valid_to'] = data.pop('valid_until')

        # allow 'discount_percentage' from frontend to map to discount_value (when discount_type=percent)
        if 'discount_percentage' in data and ('discount_value' not in data):
            # don't mutate original if not percent — viewset should control discount_type
            data['discount_value'] = data.get('discount_percentage')

        # allow boolean 'is_limited_time' -> offer_type mapping
        if 'is_limited_time' in data and 'offer_type' not in data:
            if data.get('is_limited_time'):
                data['offer_type'] = 'limited'

        # Parse JSON stringified arrays from FormData
        # When frontend sends FormData with JSON.stringify, we need to parse them back
        for field in ['features', 'conditions', 'services']:
            if field in data:
                value = data[field]
                # Handle both string (JSON) and list inputs
                if isinstance(value, str):
                    try:
                        logger.info(f"Parsing {field}: {value[:100] if len(value) > 100 else value}")
                        parsed = json.loads(value)
                        # Ensure it's a list
                        if isinstance(parsed, list):
                            data[field] = parsed
                            logger.info(f"Parsed {field} successfully: {data[field]}")
                        else:
                            logger.warning(f"{field} parsed but not a list: {type(parsed)}")
                    except (json.JSONDecodeError, ValueError) as e:
                        logger.error(f"Failed to parse {field}: {e}")
                        # Leave as-is and let validation handle it
                        pass
                elif isinstance(value, list):
                    # Already a list, ensure it's a proper Python list
                    data[field] = list(value)
                    logger.info(f"{field} already a list: {data[field]}")

        try:
            result = super().to_internal_value(data)
            logger.info("to_internal_value succeeded")
            return result
        except Exception as e:
            logger.error(f"to_internal_value failed: {type(e).__name__}: {str(e)}")
            raise

    def _set_features_conditions_on_instance(self, instance, features, conditions):
        """
        Support both legacy set_features/set_conditions helper and direct JSONField assignment.
        """
        if features is not None:
            if hasattr(instance, 'set_features') and callable(getattr(instance, 'set_features')):
                try:
                    instance.set_features(features)
                except Exception:
                    instance.features = features
            else:
                instance.features = features

        if conditions is not None:
            if hasattr(instance, 'set_conditions') and callable(getattr(instance, 'set_conditions')):
                try:
                    instance.set_conditions(conditions)
                except Exception:
                    instance.conditions = conditions
            else:
                instance.conditions = conditions

    def create(self, validated_data):
        """
        Create an Offer:
        - Pop services (M2M) and assign after creation
        - Set created_by from request.user if available
        - Optionally snapshot created_by_department
        """
        services_data = validated_data.pop('services', [])
        features = validated_data.pop('features', [])
        conditions = validated_data.pop('conditions', [])

        request = self.context.get('request', None)

        # If frontend provided 'is_approved', we DO NOT automatically accept it here.
        # Enforce approval via ViewSet permission/action (admin only) — do NOT trust clients to set is_approved.
        if 'is_approved' in validated_data:
            # remove it to avoid clients approving their own offers
            validated_data.pop('is_approved')

        # Assign creator if request user exists
        if request and hasattr(request, 'user') and request.user and request.user.is_authenticated:
            validated_data['created_by'] = request.user
            # Snapshot department if available on user object
            dept = getattr(request.user, 'department', None)
            if not dept:
                # try departments_managed for a team head
                try:
                    dm = request.user.departments_managed.all()
                    if dm.exists():
                        dept = dm.first()
                except Exception:
                    dept = None
            if dept:
                validated_data['created_by_department'] = dept

        offer = Offer.objects.create(**validated_data)

        # assign m2m services
        if services_data:
            offer.services.set(services_data)

        # features & conditions handling
        self._set_features_conditions_on_instance(offer, features, conditions)

        # save once more to ensure any computed fields (discounted_price slug etc) are persisted
        offer.save()
        return offer

    def update(self, instance, validated_data):
        """
        Update Offer:
        - Handle services M2M, features/conditions, image overrides
        - Prevent unprivileged users from flipping is_approved here — enforce via ViewSet
        """
        services_data = validated_data.pop('services', None)
        features = validated_data.pop('features', None)
        conditions = validated_data.pop('conditions', None)

        request = self.context.get('request', None)

        # Protect is_approved from being set by non-admins:
        if 'is_approved' in validated_data:
            # The serializer cannot reliably enforce roles; prefer ViewSet permission checks.
            # If you want serializer-level enforcement, uncomment and adjust the following:
            #
            # user = getattr(request, 'user', None)
            # if not (user and (user.is_staff or getattr(user, 'role', '') == 'admin')):
            #     raise serializers.PermissionDenied("Only admins may approve offers.")
            #
            # For now, remove client-provided is_approved and let viewset handle approvals.
            validated_data.pop('is_approved')

        # Update simple fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # services m2m
        if services_data is not None:
            instance.services.set(services_data)

        # features & conditions
        self._set_features_conditions_on_instance(instance, features, conditions)

        # If request.user exists, optionally update created_by snapshot (do not reassign created_by)
        # Save instance
        instance.save()
        return instance
