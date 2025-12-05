from django.shortcuts import render

from rest_framework import viewsets
from .models import Service, PricingPlan
from .serializers import ServiceSerializer, PricingPlanSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class PricingPlanViewSet(viewsets.ModelViewSet):
    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer
