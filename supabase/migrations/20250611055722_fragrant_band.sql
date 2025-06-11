/*
  # Add reminder and time fields to todos table

  1. New Fields
    - `due_time` (text) - Time in HH:mm format for specific time scheduling
    - `reminder_enabled` (boolean) - Whether reminder is enabled for this todo
    - `reminder_time` (integer) - Minutes before due time to send reminder
    - `repeat_type` (text) - Type of repetition (none, daily, weekly, monthly, yearly)

  2. Updates
    - Add new columns to existing todos table
    - Set default values for existing records
    - Add check constraints for data validation

  3. Notes
    - All new fields are optional to maintain compatibility
    - Existing todos will have default values
*/

-- Add new columns for time and reminder functionality
DO $$
BEGIN
  -- Add due_time column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'due_time'
  ) THEN
    ALTER TABLE todos ADD COLUMN due_time text;
  END IF;

  -- Add reminder_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'reminder_enabled'
  ) THEN
    ALTER TABLE todos ADD COLUMN reminder_enabled boolean DEFAULT false;
  END IF;

  -- Add reminder_time column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'reminder_time'
  ) THEN
    ALTER TABLE todos ADD COLUMN reminder_time integer;
  END IF;

  -- Add repeat_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'repeat_type'
  ) THEN
    ALTER TABLE todos ADD COLUMN repeat_type text DEFAULT 'none';
  END IF;
END $$;

-- Add check constraints for data validation
DO $$
BEGIN
  -- Check constraint for due_time format (HH:mm)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'todos_due_time_format_check'
  ) THEN
    ALTER TABLE todos ADD CONSTRAINT todos_due_time_format_check 
    CHECK (due_time IS NULL OR due_time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');
  END IF;

  -- Check constraint for reminder_time (positive integer)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'todos_reminder_time_check'
  ) THEN
    ALTER TABLE todos ADD CONSTRAINT todos_reminder_time_check 
    CHECK (reminder_time IS NULL OR reminder_time > 0);
  END IF;

  -- Check constraint for repeat_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'todos_repeat_type_check'
  ) THEN
    ALTER TABLE todos ADD CONSTRAINT todos_repeat_type_check 
    CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_reminder_enabled ON todos(reminder_enabled) WHERE reminder_enabled = true;
CREATE INDEX IF NOT EXISTS idx_todos_repeat_type ON todos(repeat_type) WHERE repeat_type != 'none';
CREATE INDEX IF NOT EXISTS idx_todos_due_time ON todos(due_time) WHERE due_time IS NOT NULL;