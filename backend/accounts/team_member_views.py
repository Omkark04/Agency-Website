# accounts/team_member_views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta

from tasks.models import Task
from tasks.serializers import TaskSerializer
from .permissions import IsTeamMember

User = get_user_model()


class TeamMemberStatsView(APIView):
    """
    Get dashboard statistics for team member
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Ensure user is a team member
        if user.role != 'team_member':
            return Response(
                {"error": "Only team members can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all tasks assigned to this team member
        tasks = Task.objects.filter(assignee=user)
        
        total_tasks = tasks.count()
        tasks_completed = tasks.filter(status='done').count()
        tasks_in_progress = tasks.filter(status='in_progress').count()
        tasks_pending = tasks.filter(status='pending').count()
        
        # Calculate productivity percentage
        if total_tasks > 0:
            productivity = round((tasks_completed / total_tasks) * 100, 1)
        else:
            productivity = 0.0
        
        # Calculate streak (days with completed tasks in last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        completed_dates = tasks.filter(
            status='done',
            completed_at__gte=thirty_days_ago
        ).values_list('completed_at__date', flat=True).distinct()
        streak = len(completed_dates)
        
        stats_data = {
            'total_tasks': total_tasks,
            'tasks_completed': tasks_completed,
            'tasks_in_progress': tasks_in_progress,
            'tasks_pending': tasks_pending,
            'productivity': productivity,
            'streak': streak
        }
        
        return Response(stats_data)


class TeamMemberTasksListView(generics.ListAPIView):
    """
    List all tasks assigned to the logged-in team member
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Ensure user is a team member
        if user.role != 'team_member':
            return Task.objects.none()
        
        # Get tasks assigned to this team member
        queryset = Task.objects.filter(assignee=user).select_related(
            'order', 'order__client', 'created_by'
        ).order_by('-priority', 'due_date')
        
        # Apply status filter if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Transform data to match frontend expectations
        tasks_data = []
        for task_data in serializer.data:
            # Map backend status to frontend status
            status_mapping = {
                'pending': 'To Do',
                'in_progress': 'In Progress',
                'done': 'Completed'
            }
            
            # Map priority to display format
            priority_mapping = {
                1: 'Low',
                2: 'Medium',
                3: 'High',
                4: 'Urgent'
            }
            
            transformed_task = {
                'id': task_data['id'],
                'title': task_data['title'],
                'description': task_data['description'] or '',
                'priority': priority_mapping.get(task_data['priority'], 'Medium'),
                'priority_value': task_data['priority'],
                'status': status_mapping.get(task_data['status'], 'To Do'),
                'status_value': task_data['status'],
                'deadline': task_data['due_date'],
                'assignedDate': task_data['created_at'][:10] if task_data['created_at'] else None,
                'assignedBy': task_data.get('created_by_name', 'Unknown'),
                'category': task_data.get('order_details', {}).get('title', 'General'),
                'progress': 100 if task_data['status'] == 'done' else (50 if task_data['status'] == 'in_progress' else 0),
                'timeEstimate': '8h',  # Default estimate, can be enhanced later
                'tags': [],  # Can be enhanced with actual tags
                'order': task_data.get('order_details', {}),
                'attachments': task_data.get('attachments', [])
            }
            
            tasks_data.append(transformed_task)
        
        return Response(tasks_data)


class TeamMemberTaskUpdateView(generics.RetrieveUpdateAPIView):
    """
    Get or update a specific task assigned to the team member
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Ensure user is a team member
        if user.role != 'team_member':
            return Task.objects.none()
        
        # Only return tasks assigned to this team member
        return Task.objects.filter(assignee=user).select_related('order', 'order__client')
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Map frontend status to backend status if needed
        if 'status' in request.data:
            status_mapping = {
                'To Do': 'pending',
                'In Progress': 'in_progress',
                'Completed': 'done',
                'pending': 'pending',
                'in_progress': 'in_progress',
                'done': 'done'
            }
            request.data['status'] = status_mapping.get(request.data['status'], request.data['status'])
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        # Auto-set completed_at when marking as done
        if serializer.validated_data.get('status') == 'done':
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()
