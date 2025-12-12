// frontend/src/api/teamHeadApi.ts
import api from './api';

// Types
export interface TeamStats {
    active_projects: number;
    tasks_assigned: number;
    tasks_completed: number;
    pending_approvals: number;
    team_performance: number;
}

export interface TeamMember {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    phone?: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
    join_date: string;
    last_active: string;
    completed_tasks: number;
    pending_tasks: number;
    projects: number;
    performance: number;
}

export interface Project {
    id: number;
    name: string;
    progress: number;
    deadline: string | null;
    members: string[];
    status: 'on-track' | 'at-risk' | 'delayed';
    client: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    priority_value: number;
    due_date: string | null;
    assignee: {
        id: number | null;
        name: string;
        avatar: string;
    };
    order: {
        id: number;
        title: string;
    };
}

export interface TeamPerformance {
    productivity: number;
    workload: number;
    engagement: number;
    weekly_trend: Array<{
        date: string;
        tasks: number;
        completed: number;
    }>;
}

export interface Activity {
    id: number;
    type: 'task' | 'project' | 'approval' | 'message';
    title: string;
    description: string;
    time: string;
    user: string;
}

// API Functions

/**
 * Get dashboard statistics for team head
 */
export const getTeamHeadStats = async (): Promise<TeamStats> => {
    const response = await api.get('/auth/team-head/stats/');
    return response.data;
};

/**
 * Get list of team members
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
    const response = await api.get('/auth/team-head/members/');
    return response.data;
};

/**
 * Get a single team member by ID
 */
export const getTeamMember = async (id: number): Promise<TeamMember> => {
    const response = await api.get(`/auth/team-head/members/${id}/`);
    return response.data;
};

/**
 * Update a team member
 */
export const updateTeamMember = async (
    id: number,
    data: Partial<TeamMember>
): Promise<TeamMember> => {
    const response = await api.patch(`/auth/team-head/members/${id}/`, data);
    return response.data;
};

/**
 * Add a new team member
 */
export const addTeamMember = async (
    data: Partial<TeamMember>
): Promise<TeamMember> => {
    const response = await api.post('/auth/team-head/members/', data);
    return response.data;
};

/**
 * Delete a team member
 */
export const deleteTeamMember = async (id: number): Promise<void> => {
    await api.delete(`/auth/team-head/members/${id}/`);
};

/**
 * Get list of projects/orders
 */
export const getTeamProjects = async (): Promise<Project[]> => {
    const response = await api.get('/auth/team-head/projects/');
    return response.data;
};

/**
 * Get list of tasks with optional filters
 */
export const getTeamTasks = async (filters?: {
    status?: string;
    priority?: number;
    assignee?: number;
}): Promise<Task[]> => {
    const response = await api.get('/auth/team-head/tasks/', { params: filters });
    return response.data;
};

/**
 * Get team performance analytics
 */
export const getTeamPerformance = async (): Promise<TeamPerformance> => {
    const response = await api.get('/auth/team-head/performance/');
    return response.data;
};

/**
 * Get recent activities
 */
export const getRecentActivity = async (): Promise<Activity[]> => {
    const response = await api.get('/auth/team-head/activity/');
    return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (data: {
    order: number;
    title: string;
    description?: string;
    status?: string;
    priority?: number;
    due_date?: string;
    assignee?: number;
}): Promise<Task> => {
    const response = await api.post('/auth/team-head/tasks/create/', data);
    return response.data;
};

/**
 * Update an existing task
 */
export const updateTask = async (
    id: number,
    data: Partial<{
        title: string;
        description: string;
        status: string;
        priority: number;
        due_date: string;
        assignee: number;
    }>
): Promise<Task> => {
    const response = await api.patch(`/auth/team-head/tasks/${id}/`, data);
    return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number): Promise<void> => {
    await api.delete(`/auth/team-head/tasks/${id}/`);
};
