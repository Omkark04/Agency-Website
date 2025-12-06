from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsServiceHead
from orders.models import Order
from tasks.models import Task
from portfolio.models import PortfolioProject
from .serializers import (
    HeadOrderSerializer,
    HeadTaskSerializer,
    HeadPortfolioSerializer,
)
from django.contrib.auth import get_user_model
User = get_user_model()



class HeadDashboardStats(APIView):
    permission_classes = [IsServiceHead]

    def get(self, request):
        service = request.user.service

        orders = Order.objects.filter(service=service)
        tasks = Task.objects.filter(order__service=service)
        portfolio = PortfolioProject.objects.filter(service=service)

        return Response({
            "total_orders": orders.count(),
            "pending_orders": orders.filter(status="pending").count(),
            "in_progress_orders": orders.filter(status="in_progress").count(),
            "completed_orders": orders.filter(status="completed").count(),
            "tasks_created": tasks.count(),
            "portfolio_items": portfolio.count(),
        })


class HeadOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsServiceHead]
    serializer_class = HeadOrderSerializer

    def get_queryset(self):
        return Order.objects.filter(service=self.request.user.service)


class HeadTaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsServiceHead]
    serializer_class = HeadTaskSerializer

    def get_queryset(self):
        return Task.objects.filter(order__service=self.request.user.service)


class HeadPortfolioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsServiceHead]
    serializer_class = HeadPortfolioSerializer

    def get_queryset(self):
        return PortfolioProject.objects.filter(service=self.request.user.service)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
