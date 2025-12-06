from rest_framework import serializers
from .models import Department, Service, PriceCard

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class PriceCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceCard
        fields = "__all__"
