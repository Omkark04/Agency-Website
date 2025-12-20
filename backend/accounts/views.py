# accounts/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_str, force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
import google.oauth2.id_token
import google.auth.transport.requests
from accounts.permissions import IsAdmin

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
    ChangeEmailSerializer,
)

User = get_user_model()

@method_decorator(ratelimit(key='ip', rate='10/h', method='POST'), name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "message": "User registered successfully.",
            },
            status=status.HTTP_201_CREATED,
        )

class ClientRegisterView(RegisterView):
    def post(self, request, *args, **kwargs):
        request.data["role"] = "client"
        return super().post(request, *args, **kwargs)

class ServiceHeadRegisterView(RegisterView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, *args, **kwargs):
        request.data["role"] = "service_head"
        return super().post(request, *args, **kwargs)

class TeamMemberRegisterView(RegisterView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role not in ["admin", "service_head"]:
            return Response({"error": "You do not have permission to register team members"}, status=status.HTTP_403_FORBIDDEN)
        request.data["role"] = "team_member"
        return super().post(request, *args, **kwargs)

@method_decorator(ratelimit(key='ip', rate='5/m', method='POST'), name='dispatch')
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@method_decorator(ratelimit(key='ip', rate='3/h', method='POST'), name='dispatch')
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            try:
                user = User.objects.get(email=email)
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
                send_mail(
                    "Password Reset Request",
                    f"Click the link to reset your password: {reset_url}",
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
            except User.DoesNotExist:
                pass  # Do not reveal existence
            return Response({"message": "If this email exists, a password reset link has been sent"}, status=status.HTTP_200_OK)
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
                    user.set_password(serializer.validated_data["new_password"])
                    user.save()
                    return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile view that returns role-specific serializer based on user's role.
    GET: Retrieve current user profile
    PUT/PATCH: Update current user profile
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer based on user role"""
        from .serializers import (
            AdminProfileSerializer,
            ClientProfileSerializer,
            ServiceHeadProfileSerializer,
            TeamMemberProfileSerializer
        )
        
        user = self.request.user
        if user.role == 'admin':
            return AdminProfileSerializer
        elif user.role == 'client':
            return ClientProfileSerializer
        elif user.role == 'service_head':
            return ServiceHeadProfileSerializer
        elif user.role == 'team_member':
            return TeamMemberProfileSerializer
        else:
            return UserSerializer

    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        """Override update to prevent email modification"""
        if 'email' in request.data and request.data['email'] != request.user.email:
            return Response(
                {"error": "Email cannot be modified"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request, *args, **kwargs)

@method_decorator(ratelimit(key='ip', rate='10/h', method='POST'), name='dispatch')
class GoogleOAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token = request.data.get("id_token")
        if not id_token:
            return Response({"error": "id_token is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            idinfo = google.oauth2.id_token.verify_oauth2_token(id_token, google.auth.transport.requests.Request(), settings.GOOGLE_CLIENT_ID)
            email = idinfo.get("email")
            user, created = User.objects.get_or_create(email=email, defaults={"username": email.split("@")[0], "google_id": idinfo.get("sub"), "role": "client"})
            if not created and not user.google_id:
                user.google_id = idinfo.get("sub")
                user.save()
            refresh = RefreshToken.for_user(user)
            return Response({"user": UserSerializer(user).data, "access": str(refresh.access_token), "refresh": str(refresh)})
        except ValueError:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ratelimit(key='ip', rate='5/m', method='POST'), name='dispatch')
class AdminEnvLoginView(APIView):
    """
    Admin login using environment variables.
    This endpoint allows admin to login using credentials stored in .env file.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check against environment variables
        admin_email = settings.ADMIN_EMAIL
        admin_password = settings.ADMIN_PASSWORD

        if not admin_email or not admin_password:
            return Response({"error": "Admin credentials not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if email == admin_email and password == admin_password:
            # Get or create admin user
            user, created = User.objects.get_or_create(
                email=admin_email,
                defaults={
                    "username": "admin",
                    "role": "admin",
                    "is_staff": True,
                    "is_superuser": True
                }
            )
            
            # Ensure user has admin role
            if user.role != "admin":
                user.role = "admin"
                user.is_staff = True
                user.is_superuser = True
                user.save()

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "message": "Admin logged in successfully"
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter users based on role:
        - Admin: sees all users
        - Service Head: sees only users from their department
        """
        user = self.request.user
        queryset = User.objects.all()
        
        # Service heads can only see users from their department
        if user.role == 'service_head':
            if user.department:
                # Show team members and the service head themselves from their department
                queryset = queryset.filter(department=user.department)
            else:
                # No department assigned, return empty queryset
                queryset = queryset.none()
        elif user.role != 'admin':
            # Other roles cannot access this endpoint
            queryset = queryset.none()
        
        
        return queryset.order_by('-date_joined')

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data["old_password"]):
                 return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangeEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangeEmailSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data["password"]):
                 return Response({"password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            new_email = serializer.validated_data["new_email"]
            if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                 return Response({"new_email": ["Email already exists."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.email = new_email
            user.save()
            return Response({"message": "Email updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
