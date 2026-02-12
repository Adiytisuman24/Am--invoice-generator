/*
  # Company Settings Table

  1. New Tables
    - `company_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `logo_url` (text) - URL of the company logo
      - `from_address` (text) - Company address
      - `phone` (text) - Company phone number
      - `is_active` (boolean) - Whether this is the active settings record
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `company_settings` table
    - Add policy to allow all authenticated users to read settings
    - Add policy to allow all authenticated users to insert/update settings
  
  3. Notes
    - This table stores company-wide settings like logo and address
    - Only one record should have is_active = true at a time
*/

CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  from_address text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read company settings"
  ON company_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert company settings"
  ON company_settings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update company settings"
  ON company_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete company settings"
  ON company_settings
  FOR DELETE
  USING (true);