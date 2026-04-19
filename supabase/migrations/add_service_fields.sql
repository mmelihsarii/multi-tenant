-- Add category and is_active columns to services table if they don't exist
DO $$ 
BEGIN
  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'category'
  ) THEN
    ALTER TABLE services 
    ADD COLUMN category TEXT DEFAULT 'Genel';
  END IF;

  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE services 
    ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Update existing records to have default values
UPDATE services 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE services 
SET category = 'Genel' 
WHERE category IS NULL OR category = '';
