from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, 
    ClientRegisterView, 
    ServiceHeadRegisterView, 
    TeamMemberRegisterView,
    CustomTokenObtainPairView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserProfileView,
    GoogleOAuthView
)

urlpatterns = [
    # Authentication
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleOAuthView.as_view(), name='google_oauth'),
    
    # Registration
    path('register/client/', ClientRegisterView.as_view(), name='register_client'),
    path('register/service-head/', ServiceHeadRegisterView.as_view(), name='register_service_head'),
    path('register/team-member/', TeamMemberRegisterView.as_view(), name='register_team_member'),
    
    # Password Reset
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password/reset/confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), 
         name='password_reset_confirm'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
