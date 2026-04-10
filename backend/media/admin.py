from django.contrib import admin
from .models import Media

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'media_type', 'owner', 'created_at']
    search_fields = ['file_name', 'caption', 'public_id']
    list_filter = ['media_type', 'created_at']