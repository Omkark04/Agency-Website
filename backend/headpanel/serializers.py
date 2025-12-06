from rest_framework import serializers
from orders.models import Order
from tasks.models import Task
from portfolio.models import PortfolioProject

class HeadOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"


class HeadTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"


class HeadPortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProject
        fields = "__all__"
