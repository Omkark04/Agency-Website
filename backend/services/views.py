from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department, PriceCard, Service
from .serializers import DepartmentSerializer, ServiceSerializer, PriceCardSerializer
from accounts.permissions import IsAdmin


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by("title")
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdmin]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("department", "title")
    serializer_class = ServiceSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["department"]


class PriceCardViewSet(viewsets.ModelViewSet):
    queryset = PriceCard.objects.all().order_by("service", "price")
    serializer_class = PriceCardSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["service", "department"]
