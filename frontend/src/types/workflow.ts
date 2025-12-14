// frontend/src/types/workflow.ts

export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'estimation_sent'
  | 'in_progress'
  | '25_done'
  | '50_done'
  | '75_done'
  | 'ready_for_delivery'
  | 'delivered'
  | 'payment_pending'
  | 'payment_done'
  | 'closed';

export interface OrderStatusHistory {
  id: number;
  order: number;
  from_status?: OrderStatus;
  from_status_display?: string;
  to_status: OrderStatus;
  to_status_display: string;
  changed_by: number;
  changed_by_name: string;
  notes?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface WorkflowInfo {
  current_status: OrderStatus;
  current_status_display: string;
  allowed_next_statuses: Array<{
    value: OrderStatus;
    display: string;
  }>;
  progress_percentage: number;
  is_terminal: boolean;
  status_color: string;
}

export interface StatusUpdateData {
  new_status: OrderStatus;
  notes?: string;
}

export interface Deliverable {
  url: string;
  public_id: string;
  filename: string;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}
