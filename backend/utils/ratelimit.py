# utils/ratelimit.py
"""
Rate limiting utilities and custom handlers
"""
from django.http import JsonResponse


def ratelimit_handler(request, exception):
    """
    Custom handler for rate limit exceeded responses
    
    Returns a JSON response with rate limit information
    """
    return JsonResponse({
        'error': 'Rate limit exceeded',
        'detail': 'Too many requests. Please try again later.',
        'retry_after': 3600  # seconds (1 hour)
    }, status=429)


def get_rate_limit_key(group, request):
    """
    Custom key function for rate limiting
    Can be used to create custom rate limit keys
    """
    if request.user.is_authenticated:
        return f'{group}:{request.user.id}'
    return f'{group}:{request.META.get("REMOTE_ADDR")}'
