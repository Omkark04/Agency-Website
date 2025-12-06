from rest_framework import viewsets
from .models import Department, PriceCard, Service
from .serializers import DepartmentSerializer, ServiceSerializer, PriceCardSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by("title")
    serializer_class = DepartmentSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("department", "title")
    serializer_class = ServiceSerializer

class PriceCardViewSet(viewsets.ModelViewSet):
    queryset = PriceCard.objects.all().order_by("service", "title")
    serializer_class = PriceCardSerializer
