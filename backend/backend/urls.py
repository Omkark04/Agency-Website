from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
# Viewsets
from services.views import ServiceViewSet, PricingPlanViewSet
from orders.views import OrderViewSet
from portfolio.views import PortfolioProjectViewSet
from tasks.views import TaskViewSet
from media.views import MediaViewSet

# JWT Auth
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# MAIN API ROUTER
router = routers.DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'pricing-plans', PricingPlanViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'portfolio', PortfolioProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'media', MediaViewSet)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Public API Routes for regular modules
    path('api/', include(router.urls)),

    # Authentication (accounts app)
    path('auth/', include("accounts.urls")),

    # JWT Endpoints (optional but recommended)
    path("auth/jwt/login/", TokenObtainPairView.as_view(), name="jwt-login"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),

    # ⭐ ADMIN PANEL ENDPOINTS (IMPORTANT)
    path('api/admin/', include('adminpanel.urls')),

    #service head urls
    path("api/head/", include("headpanel.urls")),

]

schema_view = get_schema_view(
    openapi.Info(
        title="UdyogWorks API",
        default_version='v1',
        description="API documentation for UdyogWorks backend",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns += [
    path('docs/', schema_view.with_ui('swagger', cache_timeout=0)),
]
