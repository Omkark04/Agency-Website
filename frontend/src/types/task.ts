// frontend/src/types/task.ts

export interface TaskAttachment {
  url: string;
  public_id: string;
  filename: string;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Task {
  id: number;
  order: number;
  order_title?: string;
  order_details?: any;
  title: string;
  description?: string;
  assignee?: number | null;
  assignee_name?: string;
  assignee_details?: any;
  status: 'pending' | 'in_progress' | 'done';
  status_label?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  priority_label?: string;
  due_date?: string;
  due_date_formatted?: string;
  attachments: TaskAttachment[];
  created_by?: number;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  can_edit?: boolean;
  can_view?: boolean;
}

export interface TaskCreateData {
  order: number;
  title: string;
  description?: string;
  assignee?: number;
  status?: 'pending' | 'in_progress' | 'done';
  priority?: 1 | 2 | 3 | 4 | 5;
  due_date?: string;
  attachments?: TaskAttachment[];
}
