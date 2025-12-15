# accounts/team_head_views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .serializers import TeamMemberSerializer, TeamStatsSerializer, TeamPerformanceSerializer, UserSerializer
from .permissions import IsTeamHead, IsTeamHeadOrAdmin
from tasks.models import Task
from tasks.serializers import TaskSerializer
from orders.models import Order

User = get_user_model()


class TeamHeadStatsView(APIView):
    """
    Get dashboard statistics for team head
    """
    permission_classes = [IsTeamHead]

    def get(self, request):
        user = request.user
        service = user.service

        if not service:
            return Response(
                {"error": "Team head must be assigned to a service"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all orders for this service
        orders = Order.objects.filter(service=service)
        
        # Get all tasks for these orders
        tasks = Task.objects.filter(order__service=service)

        # Calculate statistics
        active_projects = orders.filter(
            status__in=['pending', 'in_progress', 'revision']
        ).count()

        tasks_assigned = tasks.count()
        tasks_completed = tasks.filter(status='completed').count()
        
        # Pending approvals = tasks in review status
        pending_approvals = tasks.filter(status='review').count()

        # Team performance = percentage of completed tasks
        if tasks_assigned > 0:
            team_performance = round((tasks_completed / tasks_assigned) * 100, 1)
        else:
            team_performance = 100.0

        stats_data = {
            'active_projects': active_projects,
            'tasks_assigned': tasks_assigned,
            'tasks_completed': tasks_completed,
            'pending_approvals': pending_approvals,
            'team_performance': team_performance
        }

        serializer = TeamStatsSerializer(stats_data)
        return Response(serializer.data)


class TeamMembersListView(generics.ListCreateAPIView):
    """
    List and create team members for the service head's service
    """
    permission_classes = [IsTeamHead]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            from .serializers import TeamMemberCreateSerializer
            return TeamMemberCreateSerializer
        from .serializers import TeamMemberSerializer
        return TeamMemberSerializer

    def get_queryset(self):
        user = self.request.user
        service = user.service

        if not service:
            return User.objects.none()

        # Get team members assigned to tasks in this service
        # OR team members with the same service
        return User.objects.filter(
            Q(service=service) | Q(assigned_tasks__order__service=service)
        ).filter(
            role='team_member'
        ).distinct()

    def perform_create(self, serializer):
        # Assign the new team member to the same service
        serializer.save(service=self.request.user.service, role='team_member')



class TeamMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a specific team member
    """
    serializer_class = TeamMemberSerializer
    permission_classes = [IsTeamHead]

    def get_queryset(self):
        user = self.request.user
        service = user.service

        if not service:
            return User.objects.none()

        return User.objects.filter(
            Q(service=service) | Q(assigned_tasks__order__service=service)
        ).filter(
            role='team_member'
        ).distinct()
    
    def perform_update(self, serializer):
        """Ensure team member stays in the same service"""
        instance = self.get_object()
        # Prevent changing the service
        serializer.save(service=instance.service, role='team_member')
    
    def perform_destroy(self, instance):
        """Delete team member with validation"""
        # Check if user has permission
        if instance.service != self.request.user.service:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete team members from your service")
        
        # Perform the deletion
        instance.delete()



class TeamProjectsListView(generics.ListAPIView):
    """
    List all projects/orders for the team head's service
    """
    permission_classes = [IsTeamHead]

    def get(self, request):
        user = request.user
        service = user.service

        if not service:
            return Response(
                {"error": "Team head must be assigned to a service"},
                status=status.HTTP_400_BAD_REQUEST
            )

        orders = Order.objects.filter(service=service).select_related(
            'client', 'pricing_plan'
        )

        projects_data = []
        for order in orders:
            # Get tasks for this order
            tasks = order.tasks.all()
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='completed').count()
            
            # Calculate progress
            progress = 0
            if total_tasks > 0:
                progress = round((completed_tasks / total_tasks) * 100)

            # Determine status
            if order.status == 'completed':
                project_status = 'on-track'
            elif order.status == 'cancelled':
                project_status = 'delayed'
            elif order.due_date and order.due_date < timezone.now().date():
                project_status = 'delayed'
            elif progress < 50:
                project_status = 'at-risk'
            else:
                project_status = 'on-track'

            # Get team members assigned to this project
            members = User.objects.filter(
                assigned_tasks__order=order
            ).distinct().values_list('username', flat=True)[:3]

            projects_data.append({
                'id': order.id,
                'name': order.title,
                'progress': progress,
                'deadline': order.due_date.isoformat() if order.due_date else None,
                'members': list(members),
                'status': project_status,
                'client': order.client.username if order.client else 'Unknown'
            })

        return Response(projects_data)


class TeamTasksListView(generics.ListAPIView):
    """
    List all tasks for the team head's service with filtering
    """
    permission_classes = [IsTeamHead]

    def get(self, request):
        user = request.user
        service = user.service

        if not service:
            return Response(
                {"error": "Team head must be assigned to a service"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get all tasks for this service
            tasks = Task.objects.filter(order__service=service).select_related(
                'assignee', 'order'
            )

            # Apply filters
            status_filter = request.query_params.get('status')
            priority_filter = request.query_params.get('priority')
            assignee_filter = request.query_params.get('assignee')

            if status_filter:
                tasks = tasks.filter(status=status_filter)
            if priority_filter:
                tasks = tasks.filter(priority=priority_filter)
            if assignee_filter:
                tasks = tasks.filter(assignee_id=assignee_filter)

            # Format tasks data
            tasks_data = []
            for task in tasks:
                try:
                    # Safely get avatar URL
                    avatar_url = ''
                    if task.assignee and hasattr(task.assignee, 'avatar_url'):
                        avatar_url = task.assignee.avatar_url or ''
                    
                    tasks_data.append({
                        'id': task.id,
                        'title': task.title,
                        'description': task.description or '',
                        'status': task.status,
                        'priority': task.get_priority_display() if hasattr(task, 'get_priority_display') else str(task.priority),
                        'priority_value': task.priority,
                        'due_date': task.due_date.isoformat() if task.due_date else None,
                        'assignee': {
                            'id': task.assignee.id if task.assignee else None,
                            'name': task.assignee.username if task.assignee else 'Unassigned',
                            'avatar': avatar_url
                        },
                        'order': {
                            'id': task.order.id,
                            'title': task.order.title
                        }
                    })
                except Exception as e:
                    # Log the error but continue processing other tasks
                    print(f"Error processing task {task.id}: {str(e)}")
                    continue

            return Response(tasks_data)
        
        except Exception as e:
            # Return a more helpful error message
            return Response(
                {
                    "error": "Failed to load tasks",
                    "detail": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class TeamPerformanceView(APIView):
    """
    Get team performance analytics
    """
    permission_classes = [IsTeamHead]

    def get(self, request):
        user = request.user
        service = user.service

        if not service:
            return Response(
                {"error": "Team head must be assigned to a service"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get tasks for this service
        tasks = Task.objects.filter(order__service=service)
        total_tasks = tasks.count()

        if total_tasks == 0:
            # Return default values if no tasks
            performance_data = {
                'productivity': 87.0,
                'workload': 62.0,
                'engagement': 94.0,
                'weekly_trend': []
            }
        else:
            completed_tasks = tasks.filter(status='completed').count()
            productivity = round((completed_tasks / total_tasks) * 100, 1)

            # Calculate workload (average tasks per team member)
            team_members = User.objects.filter(
                assigned_tasks__order__service=service
            ).distinct().count()
            
            if team_members > 0:
                avg_tasks_per_member = total_tasks / team_members
                # Normalize to 0-100 scale (assuming 10 tasks = 100% workload)
                workload = min(round((avg_tasks_per_member / 10) * 100, 1), 100.0)
            else:
                workload = 0.0

            # Engagement = percentage of team members with recent activity
            active_members = User.objects.filter(
                assigned_tasks__order__service=service,
                last_login__gte=timezone.now() - timedelta(days=7)
            ).distinct().count()
            
            if team_members > 0:
                engagement = round((active_members / team_members) * 100, 1)
            else:
                engagement = 0.0

            # Weekly trend (last 7 days)
            weekly_trend = []
            for i in range(6, -1, -1):
                date = timezone.now().date() - timedelta(days=i)
                day_tasks = tasks.filter(created_at__date=date).count()
                day_completed = tasks.filter(
                    status='completed',
                    created_at__date=date
                ).count()
                
                weekly_trend.append({
                    'date': date.isoformat(),
                    'tasks': day_tasks,
                    'completed': day_completed
                })

            performance_data = {
                'productivity': productivity,
                'workload': workload,
                'engagement': engagement,
                'weekly_trend': weekly_trend
            }

        serializer = TeamPerformanceSerializer(performance_data)
        return Response(serializer.data)


class RecentActivityView(APIView):
    """
    Get recent activities for the team
    """
    permission_classes = [IsTeamHead]

    def get(self, request):
        user = request.user
        service = user.service

        if not service:
            return Response(
                {"error": "Team head must be assigned to a service"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get recent task updates (last 10)
        recent_tasks = Task.objects.filter(
            order__service=service
        ).select_related('assignee', 'order').order_by('-created_at')[:10]

        activities = []
        for task in recent_tasks:
            # Determine activity type based on task status
            if task.status == 'completed':
                activity_type = 'task'
                title = 'Task Completed'
                description = f"{task.assignee.username if task.assignee else 'Someone'} completed {task.title}"
            elif task.status == 'review':
                activity_type = 'approval'
                title = 'Approval Needed'
                description = f"{task.title} is pending review"
            else:
                activity_type = 'task'
                title = 'Task Updated'
                description = f"{task.title} status: {task.get_status_display()}"

            # Calculate time ago
            time_diff = timezone.now() - task.created_at
            if time_diff.days > 0:
                time_ago = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
            elif time_diff.seconds // 3600 > 0:
                hours = time_diff.seconds // 3600
                time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                minutes = time_diff.seconds // 60
                time_ago = f"{minutes} minute{'s' if minutes > 1 else ''} ago"

            activities.append({
                'id': task.id,
                'type': activity_type,
                'title': title,
                'description': description,
                'time': time_ago,
                'user': task.assignee.username if task.assignee else 'Unassigned'
            })

        return Response(activities)
# Add these imports at the top
from tasks.serializers import TaskSerializer


# Add these new view classes at the end of team_head_views.py

class TeamTaskCreateView(generics.CreateAPIView):
    """
    Create a new task for the team head's service
    """
    serializer_class = TaskSerializer
    permission_classes = [IsTeamHead]

    def perform_create(self, serializer):
        user = self.request.user
        service = user.service

        if not service:
            raise ValueError("Team head must be assigned to a service")

        # Get the order from request data
        order_id = self.request.data.get('order')
        if not order_id:
            raise ValueError("Order ID is required")

        # Verify the order belongs to this service
        try:
            order = Order.objects.get(id=order_id, service=service)
        except Order.DoesNotExist:
            raise ValueError("Order not found or doesn't belong to your service")

        serializer.save(order=order)


class TeamTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a specific task
    """
    serializer_class = TaskSerializer
    permission_classes = [IsTeamHead]

    def get_queryset(self):
        user = self.request.user
        service = user.service

        if not service:
            return Task.objects.none()

        # Only return tasks for orders in this service
        return Task.objects.filter(order__service=service).select_related('assignee', 'order')

    def perform_update(self, serializer):
        # Ensure the task still belongs to the service
        task = self.get_object()
        if task.order.service != self.request.user.service:
            raise ValueError("Cannot update task from another service")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Ensure the task belongs to the service
        if instance.order.service != self.request.user.service:
            raise ValueError("Cannot delete task from another service")
        
        instance.delete()


class DepartmentTeamMembersView(generics.ListAPIView):
    """
    List team members filtered by service head's department
    This is specifically for the Team Members page in the admin dashboard
    """
    serializer_class = UserSerializer
    permission_classes = [IsTeamHeadOrAdmin]

    def get_queryset(self):
        """
        Return team members from the service head's department
        """
        user = self.request.user
        
        print(f"👥 DepartmentTeamMembersView: User role: {user.role}")
        print(f"👥 DepartmentTeamMembersView: User email: {user.email}")
        
        # Admin sees all team members
        if user.role == 'admin':
            queryset = User.objects.filter(role='team_member').order_by('-date_joined')
            print(f"👥 DepartmentTeamMembersView: Admin - returning {queryset.count()} team members")
            return queryset
        
        # Service head sees only team members from their department
        if user.role == 'service_head':
            # Get department where this user is team_head (same logic as /api/user/department/)
            try:
                from services.models import Department
                department = Department.objects.get(team_head=user)
                print(f"👥 DepartmentTeamMembersView: Found department {department.title} (ID: {department.id})")
            except Department.DoesNotExist:
                print("👥 DepartmentTeamMembersView: Service head is not team_head of any department")
                return User.objects.none()
            except Department.MultipleObjectsReturned:
                department = Department.objects.filter(team_head=user).first()
                print(f"👥 DepartmentTeamMembersView: Multiple departments found, using first: {department.title}")
            
            # Filter team members by department
            queryset = User.objects.filter(
                role='team_member',
                department=department
            ).order_by('-date_joined')
            
            print(f"👥 DepartmentTeamMembersView: Found {queryset.count()} team members in department")
            
            # Debug: Show all team members in database
            all_team_members = User.objects.filter(role='team_member')
            print(f"👥 DepartmentTeamMembersView: Total team members in DB: {all_team_members.count()}")
            for tm in all_team_members:
                print(f"  - {tm.username} (email: {tm.email}, dept_id: {tm.department_id})")
            
            return queryset
        
        # Other roles cannot access this endpoint
        print(f"👥 DepartmentTeamMembersView: Role {user.role} not allowed")
        return User.objects.none()

