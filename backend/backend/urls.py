from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from media.views import UploadMediaView
# Viewsets
from services.views import ServiceViewSet, DepartmentViewSet, PriceCardViewSet
from orders.views import OrderViewSet
from portfolio.views import PortfolioProjectViewSet
from tasks.views import TaskViewSet
from media.views import MediaViewSet, UploadMediaView

# Contacts app
from contacts.views import ContactSubmissionView

# JWT Auth
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# MAIN API ROUTER
router = routers.DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'price-cards', PriceCardViewSet)
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

    # Image upload
    path("api/upload/", UploadMediaView.as_view()),
    
    # Contact form
    path("api/contact/", include('contacts.urls')),

    # JWT Endpoints (optional but recommended)
    path("auth/jwt/login/", TokenObtainPairView.as_view(), name="jwt-login"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),

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
