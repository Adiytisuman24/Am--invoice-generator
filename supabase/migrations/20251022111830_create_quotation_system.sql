/*
  # Create Quotation Builder System

  ## Overview
  This migration creates a complete quotation management system with support for:
  - Multi-page quotations with line items
  - Business information (from/to)
  - Country/state-based address formatting
  - GST calculations (CGST, SGST)
  - File attachments (logo, signature, documents)
  - Terms and conditions
  - Payment details with QR codes and bank information
  - Enhanced item tracking with HSN/SAC codes
  - Discounts and additional charges
  
  ## New Tables
  
  ### `quotations`
  Main quotation table storing header information and metadata
  - `id` (uuid, primary key) - Unique quotation identifier
  - `quotation_no` (text) - User-editable quotation number
  - `quotation_date` (date) - Date of quotation creation
  - `due_date` (date, optional) - Payment/response due date
  - `currency` (text) - Currency code (default: INR)
  - `logo_url` (text, optional) - Business logo image URL
  - `signature_url` (text, optional) - Signature image URL
  - `notes` (text, optional) - Additional notes
  - `attachments` (jsonb) - Array of attachment file references
  - `contact_details` (text, optional) - Additional contact information
  - `round_off` (text) - Round up/down preference
  - `discount_type` (text) - Discount type: none, percentage, fixed
  - `discount_value` (numeric) - Discount value
  - `additional_charges` (numeric) - Additional charges amount
  - `additional_charges_label` (text) - Label for additional charges
  - `status` (text) - Draft, sent, accepted, rejected
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `business_info`
  Stores "from" and "to" business information
  - `id` (uuid, primary key)
  - `quotation_id` (uuid, foreign key) - Links to quotations table
  - `info_type` (text) - Either 'from' or 'to'
  - `business_name` (text)
  - `gstin` (text, optional) - GST identification number
  - `pan` (text, optional) - PAN number
  - `email` (text)
  - `country` (text)
  - `state` (text)
  - `city` (text)
  - `address` (text)
  - `zip_code` (text)
  
  ### `quotation_items`
  Line items in a quotation
  - `id` (uuid, primary key)
  - `quotation_id` (uuid, foreign key)
  - `item_name` (text)
  - `description` (text, optional)
  - `image_url` (text, optional)
  - `hsn_sac` (text, optional) - HSN/SAC code
  - `gst_rate` (numeric) - GST percentage
  - `quantity` (numeric)
  - `rate` (numeric) - Unit price
  - `discount` (numeric) - Discount amount/percentage
  - `sort_order` (integer) - For drag-drop reordering
  
  ### `payment_details`
  Payment information including bank details and QR codes
  - `id` (uuid, primary key)
  - `quotation_id` (uuid, foreign key)
  - `qr_code_url` (text, optional) - QR code for payment
  - `bank_name` (text, optional)
  - `account_number` (text, optional)
  - `ifsc_code` (text, optional)
  - `branch` (text, optional)
  - `account_type` (text, optional)
  
  ### `terms_conditions`
  Terms and conditions templates
  - `id` (uuid, primary key)
  - `quotation_id` (uuid, foreign key, optional) - Null for global templates
  - `content` (text) - Rich text content
  - `attachment_url` (text, optional) - Legal document attachment
  - `is_default` (boolean) - Default template flag
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Public access for demo purposes (can be restricted per user later)
  - Policies allow authenticated and anonymous users to manage quotations
  
  ## Indexes
  - quotation_no for quick lookups
  - quotation_id foreign keys for join performance
  - sort_order for items ordering
*/

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_no text NOT NULL,
  quotation_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  currency text NOT NULL DEFAULT 'INR',
  logo_url text,
  signature_url text,
  notes text,
  attachments jsonb DEFAULT '[]'::jsonb,
  contact_details text,
  round_off text DEFAULT 'none',
  discount_type text DEFAULT 'none',
  discount_value numeric DEFAULT 0,
  additional_charges numeric DEFAULT 0,
  additional_charges_label text DEFAULT 'Additional Charges',
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
  image_url text,
  hsn_sac text,
  gst_rate numeric DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 1,
  rate numeric NOT NULL DEFAULT 0,
  discount numeric DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);

-- Create payment_details table
CREATE TABLE IF NOT EXISTS payment_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  qr_code_url text,
  bank_name text,
  account_number text,
  ifsc_code text,
  branch text,
  account_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create terms_conditions table
CREATE TABLE IF NOT EXISTS terms_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachment_url text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotations_no ON quotations(quotation_no);
CREATE INDEX IF NOT EXISTS idx_business_info_quotation ON business_info(quotation_id);
CREATE INDEX IF NOT EXISTS idx_items_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_items_sort ON quotation_items(quotation_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_payment_details_quotation ON payment_details(quotation_id);
CREATE INDEX IF NOT EXISTS idx_terms_quotation ON terms_conditions(quotation_id);

-- Enable Row Level Security
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_conditions ENABLE ROW LEVEL SECURITY;

-- Create policies for quotations (public access for demo)
CREATE POLICY "Allow public read access to quotations"
  ON quotations FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to quotations"
  ON quotations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to quotations"
  ON quotations FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to quotations"
  ON quotations FOR DELETE
  USING (true);

-- Create policies for business_info
CREATE POLICY "Allow public read access to business_info"
  ON business_info FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to business_info"
  ON business_info FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to business_info"
  ON business_info FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to business_info"
  ON business_info FOR DELETE
  USING (true);

-- Create policies for quotation_items
CREATE POLICY "Allow public read access to quotation_items"
  ON quotation_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to quotation_items"
  ON quotation_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to quotation_items"
  ON quotation_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to quotation_items"
  ON quotation_items FOR DELETE
  USING (true);

-- Create policies for payment_details
CREATE POLICY "Allow public read access to payment_details"
  ON payment_details FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to payment_details"
  ON payment_details FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to payment_details"
  ON payment_details FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to payment_details"
  ON payment_details FOR DELETE
  USING (true);

-- Create policies for terms_conditions
CREATE POLICY "Allow public read access to terms_conditions"
  ON terms_conditions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to terms_conditions"
  ON terms_conditions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to terms_conditions"
  ON terms_conditions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to terms_conditions"
  ON terms_conditions FOR DELETE
  USING (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_details_updated_at
  BEFORE UPDATE ON payment_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terms_updated_at
  BEFORE UPDATE ON terms_conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
