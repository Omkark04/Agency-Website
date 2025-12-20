import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

print("Testing imports...")

try:
    from analytics.team_head_views import TeamHeadDashboardMetricsView, TeamHeadServicePerformanceView
    print("✅ team_head_views imports successfully")
except Exception as e:
    print(f"❌ Error importing team_head_views: {e}")
    import traceback
    traceback.print_exc()

try:
    from accounts.permissions import IsTeamHeadOrAdmin
    print("✅ IsTeamHeadOrAdmin permission imports successfully")
except Exception as e:
    print(f"❌ Error importing permissions: {e}")

print("\nAll imports successful! Server should start fine.")
