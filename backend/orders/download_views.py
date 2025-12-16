# orders/download_views.py

import requests
from django.http import FileResponse, HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .estimation_models import Estimation, Invoice


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_estimation_pdf(request, estimation_id):
    """
    Download estimation PDF with proper headers
    Proxies the Cloudinary URL to handle CORS and force download
    """
    try:
        estimation = Estimation.objects.get(id=estimation_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and estimation.order.client != user:
            return Response(
                {'error': 'You do not have permission to access this estimation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not estimation.pdf_url:
            return Response(
                {'error': 'PDF not generated yet'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Fetch PDF from Cloudinary - DO NOT use stream=True
        # Using stream=True with .content can cause corruption
        pdf_response = requests.get(estimation.pdf_url)
        
        if pdf_response.status_code != 200:
            return Response(
                {'error': 'Failed to fetch PDF from storage'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Verify we got actual PDF content
        content_type = pdf_response.headers.get('Content-Type', '')
        if 'application/pdf' not in content_type and 'application/octet-stream' not in content_type:
            return Response(
                {'error': f'Invalid content type: {content_type}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create response with proper headers
        response = HttpResponse(pdf_response.content, content_type='application/pdf')
        filename = f"estimation_{estimation.uuid}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = len(pdf_response.content)
        
        return response
        
    except Estimation.DoesNotExist:
        return Response(
            {'error': 'Estimation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice_pdf(request, invoice_id):
    """
    Download invoice PDF with proper headers
    Proxies the Cloudinary URL to handle CORS and force download
    """
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        
        # Check permissions
        user = request.user
        if user.role == 'client' and invoice.order.client != user:
            return Response(
                {'error': 'You do not have permission to access this invoice'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not invoice.pdf_url:
            return Response(
                {'error': 'PDF not generated yet'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Fetch PDF from Cloudinary - DO NOT use stream=True
        # Using stream=True with .content can cause corruption
        pdf_response = requests.get(invoice.pdf_url)
        
        if pdf_response.status_code != 200:
            return Response(
                {'error': 'Failed to fetch PDF from storage'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Verify we got actual PDF content
        content_type = pdf_response.headers.get('Content-Type', '')
        if 'application/pdf' not in content_type and 'application/octet-stream' not in content_type:
            return Response(
                {'error': f'Invalid content type: {content_type}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create response with proper headers
        response = HttpResponse(pdf_response.content, content_type='application/pdf')
        filename = f"invoice_{invoice.invoice_number}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = len(pdf_response.content)
        
        return response
        
    except Invoice.DoesNotExist:
        return Response(
            {'error': 'Invoice not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
