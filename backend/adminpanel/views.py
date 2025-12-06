from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
User = get_user_model()

from accounts.models import User
from services.models import Service, PricingPlan
from portfolio.models import PortfolioProject
from orders.models import Order
from adminpanel.models import Offer

from accounts.permissions import IsAdmin
from adminpanel.serializers import (
    AdminUserSerializer, AdminServiceSerializer,
    AdminPricingSerializer, AdminPortfolioApprovalSerializer,
    AdminOfferSerializer
)

class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "total_users": User.objects.count(),
            "clients": User.objects.filter(role="client").count(),
            "orders": Order.objects.count(),
            "completed_orders": Order.objects.filter(status="completed").count(),
            "services": Service.objects.count()
        })


class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer


class AdminServiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = Service.objects.all()
    serializer_class = AdminServiceSerializer


class AdminPricingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = PricingPlan.objects.all()
    serializer_class = AdminPricingSerializer


class AdminPortfolioApprovalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = PortfolioProject.objects.all()
    serializer_class = AdminPortfolioApprovalSerializer


class AdminOffersViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = Offer.objects.all()
    serializer_class = AdminOfferSerializer
