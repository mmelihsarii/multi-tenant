-- Add is_active column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Update existing records to have active status
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL;
