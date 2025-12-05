from rest_framework import serializers
from .models import PortfolioProject

class PortfolioProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProject
        fields = '__all__'
