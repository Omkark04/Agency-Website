# backend/orders/views.py - Add this view

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ServiceForm

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_service_form(request, service_id):
    """
    Get the active form for a specific service
    """
    try:
        form = ServiceForm.objects.get(
            service_id=service_id,
            is_active=True
        )
        from .serializers import ServiceFormSerializer
        serializer = ServiceFormSerializer(form)
        return Response(serializer.data)
    except ServiceForm.DoesNotExist:
        return Response(
            {'error': 'No active form found for this service'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
