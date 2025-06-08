/*
  # Remove unnecessary columns from todos table

  1. Changes
    - Remove `start_time` column from todos table
    - Remove `end_time` column from todos table  
    - Remove `status` column from todos table
    - Remove related indexes
    - Keep only essential todo functionality

  2. Security
    - No changes to RLS policies needed
*/

-- Remove indexes first
DROP INDEX IF EXISTS idx_todos_start_time;
DROP INDEX IF EXISTS idx_todos_end_time;

-- Remove columns from todos table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE todos DROP COLUMN start_time;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE todos DROP COLUMN end_time;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'status'
  ) THEN
    ALTER TABLE todos DROP COLUMN status;
  END IF;
END $$;