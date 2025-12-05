from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

from .models import User
from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': UserSerializer(user, context=self.get_serializer_context()).data,
            'message': 'User registered successfully.'
        }, status=status.HTTP_201_CREATED)

class ClientRegisterView(RegisterView):
    def post(self, request, *args, **kwargs):
        request.data['role'] = 'client'
        return super().post(request, *args, **kwargs)

class ServiceHeadRegisterView(RegisterView):
    permission_classes = [permissions.IsAdminUser]  # Only admins can create service heads
    
    def post(self, request, *args, **kwargs):
        request.data['role'] = 'service_head'
        return super().post(request, *args, **kwargs)

class TeamMemberRegisterView(RegisterView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        if request.user.role not in ['admin', 'service_head']:
            return Response(
                {'error': 'You do not have permission to register team members'},
                status=status.HTTP_403_FORBIDDEN
            )
        request.data['role'] = 'team_member'
        return super().post(request, *args, **kwargs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
                
                send_mail(
                    'Password Reset Request',
                    f'Click the link to reset your password: {reset_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return Response(
                    {'message': 'Password reset email sent'},
                    status=status.HTTP_200_OK
                )
            except User.DoesNotExist:
                # Don't reveal that the user doesn't exist
                return Response(
                    {'message': 'If this email exists, a password reset link has been sent'},
                    status=status.HTTP_200_OK
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
                
                if default_token_generator.check_token(user, token):
                    user.set_password(serializer.validated_data['new_password'])
                    user.save()
                    return Response(
                        {'message': 'Password has been reset successfully'},
                        status=status.HTTP_200_OK
                    )
                return Response(
                    {'error': 'Invalid token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response(
                    {'error': 'Invalid user'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
