// frontend/src/types/estimations.ts

export interface CostBreakdownItem {
  item: string;
  description?: string;
  quantity?: number;
  rate: number;
  amount: number;
}

export interface Estimation {
  id: number;
  uuid: string;
  order: number;
  order_title: string;
  title: string;
  description?: string;
  cost_breakdown: CostBreakdownItem[];
  subtotal: string;
  tax_percentage: string;
  tax_amount: string;
  discount_amount?: string;
  total_amount: string;
  estimated_timeline_days: number;
  delivery_date?: string;
  department_head_name?: string;
  department_head_email?: string;
  department_head_phone?: string;
  client_address?: string;
  client_phone?: string;
  pdf_url?: string;
  pdf_public_id?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  created_by: number;
  created_by_name?: string;
  client_name?: string;
  internal_notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  approved_at?: string;
  rejected_at?: string;
  valid_until?: string;
}

export interface EstimationCreateData {
  order: number;
  title: string;
  description?: string;
  cost_breakdown: CostBreakdownItem[];
  tax_percentage: number;
  discount_amount?: number;
  estimated_timeline_days: number;
  delivery_date?: string;
  department_head_name?: string;
  department_head_email?: string;
  department_head_phone?: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  client_phone?: string;
  internal_notes?: string;
  client_notes?: string;
}
