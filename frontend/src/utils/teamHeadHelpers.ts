// frontend/src/utils/teamHeadHelpers.ts

import type { TeamStats, Project, Task, TeamMember, Activity } from '@/api/teamHeadApi';

/**
 * Transform team stats from API to display format
 */
export const transformStatsForDisplay = (stats: TeamStats) => {
    return [
        { id: 1, title: 'Active Projects', value: stats.active_projects, change: '+2.5%', isPercentage: false },
        { id: 2, title: 'Tasks Assigned', value: stats.tasks_assigned, change: '+15%', isPercentage: false },
        { id: 3, title: 'Tasks Completed', value: stats.tasks_completed, change: '+8.3%', isPercentage: false },
        { id: 4, title: 'Pending Approvals', value: stats.pending_approvals, change: '-2', isPercentage: false },
        { id: 5, title: 'Team Performance', value: Math.round(stats.team_performance), change: '+4.2%', isPercentage: true },
    ];
};

/**
 * Transform task from API to display format
 */
export const transformTaskForDisplay = (task: Task) => {
    return {
        id: task.id,
        title: task.title,
        dueDate: task.due_date || '',
        priority: task.priority.toLowerCase() as 'high' | 'medium' | 'low',
        status: task.status as 'todo' | 'in-progress' | 'completed',
        assignedTo: task.assignee.name,
    };
};

/**
 * Transform team member from API to display format
 */
export const transformTeamMemberForDisplay = (member: TeamMember) => {
    return {
        id: member.id,
        name: member.username,
        role: member.role,
        avatar: member.avatar || member.username.substring(0, 2).toUpperCase(),
        tasks: member.pending_tasks + member.completed_tasks,
        performance: member.performance,
        status: member.status,
    };
};

/**
 * Get initials from team member names for avatar
 */
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
