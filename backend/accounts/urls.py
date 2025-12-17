# accounts/urls.py
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
    GoogleOAuthView,
    AdminEnvLoginView,
    AdminUserListView,
    ChangePasswordView,
    ChangeEmailView,
)
from .team_head_views import (
    TeamHeadStatsView,
    TeamMembersListView,
    TeamMemberDetailView,
    TeamProjectsListView,
    TeamTasksListView,
    TeamTaskCreateView,
    TeamTaskDetailView,
    TeamPerformanceView,
    RecentActivityView,
    DepartmentTeamMembersView,
)
from .team_member_views import (
    TeamMemberStatsView,
    TeamMemberTasksListView,
    TeamMemberTaskUpdateView,
)

urlpatterns = [
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("google/", GoogleOAuthView.as_view(), name="google_oauth"),
    path("admin/login/", AdminEnvLoginView.as_view(), name="admin_env_login"),
    path("register/client/", ClientRegisterView.as_view(), name="register_client"),
    path("register/service-head/", ServiceHeadRegisterView.as_view(), name="register_service_head"),
    path("register/team-member/", TeamMemberRegisterView.as_view(), name="register_team_member"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path("password/reset/confirm/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("password/change/", ChangePasswordView.as_view(), name="password_change"),
    path("email/change/", ChangeEmailView.as_view(), name="email_change"),
    path("profile/", UserProfileView.as_view(), name="user_profile"),
    path("admin/users/", AdminUserListView.as_view()),
    path("department/team-members/", DepartmentTeamMembersView.as_view(), name="department_team_members"),
    
    # Team Head Dashboard Routes
    path("team-head/stats/", TeamHeadStatsView.as_view(), name="team_head_stats"),
    path("team-head/members/", TeamMembersListView.as_view(), name="team_members_list"),
    path("team-head/members/<int:pk>/", TeamMemberDetailView.as_view(), name="team_member_detail"),
    path("team-head/projects/", TeamProjectsListView.as_view(), name="team_projects"),
    path("team-head/tasks/", TeamTasksListView.as_view(), name="team_tasks"),
    path("team-head/tasks/create/", TeamTaskCreateView.as_view(), name="team_task_create"),
    path("team-head/tasks/<int:pk>/", TeamTaskDetailView.as_view(), name="team_task_detail"),
    path("team-head/performance/", TeamPerformanceView.as_view(), name="team_performance"),
    path("team-head/activity/", RecentActivityView.as_view(), name="recent_activity"),
    
    # Team Member Dashboard Routes
    path("team-member/stats/", TeamMemberStatsView.as_view(), name="team_member_stats"),
    path("team-member/tasks/", TeamMemberTasksListView.as_view(), name="team_member_tasks"),
    path("team-member/tasks/<int:pk>/", TeamMemberTaskUpdateView.as_view(), name="team_member_task_update"),
]
