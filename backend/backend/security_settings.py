# ============================================
# LOGGING CONFIGURATION
# ============================================

import os
from pathlib import Path

# Get BASE_DIR from the main settings
from django.conf import settings as django_settings
BASE_DIR = Path(__file__).resolve().parent.parent

# Create logs directory if it doesn't exist
LOGS_DIR = BASE_DIR / 'logs'
try:
    if not os.path.exists(LOGS_DIR):
        os.makedirs(LOGS_DIR)
except Exception:
    pass  # Directory might already exist or permissions issue

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'django.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'security.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'api_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'api.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'performance_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'performance.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'api': {
            'handlers': ['api_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'performance': {
            'handlers': ['performance_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'orders': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'payments': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}


# ============================================
# DJANGO-AXES CONFIGURATION (Failed Login Tracking)
# ============================================

# Authentication backends (add Axes backend)
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',  # Axes backend for login attempt tracking
    'django.contrib.auth.backends.ModelBackend',  # Default Django backend
]

AXES_ENABLED = True
AXES_FAILURE_LIMIT = 5  # Lock account after 5 failed attempts
AXES_COOLOFF_TIME = 1  # Lock for 1 hour (in hours)
AXES_RESET_ON_SUCCESS = True
AXES_LOCKOUT_TEMPLATE = None  # Use default
AXES_LOCKOUT_URL = None  # Use default
AXES_VERBOSE = True  # Log lockout events
# Removed deprecated settings: AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP, AXES_LOGGER


# ============================================
# DJANGO-DEFENDER CONFIGURATION (Brute Force Protection)
# ============================================

DEFENDER_LOGIN_FAILURE_LIMIT = 5  # Lock after 5 failed attempts
DEFENDER_COOLOFF_TIME = 3600  # Lock for 1 hour (in seconds)
DEFENDER_LOCKOUT_TEMPLATE = None  # Use default
DEFENDER_REDIS_URL = os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1')
DEFENDER_STORE_ACCESS_ATTEMPTS = True
DEFENDER_USE_CELERY = True  # Use Celery for async processing
DEFENDER_ACCESS_ATTEMPT_EXPIRATION = 24  # Keep logs for 24 hours


# ============================================
# CACHE CONFIGURATION (Redis)
# ============================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'agency',
        'TIMEOUT': 300,  # 5 minutes default
    }
}


# ============================================
# SECURITY SETTINGS (Production)
# ============================================

# Get DEBUG from environment (same as main settings)
DEBUG = os.getenv('DEBUG', 'True') == 'True'

if not DEBUG:
    # HTTPS/SSL
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Security Headers
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Proxy headers
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Session Security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = 86400  # 24 hours

# CSRF Security
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_AGE = 31449600  # 1 year


# ============================================
# RATE LIMITING
# ============================================

RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_VIEW = 'utils.ratelimit.ratelimit_handler'  # Custom handler


# ============================================
# SENTRY CONFIGURATION (Error Tracking)
# ============================================

SENTRY_DSN = os.getenv('SENTRY_DSN', '')

if SENTRY_DSN and not DEBUG:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.redis import RedisIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        traces_sample_rate=0.1,  # 10% of transactions
        send_default_pii=False,  # Don't send personal data
        environment=os.getenv('ENVIRONMENT', 'production'),
        release=os.getenv('RELEASE_VERSION', '1.0.0'),
    )
