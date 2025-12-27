from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.linkedin_oauth2.views import LinkedInOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
import requests
import os

User = get_user_model()


class GoogleLogin(SocialLoginView):
    """
    Google OAuth2 login endpoint
    """
    adapter_class = GoogleOAuth2Adapter
    callback_url = os.getenv('FRONTEND_URL', 'http://localhost:3000') + '/auth/callback'
    client_class = OAuth2Client


class LinkedInLogin(SocialLoginView):
    """
    LinkedIn OAuth2 login endpoint
    """
    adapter_class = LinkedInOAuth2Adapter
    callback_url = os.getenv('FRONTEND_URL', 'http://localhost:3000') + '/auth/callback'
    client_class = OAuth2Client


class GoogleCallbackView(APIView):
    """
    Handle Google OAuth callback and return JWT tokens
    """
    permission_classes = []
    
    def post(self, request):
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        
        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use redirect_uri from request or fall back to environment variable
        if not redirect_uri:
            redirect_uri = os.getenv('FRONTEND_URL', 'http://localhost:5173') + '/auth/callback'
        
        try:
            # Exchange code for access token
            token_url = 'https://oauth2.googleapis.com/token'
            token_data = {
                'code': code,
                'client_id': os.getenv('GOOGLE_CLIENT_ID'),
                'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code'
            }
            
            # Debug logging
            print(f"🔍 Google OAuth Debug:")
            print(f"  Code (first 20 chars): {code[:20]}...")
            print(f"  Redirect URI: {redirect_uri}")
            print(f"  Client ID: {os.getenv('GOOGLE_CLIENT_ID')[:20]}...")
            
            token_response = requests.post(token_url, data=token_data)
            token_json = token_response.json()
            
            print(f"  Response status: {token_response.status_code}")
            print(f"  Response: {token_json}")
            
            if 'error' in token_json:
                error_msg = token_json.get('error_description', token_json.get('error', 'Failed to get access token'))
                print(f"  ❌ Error: {error_msg}")
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            access_token = token_json.get('access_token')
            
            # Get user info from Google
            user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
            headers = {'Authorization': f'Bearer {access_token}'}
            user_info_response = requests.get(user_info_url, headers=headers)
            user_info = user_info_response.json()
            
            # Get or create user
            email = user_info.get('email')
            google_id = user_info.get('id')
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': user_info.get('given_name', ''),
                    'last_name': user_info.get('family_name', ''),
                }
            )
            
            # Create or update social account
            social_account, _ = SocialAccount.objects.get_or_create(
                user=user,
                provider='google',
                defaults={'uid': google_id}
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LinkedInCallbackView(APIView):
    """
    Handle LinkedIn OAuth callback and return JWT tokens
    """
    permission_classes = []
    
    def post(self, request):
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        
        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use redirect_uri from request or fall back to environment variable
        if not redirect_uri:
            redirect_uri = os.getenv('FRONTEND_URL', 'http://localhost:5173') + '/auth/callback'
        
        try:
            # Exchange code for access token
            token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
            token_data = {
                'grant_type': 'authorization_code',
                'code': code,
                'client_id': os.getenv('LINKEDIN_CLIENT_ID'),
                'client_secret': os.getenv('LINKEDIN_CLIENT_SECRET'),
                'redirect_uri': redirect_uri
            }
            
            # Debug logging
            print(f"🔍 LinkedIn OAuth Debug:")
            print(f"  Code (first 20 chars): {code[:20]}...")
            print(f"  Redirect URI: {redirect_uri}")
            print(f"  Client ID: {os.getenv('LINKEDIN_CLIENT_ID')}")
            
            token_response = requests.post(token_url, data=token_data)
            token_json = token_response.json()
            
            print(f"  Response status: {token_response.status_code}")
            print(f"  Response: {token_json}")
            
            if 'error' in token_json:
                error_msg = token_json.get('error_description', token_json.get('error', 'Failed to get access token'))
                print(f"  ❌ Error: {error_msg}")
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            access_token = token_json.get('access_token')
            
            # Get user info from LinkedIn
            user_info_url = 'https://api.linkedin.com/v2/userinfo'
            headers = {'Authorization': f'Bearer {access_token}'}
            user_info_response = requests.get(user_info_url, headers=headers)
            user_info = user_info_response.json()
            
            # Get or create user
            email = user_info.get('email')
            linkedin_id = user_info.get('sub')
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': user_info.get('given_name', ''),
                    'last_name': user_info.get('family_name', ''),
                }
            )
            
            # Create or update social account
            social_account, _ = SocialAccount.objects.get_or_create(
                user=user,
                provider='linkedin_oauth2',
                defaults={'uid': linkedin_id}
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
