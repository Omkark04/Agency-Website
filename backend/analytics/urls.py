# analytics/urls.py
from django.urls import path
from .views import (
    DashboardMetricsView, ServicePerformanceView, UserActivityView,
    GA4RealtimeView, GA4OverviewView, GA4PagesView,
    GA4SourcesView, GA4DevicesView, GA4DemographicsView
)

urlpatterns = [
    path('dashboard/', DashboardMetricsView.as_view(), name='analytics-dashboard'),
    path('services/', ServicePerformanceView.as_view(), name='analytics-services'),
    path('users/', UserActivityView.as_view(), name='analytics-users'),
    
    # Google Analytics 4 endpoints
    path('ga4/realtime/', GA4RealtimeView.as_view(), name='ga4-realtime'),
    path('ga4/overview/', GA4OverviewView.as_view(), name='ga4-overview'),
    path('ga4/pages/', GA4PagesView.as_view(), name='ga4-pages'),
    path('ga4/sources/', GA4SourcesView.as_view(), name='ga4-sources'),
    path('ga4/devices/', GA4DevicesView.as_view(), name='ga4-devices'),
    path('ga4/demographics/', GA4DemographicsView.as_view(), name='ga4-demographics'),
]
