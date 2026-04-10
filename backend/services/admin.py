from django.contrib import admin
from .models import PriceCard, Service, Department

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'priority', 'is_active']
    search_fields = ['title']
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['hero_bg_desktop', 'hero_bg_mobile']

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'priority', 'is_active']
    search_fields = ['title']
    prepopulated_fields = {'slug': ('title',)}

@admin.register(PriceCard)
class PriceCardAdmin(admin.ModelAdmin):
    list_display = ['title', 'service', 'department', 'is_active']
    list_filter = ['title', 'department', 'service']