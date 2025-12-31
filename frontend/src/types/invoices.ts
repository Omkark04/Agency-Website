// frontend/src/types/invoices.ts

export interface LineItem {
  item: string;
  description?: string;
  quantity?: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: number;
  uuid: string;
  order: number;
  order_title: string;
  estimation?: number;
  invoice_number: string;
  title: string;
  line_items: LineItem[];
  subtotal: string;
  tax_percentage: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  amount_paid: string;
  balance_due: string;
  invoice_date: string;
  due_date?: string;
  department_head_name?: string;
  department_head_email?: string;
  department_head_phone?: string;
  client_address?: string;
  client_phone?: string;
  chairperson_name?: string;
  vice_chairperson_name?: string;
  pdf_url?: string;
  pdf_public_id?: string;
  status: 'draft' | 'sent' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  created_by: number;
  created_by_name?: string;
  client_name?: string;
  notes?: string;
  terms_and_conditions?: string;
  referral_policies?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  paid_at?: string;
  is_overdue: boolean;
}

export interface InvoiceGenerateData {
  order_id: number;
  estimation_id?: number;
  title: string;
  line_items: LineItem[];
  tax_percentage: number;
  discount_amount: number;
  due_date?: string;
  department_head_name?: string;
  department_head_email?: string;
  department_head_phone?: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  client_phone?: string;
  chairperson_name?: string;
  vice_chairperson_name?: string;
  notes?: string;
  terms_and_conditions?: string;
  referral_policies?: string;
}
