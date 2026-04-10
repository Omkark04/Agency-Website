from rest_framework import serializers
from .models import Department, Service, PriceCard, PricingPlan, PricingComparison
from accounts.models import User
from media.models import Media



class TeamHeadMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class MediaMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ["id", "url", "media_type", "caption"]


class DepartmentSerializer(serializers.ModelSerializer):
    # ✅ READABLE TEAM HEAD
    team_head = TeamHeadMiniSerializer(read_only=True)
    
    # Hero Media
    hero_bg_desktop_details = MediaMiniSerializer(source="hero_bg_desktop", read_only=True)
    hero_bg_mobile_details = MediaMiniSerializer(source="hero_bg_mobile", read_only=True)

    # ✅ WRITABLE TEAM HEAD
    team_head_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="service_head"),
        source="team_head",
        write_only=True,
        required=False,
        allow_null=True,
    )

    slug = serializers.ReadOnlyField()

    class Meta:
        model = Department
        fields = [
            "id",
            "title",
            "slug",
            "logo",
            "short_description",
            "hero_caption",
            "hero_bg_desktop",
            "hero_bg_mobile",
            "hero_bg_desktop_details",
            "hero_bg_mobile_details",
            "team_head",
            "team_head_id",
            "priority",
            "is_active",
            "created_at",
        ]



class ServiceSerializer(serializers.ModelSerializer):
    department_title = serializers.CharField(
        source="department.title", read_only=True
    )
    
    # Readable team members
    team_members_details = serializers.SerializerMethodField(read_only=True)
    
    # Writable team members
    team_members = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="team_member"),
        many=True,
        required=False
    )
    
    class Meta:
        model = Service
        fields = [
            'id', 'title', 'slug', 'short_description', 'long_description', 
            'department', 'department_title', 'team_members', 'team_members_details',
            'priority', 'is_active', 'created_by', 'created_at'
        ]

    def get_team_members_details(self, obj):
        return TeamHeadMiniSerializer(obj.team_members.all(), many=True).data

class PriceCardSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source="service.title", read_only=True)
    department_title = serializers.CharField(source="department.title", read_only=True)

    class Meta:
        model = PriceCard
        fields = [
            "id",
            "title",
            "department",
            "department_title",
            "service",
            "service_title",
            "revisions",
            "description",
            "features",
            "delivery_days",
            "is_active",
            "created_at",
        ]

class PricingPlanSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source="service.title", read_only=True)
    
    class Meta:
        model = PricingPlan
        fields = ['id', 'title', 'description', 'price', 'price_numeric', 'billing_period', 
                 'is_popular', 'is_active', 'features', 'gradient_colors', 'button_text', 
                 'service', 'service_title', 'order_index', 'created_at']

class PricingComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingComparison
        fields = ['id', 'feature', 'basic', 'growth', 'enterprise', 'is_important', 'order_index']
