// In-browser sessionStorage-backed client to replace server DB calls.
// Stores all data in sessionStorage under key `am_invoice_db` so the app
// works without any backend. This mirrors the minimal API surface used
// by the app: `supabase.from(table).select().eq(...).insert(...).update(...).delete()`
const DB_KEY = 'am_invoice_db_v1';

type Row = Record<string, any> & { id?: string; created_at?: string; updated_at?: string };

function loadDB(): Record<string, Row[]> {
  try {
    const raw = sessionStorage.getItem(DB_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveDB(db: Record<string, Row[]>) {
  sessionStorage.setItem(DB_KEY, JSON.stringify(db));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const createClient = () => {
  const ensureTable = (table: string) => {
    const db = loadDB();
    if (!db[table]) db[table] = [];
    return db;
  };

  const createBuilder = (table: string) => {
    const q: any = { action: 'select', match: {}, data: null, order: null, limit: null, single: false };

    const builder: any = {
      select: (columns = '*') => { q.action = 'select'; q.columns = columns; return builder; },
      insert: (data: any) => { q.action = 'insert'; q.data = data; return builder; },
      update: (data: any) => { q.action = 'update'; q.data = data; return builder; },
      delete: () => { q.action = 'delete'; return builder; },
      eq: (column: string, value: any) => { q.match[column] = value; return builder; },
      order: (column: string, { ascending = true } = {}) => { q.order = { column, ascending }; return builder; },
      single: async () => { q.single = true; q.limit = 1; return execute(); },
      maybeSingle: async () => { q.single = true; q.limit = 1; return execute(); },
      select_exec: async () => { return execute(); }
    };

    // allow awaiting builder directly
    (builder as any).then = (resolve: any, reject: any) => { execute().then(resolve).catch(reject); };

    async function execute() {
      try {
        const db = ensureTable(table);
        const rows = db[table];

        if (q.action === 'select') {
          let results = rows.slice();
          // apply simple match filters
          for (const k in q.match) {
            results = results.filter(r => r && (r[k] === q.match[k]));
          }
          if (q.order) {
            results.sort((a, b) => {
              if (a[q.order.column] < b[q.order.column]) return q.order.ascending ? -1 : 1;
              if (a[q.order.column] > b[q.order.column]) return q.order.ascending ? 1 : -1;
              return 0;
            });
          }
          if (q.limit != null) results = results.slice(0, q.limit);
          return { data: q.single ? (results[0] ?? null) : results, error: null };
        }

        if (q.action === 'insert') {
          const now = new Date().toISOString();
          const toInsert = Array.isArray(q.data) ? q.data : [q.data];
          const inserted: Row[] = toInsert.map((item: any) => {
            const row: Row = { ...item };
            if (!row.id) row.id = genId();
            row.created_at = now;
            row.updated_at = now;
            return row;
          });
          db[table] = rows.concat(inserted);
          saveDB(db);
          return { data: q.single ? inserted[0] : inserted, error: null };
        }

        if (q.action === 'update') {
          const now = new Date().toISOString();
          let changed: Row[] = [];
          db[table] = rows.map(r => {
            let match = true;
            for (const k in q.match) { if (r[k] !== q.match[k]) { match = false; break; } }
            if (match) {
              const updated = { ...r, ...q.data, updated_at: now };
              changed.push(updated);
              return updated;
            }
            return r;
          });
          saveDB(db);
          return { data: q.single ? (changed[0] ?? null) : changed, error: null };
        }

        if (q.action === 'delete') {
          let removed: Row[] = [];
          const remaining: Row[] = [];
          for (const r of rows) {
            let match = true;
            for (const k in q.match) { if (r[k] !== q.match[k]) { match = false; break; } }
            if (match) removed.push(r); else remaining.push(r);
          }
          db[table] = remaining;
          saveDB(db);
          return { data: removed, error: null };
        }

        return { data: null, error: { message: 'Unknown action' } };
      } catch (err: any) {
        return { data: null, error: { message: err?.message || String(err) } };
      }
    }

    return builder;
  };

  return { from: (table: string) => createBuilder(table) };
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
