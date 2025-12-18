from django.contrib import admin
from .models import Offer, Order, Review
from .estimation_models import Estimation, Invoice


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'is_approved', 'is_featured', 'offer_type', 'valid_from', 'valid_to', 'created_by']
    list_filter = ['is_active', 'is_approved', 'is_featured', 'offer_type', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['is_active', 'is_approved', 'is_featured']
    readonly_fields = ['created_at', 'updated_at', 'approved_at']
    filter_horizontal = ['services']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description', 'image')
        }),
        ('Offer Details', {
            'fields': ('offer_type', 'services', 'features', 'conditions', 'terms')
        }),
        ('Pricing', {
            'fields': ('original_price', 'discounted_price', 'discount_type', 'discount_value', 'discount_code')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_to')
        }),
        ('Status & Visibility', {
            'fields': ('is_active', 'is_approved', 'is_featured', 'is_limited_time', 'priority')
        }),
        ('CTA & UI', {
            'fields': ('cta_text', 'cta_link', 'icon_name', 'gradient_colors', 'button_text', 'button_url')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_by_department', 'approved_by', 'approved_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # New object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


admin.site.register(Review)
admin.site.register(Order)
admin.site.register(Estimation)
admin.site.register(Invoice)