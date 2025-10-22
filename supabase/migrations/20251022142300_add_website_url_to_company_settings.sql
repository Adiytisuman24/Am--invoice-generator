/*
  # Add Website URL to Company Settings

  ## Changes
  - Add `website_url` column to `company_settings` table
  - This will appear as a clickable link in the footer of quotations

  ## Notes
  - Uses IF NOT EXISTS pattern to prevent errors on rerun
  - Column is optional (nullable)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN website_url text;
  END IF;
END $$;
