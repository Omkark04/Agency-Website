# backend/check_cors.py
"""
Quick script to check CORS configuration in production
Run with: python check_cors.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings

print("=" * 60)
print("CORS CONFIGURATION CHECK")
print("=" * 60)

print("\n📋 Environment Variables:")
print(f"CORS_ALLOWED_ORIGINS env: {os.getenv('CORS_ALLOWED_ORIGINS', 'NOT SET')}")
print(f"CSRF_TRUSTED_ORIGINS env: {os.getenv('CSRF_TRUSTED_ORIGINS', 'NOT SET')}")
print(f"ALLOWED_HOSTS env: {os.getenv('ALLOWED_HOSTS', 'NOT SET')}")

print("\n✅ Django Settings (Actual Values):")
print(f"CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}")
print(f"CORS_ALLOW_ALL_ORIGINS: {settings.CORS_ALLOW_ALL_ORIGINS}")
print(f"CORS_ALLOW_CREDENTIALS: {settings.CORS_ALLOW_CREDENTIALS}")
print(f"CSRF_TRUSTED_ORIGINS: {settings.CSRF_TRUSTED_ORIGINS}")
print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")

print("\n🔍 Middleware Order:")
for i, middleware in enumerate(settings.MIDDLEWARE, 1):
    marker = "✅" if "cors" in middleware.lower() else "  "
    print(f"{marker} {i}. {middleware}")

print("\n" + "=" * 60)

# Check if udyogworks.in is in CORS_ALLOWED_ORIGINS
if 'https://udyogworks.in' in settings.CORS_ALLOWED_ORIGINS:
    print("✅ https://udyogworks.in is in CORS_ALLOWED_ORIGINS")
else:
    print("❌ https://udyogworks.in is NOT in CORS_ALLOWED_ORIGINS")
    print("   This is why CORS is failing!")

if settings.CORS_ALLOW_ALL_ORIGINS:
    print("✅ CORS_ALLOW_ALL_ORIGINS is True (allows all origins)")
else:
    print("ℹ️  CORS_ALLOW_ALL_ORIGINS is False (using specific origins)")

print("=" * 60)
