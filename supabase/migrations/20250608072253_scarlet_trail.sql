/*
  # Add status column to todos table

  1. Changes
    - Add `status` column to `todos` table with type `text`
    - Set default value to 'not_started' to align with application logic
    - Add check constraint to ensure valid status values
    - Update existing records to have appropriate status based on completed field

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
*/

-- Add status column with default value
ALTER TABLE todos ADD COLUMN IF NOT EXISTS status text DEFAULT 'not_started';

-- Add check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'todos_status_check' 
    AND table_name = 'todos'
  ) THEN
    ALTER TABLE todos ADD CONSTRAINT todos_status_check 
    CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]));
  END IF;
END $$;

-- Update existing records: set status based on completed field
UPDATE todos 
SET status = CASE 
  WHEN completed = true THEN 'completed'
  ELSE 'not_started'
END
WHERE status = 'not_started';