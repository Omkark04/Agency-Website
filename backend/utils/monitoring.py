# utils/monitoring.py
"""
Monitoring and tracking utilities for security events and performance
"""
import logging
import time
from functools import wraps

logger = logging.getLogger('security')
performance_logger = logging.getLogger('performance')


def track_security_event(event_type, user=None, details=None):
    """
    Track security-related events
    
    Args:
        event_type: Type of security event (e.g., 'failed_login', 'suspicious_activity')
        user: User object or username
        details: Additional details about the event
    """
    log_data = {
        'event_type': event_type,
        'user': str(user) if user else 'Anonymous',
        'details': details or {}
    }
    
    logger.warning(f"Security Event: {event_type}", extra=log_data)
    
    # If Sentry is configured, send to Sentry as well
    try:
        import sentry_sdk
        sentry_sdk.capture_message(
            f"Security Event: {event_type}",
            level='warning',
            extras=log_data
        )
    except ImportError:
        pass  # Sentry not installed


def track_performance(operation_name):
    """
    Decorator to track operation performance
    
    Usage:
        @track_performance('database_query')
        def expensive_operation():
            pass
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                
                # Log slow operations
                if duration > 1.0:
                    performance_logger.warning(
                        f"Slow operation: {operation_name} took {duration:.2f}s",
                        extra={
                            'operation': operation_name,
                            'duration': duration,
                            'function': func.__name__
                        }
                    )
                else:
                    performance_logger.info(
                        f"Operation: {operation_name} completed in {duration:.2f}s"
                    )
        
        return wrapper
    return decorator


def log_api_call(request, response, duration):
    """Log API call details"""
    api_logger = logging.getLogger('api')
    
    log_data = {
        'method': request.method,
        'path': request.path,
        'status_code': response.status_code,
        'duration': f"{duration:.3f}s",
        'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
        'ip': get_client_ip(request),
    }
    
    if response.status_code >= 400:
        api_logger.error(f"API Error: {request.method} {request.path}", extra=log_data)
    elif duration > 1.0:
        api_logger.warning(f"Slow API: {request.method} {request.path}", extra=log_data)
    else:
        api_logger.info(f"API Call: {request.method} {request.path}", extra=log_data)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip
