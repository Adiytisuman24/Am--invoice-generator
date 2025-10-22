import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Supabase initialization failed:', error);
  }
}

export const supabase = supabaseClient || {
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null })
      }),
      single: async () => ({ data: null, error: null })
    }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({
      eq: async () => ({ data: null, error: null })
    }),
    delete: () => ({
      eq: async () => ({ data: null, error: null })
    })
  })
} as any;

export type BankDetailsType = {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch?: string;
  account_type?: string;
};

export type QuotationType = {
  id: string;
  quotation_no: string;
  quotation_date: string;
  due_date?: string;
  currency: string;
  logo_url?: string;
  signature_url?: string;
  notes?: string;
  attachments?: any[];
  contact_details?: string;
  round_off: string;
  status: string;
  qr_code_url?: string;
  bank_details?: BankDetailsType[];
  created_at: string;
  updated_at: string;
};

export type BusinessInfoType = {
  id?: string;
  quotation_id: string;
  info_type: 'from' | 'to';
  business_name: string;
  gstin?: string;
  pan?: string;
  email: string;
  phone?: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip_code: string;
};

export type QuotationItemType = {
  id?: string;
  quotation_id?: string;
  item_name: string;
  description?: string;
  image_url?: string;
  hsn_sac?: string;
  gst_rate: number;
  quantity: number;
  rate: number;
  discount: number;
  additional_charges: number;
  sort_order: number;
};

export type TermsConditionsType = {
  id?: string;
  quotation_id?: string;
  content: string;
  attachment_url?: string;
  is_default: boolean;
};
