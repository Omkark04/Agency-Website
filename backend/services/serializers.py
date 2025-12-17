from rest_framework import serializers
from .models import Department, Service, PriceCard
from accounts.models import User


from rest_framework import serializers
from .models import Department, Service, PriceCard
from accounts.models import User


class TeamHeadMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class DepartmentSerializer(serializers.ModelSerializer):
    # ✅ READABLE TEAM HEAD
    team_head = TeamHeadMiniSerializer(read_only=True)

    # ✅ WRITABLE TEAM HEAD
    team_head_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="service_head"),
        source="team_head",
        write_only=True,
        required=False,
        allow_null=True,
    )

    slug= serializers.ReadOnlyField()

    class Meta:
        model = Department
        fields = [
            "id",
            "title",
            "slug",
            "logo",
            "short_description",
            "team_head",
            "team_head_id",
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
        fields = "__all__"
        read_only_fields = ["id", "slug", "created_at", "updated_at", "created_by"]
    
    def get_team_members_details(self, obj):
        return [
            {
                "id": member.id,
                "username": member.username,
                "email": member.email,
                "job_title": member.job_title
            }
            for member in obj.team_members.all()
        ]

    def create(self, validated_data):
        team_members = validated_data.pop('team_members', [])
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user
        service = super().create(validated_data)
        service.team_members.set(team_members)
        return service
    
    def update(self, instance, validated_data):
        team_members = validated_data.pop('team_members', None)
        service = super().update(instance, validated_data)
        if team_members is not None:
            service.team_members.set(team_members)
        return service



class PriceCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceCard
        fields = "__all__"
from rest_framework import serializers
from .models import PricingPlan, PricingComparison

# Your existing serializers...

class PricingFeatureSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()
    is_included = serializers.BooleanField()
    is_highlighted = serializers.BooleanField(required=False)
    tooltip = serializers.CharField(required=False, allow_blank=True)

class PricingPlanSerializer(serializers.ModelSerializer):
    features = serializers.JSONField()
    service_title = serializers.CharField(source='service.title', read_only=True)
    service_id = serializers.IntegerField(source='service.id', read_only=True)
    
    class Meta:
        model = PricingPlan
        fields = [
            'id', 'title', 'description', 'price', 'price_numeric',
            'billing_period', 'is_popular', 'is_active', 'features',
            'gradient_colors', 'button_text', 'service_id', 'service_title',
            'order_index', 'created_at'
        ]

class PricingComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingComparison
        fields = ['id', 'feature', 'basic', 'growth', 'enterprise', 'is_important', 'order_index']

