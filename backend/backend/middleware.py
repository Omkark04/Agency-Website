# backend/middleware.py
"""
Custom middleware for request logging and security.
"""
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all incoming requests for audit trails.
    """
    def process_request(self, request):
        logger.info(
            f"Request: {request.method} {request.path} "
            f"from {self.get_client_ip(request)} "
            f"User: {request.user if request.user.is_authenticated else 'Anonymous'}"
        )
        return None

    def get_client_ip(self, request):
        """Get the client's IP address from the request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
