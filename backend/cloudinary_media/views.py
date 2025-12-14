# cloudinary_media/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import cloudinary.api
import cloudinary.uploader
from urllib.parse import unquote


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_cloudinary_resources(request):
    """
    Fetch all resources from Cloudinary
    GET /api/cloudinary-media/resources/
    Query params:
    - resource_type: image, video, raw (default: image)
    - folder: filter by folder prefix
    - max_results: max number of results (default: 500)
    """
    # Only allow admin users
    if request.user.role not in ['admin', 'service_head']:
        return Response(
            {'error': 'Only admins can access media library'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    resource_type = request.GET.get('resource_type', 'image')
    folder = request.GET.get('folder', '')
    max_results = int(request.GET.get('max_results', 500))
    
    try:
        resources = cloudinary.api.resources(
            type='upload',
            resource_type=resource_type,
            prefix=folder,
            max_results=max_results,
            context=True,
            tags=True
        )
        
        return Response({
            'resources': resources.get('resources', []),
            'total_count': resources.get('total_count', 0),
            'next_cursor': resources.get('next_cursor')
        })
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch resources: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cloudinary_resource(request, public_id):
    """
    Delete a resource from Cloudinary
    DELETE /api/cloudinary-media/resources/<public_id>/
    Query params:
    - resource_type: image, video, raw (default: image)
    """
    # Only allow admin users
    if request.user.role not in ['admin', 'service_head']:
        return Response(
            {'error': 'Only admins can delete media'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Decode the public_id
        public_id = unquote(public_id)
        resource_type = request.GET.get('resource_type', 'image')
        
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            invalidate=True
        )
        
        success = result.get('result') == 'ok'
        
        if success:
            return Response({
                'success': True,
                'message': 'Resource deleted successfully',
                'result': result
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to delete resource',
                'result': result
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Failed to delete resource: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_cloudinary_resource(request, public_id):
    """
    Update resource metadata (tags, context)
    PATCH /api/cloudinary-media/resources/<public_id>/update/
    Body:
    - tags: array of tags
    - context: object with metadata
    """
    # Only allow admin users
    if request.user.role not in ['admin', 'service_head']:
        return Response(
            {'error': 'Only admins can update media'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Decode the public_id
        public_id = unquote(public_id)
        tags = request.data.get('tags', [])
        context = request.data.get('context', {})
        
        result = cloudinary.uploader.explicit(
            public_id,
            type='upload',
            tags=tags,
            context=context
        )
        
        return Response({
            'success': True,
            'message': 'Resource updated successfully',
            'result': result
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to update resource: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cloudinary_folders(request):
    """
    Get list of folders in Cloudinary
    GET /api/cloudinary-media/folders/
    """
    # Only allow admin users
    if request.user.role not in ['admin', 'service_head']:
        return Response(
            {'error': 'Only admins can access media library'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        folders = cloudinary.api.root_folders()
        return Response({
            'folders': folders.get('folders', [])
        })
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch folders: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
