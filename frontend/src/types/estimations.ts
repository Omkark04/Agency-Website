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
  total_amount: string;
  estimated_timeline_days: number;
  valid_until?: string;
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
  is_expired: boolean;
}

export interface EstimationCreateData {
  order: number;
  title: string;
  description?: string;
  cost_breakdown: CostBreakdownItem[];
  tax_percentage: number;
  estimated_timeline_days: number;
  valid_until?: string;
  internal_notes?: string;
  client_notes?: string;
}
