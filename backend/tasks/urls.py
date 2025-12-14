# tasks/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tasks', views.TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('orders/<int:order_id>/tasks/', views.order_tasks, name='order-tasks'),
    path('tasks/<int:task_id>/upload-attachment/', views.upload_task_attachment, name='upload-task-attachment'),
    path('tasks/<int:task_id>/remove-attachment/', views.remove_task_attachment, name='remove-task-attachment'),
]
