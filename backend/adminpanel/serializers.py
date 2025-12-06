from rest_framework import serializers
from accounts.models import User
from services.models import Service, PricingPlan
from portfolio.models import PortfolioProject
from adminpanel.models import Offer

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "role",
            "phone", "company", "is_active",
            "avatar_url"
        ]

class AdminServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"

class AdminPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = "__all__"

class AdminPortfolioApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProject
        fields = "__all__"

class AdminOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = "__all__"
