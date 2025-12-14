# cloudinary_media/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('resources/', views.list_cloudinary_resources, name='cloudinary-list'),
    path('resources/<path:public_id>/', views.delete_cloudinary_resource, name='cloudinary-delete'),
    path('resources/<path:public_id>/update/', views.update_cloudinary_resource, name='cloudinary-update'),
    path('folders/', views.get_cloudinary_folders, name='cloudinary-folders'),
]
