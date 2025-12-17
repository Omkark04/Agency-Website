# accounts/permissions.py
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsTeamHead(permissions.BasePermission):
    """
    Custom permission to only allow team head (service_head) users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'service_head'


class IsTeamHeadOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow team heads or admins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['service_head', 'admin']


class IsServiceHead(permissions.BasePermission):
    """
    Alias for IsTeamHead for backward compatibility.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'service_head'


class IsTeamMember(permissions.BasePermission):
    """
    Custom permission to only allow team member users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'team_member'

