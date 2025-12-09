# analytics/urls.py
from django.urls import path
from .views import DashboardMetricsView, ServicePerformanceView, UserActivityView

urlpatterns = [
    path('dashboard/', DashboardMetricsView.as_view(), name='analytics-dashboard'),
    path('services/', ServicePerformanceView.as_view(), name='analytics-services'),
    path('users/', UserActivityView.as_view(), name='analytics-users'),
]
