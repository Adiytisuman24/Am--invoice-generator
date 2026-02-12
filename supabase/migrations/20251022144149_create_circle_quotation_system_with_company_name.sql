/*
  # Create Circle Quotation Generator System

  ## Overview
  Complete quotation system optimized for A4 single-page PDF output with UPI payment integration

  ## New Tables

  ### `quotations`
  Main quotation table with UPI payment integration
  - `id` (uuid, primary key) - Unique quotation identifier
  - `quotation_no` (text, unique) - System-generated immutable quotation number
  - `quotation_date` (date) - Date of quotation creation
  - `due_date` (date, optional) - Payment due date
  - `currency` (text) - Currency code (default: INR)
  - `upi_id` (text) - Business UPI address for payments
  - `qr_code_url` (text) - Generated QR code URL
  - `bank_details` (jsonb) - Array of bank account objects for fallback
  - `logo_url` (text, optional) - Business logo
  - `signature_url` (text, optional) - Signature image
  - `notes` (text, optional) - Additional notes
  - `contact_details` (text, optional) - Contact information
  - `round_off` (text) - Rounding preference: none, up, down
  - `status` (text) - draft, sent, accepted, rejected
  - `created_at`, `updated_at` (timestamptz)

  ### `business_info`
  From/To business information
  - `id` (uuid, primary key)
  - `quotation_id` (uuid, foreign key)
  - `info_type` (text) - 'from' or 'to'
  - `business_name`, `gstin`, `pan`, `email`
  - `country`, `state`, `city`, `address`, `zip_code`

  ### `quotation_items`
  Line items with GST calculation
  - `id` (uuid, primary key)
  - `quotation_id` (uuid, foreign key)
  - `item_name`, `description`, `hsn_sac`
  - `gst_rate` (numeric) - GST percentage
  - `quantity`, `rate`, `discount`
  - `additional_charges` (numeric) - Item-specific charges
  - `sort_order` (integer)

  ### `terms_conditions`
  Terms and conditions content
  - `id` (uuid, primary key)
  - `quotation_id` (uuid, foreign key, optional)
  - `content` (text)
  - `is_default` (boolean)

  ### `company_settings`
  Company-wide settings
  - `id` (uuid, primary key)
  - `company_name` (text) - Company name to display in header
  - `logo_url`, `from_address`, `phone`, `website_url`
  - `is_active` (boolean)

  ## Security
  - RLS enabled on all tables
  - Public access policies for demo (can be restricted later)

  ## Important Notes
  1. UPI URL Format: upi://pay?pa={upi_id}&pn={business_name}&tr={quotation_no}&am={amount}&cu=INR
  2. QR codes generated client-side and server-side for PDF
  3. Single-page A4 layout enforced through CSS
  4. Bank details as JSONB array: [{bank_name, account_number, ifsc_code, branch, account_type}]
*/

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_no text NOT NULL UNIQUE,
  quotation_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  currency text NOT NULL DEFAULT 'INR',
  upi_id text,
  qr_code_url text,
  bank_details jsonb DEFAULT '[]'::jsonb,
  logo_url text,
  signature_url text,
  notes text,
  contact_details text,
  round_off text DEFAULT 'none',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_info table
CREATE TABLE IF NOT EXISTS business_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  info_type text NOT NULL CHECK (info_type IN ('from', 'to')),
  business_name text NOT NULL,
  gstin text,
  pan text,
  email text NOT NULL,
  country text NOT NULL,
  state text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  zip_code text NOT NULL
);

-- Create quotation_items table
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  description text,
  hsn_sac text,
  gst_rate numeric DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 1,
  rate numeric NOT NULL DEFAULT 0,
  discount numeric DEFAULT 0,
  additional_charges numeric DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);

-- Create terms_conditions table
CREATE TABLE IF NOT EXISTS terms_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  logo_url text,
  from_address text,
  phone text,
  website_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotations_no ON quotations(quotation_no);
CREATE INDEX IF NOT EXISTS idx_business_info_quotation ON business_info(quotation_id);
CREATE INDEX IF NOT EXISTS idx_items_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_items_sort ON quotation_items(quotation_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_terms_quotation ON terms_conditions(quotation_id);

-- Enable Row Level Security
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Policies for quotations
CREATE POLICY "Public read quotations"
  ON quotations FOR SELECT
  USING (true);

CREATE POLICY "Public insert quotations"
  ON quotations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update quotations"
  ON quotations FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete quotations"
  ON quotations FOR DELETE
  USING (true);

-- Policies for business_info
CREATE POLICY "Public read business_info"
  ON business_info FOR SELECT
  USING (true);

CREATE POLICY "Public insert business_info"
  ON business_info FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update business_info"
  ON business_info FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete business_info"
  ON business_info FOR DELETE
  USING (true);

-- Policies for quotation_items
CREATE POLICY "Public read quotation_items"
  ON quotation_items FOR SELECT
  USING (true);

CREATE POLICY "Public insert quotation_items"
  ON quotation_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update quotation_items"
  ON quotation_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete quotation_items"
  ON quotation_items FOR DELETE
  USING (true);

-- Policies for terms_conditions
CREATE POLICY "Public read terms_conditions"
  ON terms_conditions FOR SELECT
  USING (true);

CREATE POLICY "Public insert terms_conditions"
  ON terms_conditions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update terms_conditions"
  ON terms_conditions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete terms_conditions"
  ON terms_conditions FOR DELETE
  USING (true);

-- Policies for company_settings
CREATE POLICY "Public read company_settings"
  ON company_settings FOR SELECT
  USING (true);

CREATE POLICY "Public insert company_settings"
  ON company_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update company_settings"
  ON company_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete company_settings"
  ON company_settings FOR DELETE
  USING (true);
