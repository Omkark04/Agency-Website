from rest_framework import permissions


class IsAdminOrAuthor(permissions.BasePermission):
    """
    Custom permission to only allow:
    - Admins to edit/delete any blog
    - Authors to edit/delete only their own blogs
    - Department Heads (service_head) to create blogs
    """
    
    def has_permission(self, request, view):
        """Check if user can create blogs"""
        # Allow if user is authenticated and is admin or service_head
        if request.method == 'POST':
            return request.user and request.user.is_authenticated and (
                request.user.role in ['admin', 'service_head']
            )
        return True
    
    def has_object_permission(self, request, view, obj):
        """Check if user can edit/delete specific blog"""
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admin can edit/delete any blog
        if request.user.role == 'admin':
            return True
        
        # Author can edit/delete own blog
        return obj.author == request.user
