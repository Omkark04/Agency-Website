// frontend/src/api/teamMemberApi.ts
import api from './api';

export interface TeamMemberStats {
  total_tasks: number;
  tasks_completed: number;
  tasks_in_progress: number;
  tasks_pending: number;
  productivity: number;
  streak: number;
}

export interface TeamMemberTask {
  id: number;
  title: string;
  description: string;
  priority: string;
  priority_value: number;
  status: string;
  status_value: string;
  deadline: string | null;
  assignedDate: string | null;
  assignedBy: string;
  category: string;
  progress: number;
  timeEstimate: string;
  tags: string[];
  order: {
    id: number;
    title: string;
    status: string;
    client: string;
  };
  attachments: any[];
}

/**
 * Get dashboard statistics for the logged-in team member
 */
export const getTeamMemberStats = () => {
  return api.get<TeamMemberStats>('/api/auth/team-member/stats/');
};

/**
 * Get all tasks assigned to the logged-in team member
 * @param status - Optional status filter ('pending', 'in_progress', 'done')
 */
export const getMyTasks = (status?: string) => {
  const params = status ? { status } : {};
  return api.get<TeamMemberTask[]>('/api/auth/team-member/tasks/', { params });
};

/**
 * Get a specific task by ID
 * @param taskId - The task ID
 */
export const getMyTask = (taskId: number) => {
  return api.get<TeamMemberTask>(`/api/auth/team-member/tasks/${taskId}/`);
};

/**
 * Update task status or other fields
 * @param taskId - The task ID
 * @param data - Partial task data to update
 */
export const updateMyTask = (taskId: number, data: Partial<{
  status: string;
  description: string;
  attachments: any[];
}>) => {
  return api.patch<TeamMemberTask>(`/api/auth/team-member/tasks/${taskId}/`, data);
};

/**
 * Update task status specifically
 * @param taskId - The task ID
 * @param status - New status ('pending', 'in_progress', 'done' or 'To Do', 'In Progress', 'Completed')
 */
export const updateTaskStatus = (taskId: number, status: string) => {
  return updateMyTask(taskId, { status });
};

/**
 * Mark task as complete
 * @param taskId - The task ID
 */
export const markTaskComplete = (taskId: number) => {
  return updateTaskStatus(taskId, 'done');
};

/**
 * Start working on a task (set to in progress)
 * @param taskId - The task ID
 */
export const startTask = (taskId: number) => {
  return updateTaskStatus(taskId, 'in_progress');
};
