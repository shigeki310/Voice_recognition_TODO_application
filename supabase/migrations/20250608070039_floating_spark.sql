/*
  # Add time tracking columns to todos table

  1. Changes
    - Add `start_time` column to `todos` table (nullable timestamp with time zone)
    - Add `end_time` column to `todos` table (nullable timestamp with time zone)
    - Add indexes for better query performance on time-based queries

  2. Security
    - No changes to RLS policies needed as existing policies cover all columns
*/

-- Add start_time and end_time columns to todos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE todos ADD COLUMN start_time timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE todos ADD COLUMN end_time timestamptz;
  END IF;
END $$;

-- Add indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_todos_start_time ON todos(start_time);
CREATE INDEX IF NOT EXISTS idx_todos_end_time ON todos(end_time);