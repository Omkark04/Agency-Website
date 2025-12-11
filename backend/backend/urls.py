from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from media.views import UploadMediaView

# Import all viewsets
from services.views import (
    ServiceViewSet, DepartmentViewSet, PriceCardViewSet,
    PricingPlanViewSet, PricingComparisonListView,
    PricingStatsView,  PublicServiceListView
)
from orders.views import OrderViewSet, OfferViewSet
from portfolio.views import (
    PortfolioProjectViewSet, CaseStudyViewSet, 
    CaseStudyBySlugView, CaseStudyStatsView
)
from testimonials.views import TestimonialViewSet, TestimonialStatsView
from tasks.views import TaskViewSet
from media.views import MediaViewSet, UploadMediaView
from notifications.views import NotificationViewSet

# Import stats views - ADD THIS
from stats.views import CompanyStatsView, FeaturedClientsView

# Contacts app
from contacts.views import ContactSubmissionView

# Health check
from backend.health import health_check

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
router.register(r'case-studies', CaseStudyViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'media', MediaViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'pricing-plans', PricingPlanViewSet)
router.register(r'testimonials', TestimonialViewSet)
router.register(r'offers', OfferViewSet)
urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Health check
    path('healthz', health_check, name='health_check'),

    # Public API Routes for regular modules
    path('api/', include(router.urls)),

    # Authentication (accounts app)
    path('auth/', include("accounts.urls")),

    # Analytics
    path('api/analytics/', include('analytics.urls')),

    # Image upload
    path("api/upload/", UploadMediaView.as_view()),
    
    # Contact form
    path("api/contact/", include('contacts.urls')),

    # JWT Endpoints
    path("auth/jwt/login/", TokenObtainPairView.as_view(), name="jwt-login"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),

    #Public Services
    path('api/public/services/', PublicServiceListView.as_view(), name='public-services'),
    # Additional endpoints
    path('api/pricing/comparison/', PricingComparisonListView.as_view(), name='pricing-comparison'),
    path('api/pricing/stats/', PricingStatsView.as_view(), name='pricing-stats'),
    path('api/case-studies/slug/<slug:slug>/', CaseStudyBySlugView.as_view(), name='case-study-by-slug'),
    path('api/case-studies/stats/', CaseStudyStatsView.as_view(), name='case-study-stats'),
    path('api/testimonials/stats/', TestimonialStatsView.as_view(), name='testimonial-stats'),
    
    # Add these missing endpoints - ADD THESE TWO LINES
    path('api/company-stats/', CompanyStatsView.as_view(), name='company-stats'),
    path('api/clients/featured/', FeaturedClientsView.as_view(), name='featured-clients'),

    #Offers
    path('api/offers/stats/', OfferViewSet.as_view({'get': 'stats'}), name='offer-stats'),
    path('api/offers/', OfferViewSet.as_view({'create': 'offers'}), name='offers'),
    path('api/offers/current-deal/', OfferViewSet.as_view({'get': 'current_deal'}), name='current-deal'),

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