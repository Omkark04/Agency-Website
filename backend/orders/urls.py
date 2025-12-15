# orders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import views (will be created)
from . import views
from . import estimation_views
from . import workflow_views

# Create separate routers to avoid conflicts
order_router = DefaultRouter()
order_router.register(r'', views.OrderViewSet, basename='order')

estimation_router = DefaultRouter()
estimation_router.register(r'', estimation_views.EstimationViewSet, basename='estimation')

invoice_router = DefaultRouter()
invoice_router.register(r'', estimation_views.InvoiceViewSet, basename='invoice')

urlpatterns = [
    # IMPORTANT: Custom endpoints MUST come BEFORE router.urls
    # Otherwise router catches everything
    
    # Workflow endpoints
    path('<int:order_id>/update-status/', workflow_views.update_order_status, name='update-order-status'),
    path('<int:order_id>/status-history/', workflow_views.order_status_history, name='order-status-history'),
    path('<int:order_id>/upload-deliverable/', workflow_views.upload_deliverable, name='upload-deliverable'),
    path('<int:order_id>/workflow-info/', workflow_views.get_workflow_info, name='workflow-info'),
    
    # Estimation endpoints
    path('<int:order_id>/estimations/', estimation_views.order_estimations, name='order-estimations'),
    path('estimations/<int:estimation_id>/generate-pdf/', estimation_views.generate_estimation_pdf, name='generate-estimation-pdf'),
    path('estimations/<int:estimation_id>/send/', estimation_views.send_estimation, name='send-estimation'),
    
    # Invoice endpoints
    path('<int:order_id>/invoices/generate/', estimation_views.generate_invoice, name='generate-invoice'),
    path('invoices/<int:invoice_id>/download/', estimation_views.download_invoice, name='download-invoice'),
    
    # Tasks endpoint (for consistency with other order-related endpoints)
    path('<int:order_id>/tasks/', include('tasks.urls_order_tasks')),
    
    # Service form endpoint
    path('services/<int:service_id>/form/', views.get_service_form, name='get-service-form'),
    
    # ViewSet routers - these provide list/detail endpoints
    path('estimations/', include(estimation_router.urls)),
    path('invoices/', include(invoice_router.urls)),
    
    # Order router (MUST be last to avoid catching everything)
    path('', include(order_router.urls)),
]
