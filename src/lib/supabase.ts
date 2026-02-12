// Custom Client to talk to PHP API
const createClient = () => {
  // Correct API Endpoint for Production at grapepay.in
  // Use `VITE_API_URL` to allow flexible local/prod endpoints. Defaults to relative `/api` in production.
  const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');
  
  // Helper to build queries
  const createBuilder = (table: string) => {
    let query: any = {
      table,
      action: 'select',
      match: {},
      data: null,
      order: null,
      limit: null,
      single: false
    };

    const builder = {
      select: (columns = '*') => {
        query.action = 'select';
        return builder;
      },
      insert: (data: any) => {
        query.action = 'insert';
        query.data = data;
        return builder;
      },
      update: (data: any) => {
        query.action = 'update';
        query.data = data;
        return builder;
      },
      delete: () => {
        query.action = 'delete';
        return builder;
      },
      eq: (column: string, value: any) => {
        query.match[column] = value;
        return builder;
      },
      order: (column: string, { ascending = true } = {}) => {
        query.order = { column, ascending };
        return builder;
      },
      single: async () => {
        query.single = true;
        query.limit = 1;
        return execute();
      },
      maybeSingle: async () => {
        query.single = true;
        query.limit = 1;
        return execute();
      },
      select_exec: async () => { // internal exec for just .select() typically ending chain in Supabase
         return execute();
      }
    };

    // To handle "await supabase.from().select()" which acts as a promise
    // We add a 'then' method to the builder so it can be awaited directly
    (builder as any).then = (resolve: any, reject: any) => {
        execute().then(resolve).catch(reject);
    };

    async function execute() {
      try {
        // Correct API endpoint usage
        // Use `VITE_API_URL` to control endpoint. Local dev defaults to `http://localhost:3000`.
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(query)
        });

        if (!response.ok) {
           const text = await response.text();
           return { data: null, error: { message: `API Error: ${response.status} ${text}` } };
        }

        const json = await response.json();
        
        // Check if API returned a logical error (like DB connection failed)
        if (json.error) {
           return { data: null, error: { message: typeof json.error === 'string' ? json.error : JSON.stringify(json.error) } };
        }

        return json;
      } catch (err: any) {
        // Return error object instead of throwing to allow soft failover in UI
        return { data: null, error: { message: err.message || 'Network request failed' } };
      }
    }

    return builder;
  };

  return {
    from: (table: string) => createBuilder(table)
  };
};

export const supabase = createClient() as any;

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
  upi_id?: string;
  advance_payment?: number;
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
