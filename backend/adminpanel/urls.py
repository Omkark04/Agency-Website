from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AdminStatsView,
    AdminUserViewSet,
    AdminServiceViewSet,
    AdminPricingViewSet,
    AdminPortfolioApprovalViewSet,
    AdminOffersViewSet
)

router = DefaultRouter()
router.register('users', AdminUserViewSet, basename='admin-users')
router.register('services', AdminServiceViewSet, basename='admin-services')
router.register('pricing', AdminPricingViewSet, basename='admin-pricing')
router.register('portfolio/approvals', AdminPortfolioApprovalViewSet, basename='admin-portfolio')
router.register('offers', AdminOffersViewSet, basename='admin-offers')

urlpatterns = [
    path('stats/', AdminStatsView.as_view()),
]

urlpatterns += router.urls
