from rest_framework import permissions


class IsAdminOrServiceHead(permissions.BasePermission):
    """
    Permission for Admin or Service Head (team_head of department).
    - Admins can manage all forms
    - Service Heads can only manage forms for services in their department
    """
    
    def has_permission(self, request, view):
        # Allow read access to everyone (public can view forms)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write operations require authentication
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin and service_head can create/update/delete
        return request.user.role in ['admin', 'service_head']
    
    def has_object_permission(self, request, view, obj):
        # Allow read access to everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        user = request.user
        
        # Admin has full access
        if user.role == 'admin':
            return True
        
        # Service head can only manage forms for their department's services
        if user.role == 'service_head':
            # Check if the form's service belongs to user's department
            if hasattr(obj, 'service'):
                return obj.service.department.team_head == user
            elif hasattr(obj, 'form'):
                # For ServiceFormField objects
                return obj.form.service.department.team_head == user
        
        return False


class IsAdmin(permissions.BasePermission):
    """Admin-only permission"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'
