# middleware/logging_middleware.py
"""
Middleware for logging all requests and responses
"""
import logging
import time
import json
from utils.monitoring import get_client_ip, log_api_call

logger = logging.getLogger('django.request')


class RequestLoggingMiddleware:
    """Log all incoming requests and outgoing responses"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Start timer
        start_time = time.time()
        
        # Log request
        self.log_request(request)
        
        # Process request
        response = self.get_response(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log response
        self.log_response(request, response, duration)
        
        # Log API calls separately
        if request.path.startswith('/api/'):
            log_api_call(request, response, duration)
        
        return response
    
    def log_request(self, request):
        """Log incoming request details"""
        request_data = {
            'method': request.method,
            'path': request.path,
            'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
            'ip': get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')[:200],  # Limit length
        }
        
        # Don't log sensitive data
        if request.method in ['POST', 'PUT', 'PATCH']:
            # Log that there was a body, but not the content
            request_data['has_body'] = True
        
        logger.info(f"Request: {request.method} {request.path}", extra=request_data)
    
    def log_response(self, request, response, duration):
        """Log outgoing response details"""
        response_data = {
            'status_code': response.status_code,
            'duration': f"{duration:.3f}s",
            'path': request.path,
        }
        
        # Log level based on status code
        if response.status_code >= 500:
            logger.error(f"Server Error: {request.path}", extra=response_data)
        elif response.status_code >= 400:
            logger.warning(f"Client Error: {request.path}", extra=response_data)
        elif duration > 2.0:
            logger.warning(f"Slow Response: {request.path}", extra=response_data)
        else:
            logger.info(f"Response: {response.status_code}", extra=response_data)


class SecurityHeadersMiddleware:
    """Add security headers to all responses"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Content Security Policy (adjust as needed)
        if not request.path.startswith('/admin/'):
            response['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "img-src 'self' data: https:; "
                "font-src 'self' https://fonts.gstatic.com; "
                "connect-src 'self';"
            )
        
        return response


class CORSErrorHandlingMiddleware:
    """
    Ensure CORS headers are present on all responses, including error responses.
    This middleware runs after the view and ensures that even 500 errors have CORS headers.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        from django.conf import settings
        
        # Get the response
        response = self.get_response(request)
        
        # Only add CORS headers if not already present (django-cors-headers should handle most cases)
        # But ensure they're present on error responses which might bypass the CORS middleware
        origin = request.META.get('HTTP_ORIGIN')
        
        if origin and not response.has_header('Access-Control-Allow-Origin'):
            # Check if origin is allowed
            allowed = False
            
            # Check if all origins are allowed
            if getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False):
                allowed = True
            # Check if origin is in allowed list
            elif hasattr(settings, 'CORS_ALLOWED_ORIGINS'):
                if origin in settings.CORS_ALLOWED_ORIGINS:
                    allowed = True
            
            if allowed:
                response['Access-Control-Allow-Origin'] = origin
                
                # Add credentials header if configured
                if getattr(settings, 'CORS_ALLOW_CREDENTIALS', False):
                    response['Access-Control-Allow-Credentials'] = 'true'
                
                # Add allowed methods
                if hasattr(settings, 'CORS_ALLOW_METHODS'):
                    response['Access-Control-Allow-Methods'] = ', '.join(settings.CORS_ALLOW_METHODS)
                
                # Add allowed headers
                if hasattr(settings, 'CORS_ALLOW_HEADERS'):
                    response['Access-Control-Allow-Headers'] = ', '.join(settings.CORS_ALLOW_HEADERS)
        
        return response

