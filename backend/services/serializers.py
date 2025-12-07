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
    class Meta:
        model = Service
        fields = "__all__"


class PriceCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceCard
        fields = "__all__"
