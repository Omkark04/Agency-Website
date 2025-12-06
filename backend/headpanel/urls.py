from django.urls import path
from rest_framework.routers import DefaultRouter
from headpanel.views import (
    HeadDashboardStats,
    HeadOrderViewSet,
    HeadTaskViewSet,
    HeadPortfolioViewSet
)

router = DefaultRouter()
router.register("orders", HeadOrderViewSet, basename="head-orders")
router.register("tasks", HeadTaskViewSet, basename="head-tasks")
router.register("portfolio", HeadPortfolioViewSet, basename="head-portfolio")

urlpatterns = [
    path("stats/", HeadDashboardStats.as_view(), name="head-stats"),
]

urlpatterns += router.urls
