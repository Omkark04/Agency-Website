# backend/health.py
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
import redis


def health_check(request):
    """
    Health check endpoint to verify service status.
    Checks database and Redis connectivity.
    """
    status = {
        "status": "healthy",
        "database": "unknown",
        "redis": "unknown"
    }
    
    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"error: {str(e)}"
        status["status"] = "unhealthy"
    
    # Check Redis
    try:
        redis_client = redis.Redis(host='localhost', port=6379, db=0, socket_connect_timeout=2)
        redis_client.ping()
        status["redis"] = "connected"
    except Exception as e:
        status["redis"] = f"error: {str(e)}"
        status["status"] = "unhealthy"
    
    return JsonResponse(status)
