from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from services.views import ServiceViewSet, PricingPlanViewSet
from orders.views import OrderViewSet
from portfolio.views import PortfolioProjectViewSet
from tasks.views import TaskViewSet
from media.views import MediaViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'pricing-plans', PricingPlanViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'portfolio', PortfolioProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'media', MediaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('auth/', include("accounts.urls")),  # Added /api/ prefix here
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
