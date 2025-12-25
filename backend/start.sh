#!/bin/bash
# Run migrations at startup (internal network is available at runtime)
python manage.py migrate --noinput

# Start Gunicorn
exec gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
