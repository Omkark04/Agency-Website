from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.conf import settings
from django.conf.urls.static import static

# Upload
from media.views import UploadMediaView

# Viewsets
from services.views import (
    ServiceViewSet, DepartmentViewSet, PriceCardViewSet,
    PricingPlanViewSet, PricingComparisonListView,
    PricingStatsView, PublicServiceListView
)
from orders.views import OrderViewSet, OfferViewSet
from portfolio.views import (
    PortfolioProjectViewSet, CaseStudyViewSet,
    CaseStudyBySlugView, CaseStudyStatsView
)
from testimonials.views import TestimonialViewSet, TestimonialStatsView
from tasks.views import TaskViewSet
from media.views import MediaViewSet
from notifications.views import NotificationViewSet
from stats.views import CompanyStatsView, FeaturedClientsView
from contacts.views import ContactSubmissionView
from backend.health import health_check

# JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r"departments", DepartmentViewSet)
router.register(r"services", ServiceViewSet)
router.register(r"price-cards", PriceCardViewSet)
router.register(r"orders", OrderViewSet)
router.register(r"portfolio", PortfolioProjectViewSet)
router.register(r"case-studies", CaseStudyViewSet)
router.register(r"tasks", TaskViewSet)
router.register(r"media", MediaViewSet)
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"pricing-plans", PricingPlanViewSet)
router.register(r"testimonials", TestimonialViewSet)
router.register(r"offers", OfferViewSet)   # FULL CRUD enabled

schema_view = get_schema_view(
    openapi.Info(
        title="UdyogWorks API",
        default_version="v1",
        description="API documentation for UdyogWorks backend",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("healthz", health_check, name="health_check"),

    # Testimonials stats - MUST be before router
    path("api/testimonials/stats/", TestimonialStatsView.as_view()),

    # Main API router
    path("api/", include(router.urls)),

    # Auth
    path("auth/", include("accounts.urls")),
    path("auth/jwt/login/", TokenObtainPairView.as_view(), name="jwt-login"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),

    # Analytics
    path("api/analytics/", include("analytics.urls")),

    # Upload
    path("api/upload/", UploadMediaView.as_view()),

    # Contact
    path("api/contact/", include("contacts.urls")),

    # Public services
    path("api/public/services/", PublicServiceListView.as_view()),

    # Pricing
    path("api/pricing/comparison/", PricingComparisonListView.as_view()),
    path("api/pricing/stats/", PricingStatsView.as_view()),

    # Case studies
    path("api/case-studies/slug/<slug:slug>/", CaseStudyBySlugView.as_view()),
    path("api/case-studies/stats/", CaseStudyStatsView.as_view()),

    # Company data
    path("api/company-stats/", CompanyStatsView.as_view()),
    path("api/clients/featured/", FeaturedClientsView.as_view()),

    # Offers special endpoints
    path("api/offers/stats/", OfferViewSet.as_view({"get": "stats"})),
    path("api/offers/current-deal/", OfferViewSet.as_view({"get": "current_deal"})),
]

urlpatterns += [
    path("docs/", schema_view.with_ui("swagger", cache_timeout=0)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
