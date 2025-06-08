/*
  # Add INSERT policy for user registration

  1. Security Changes
    - Add policy to allow anonymous users to insert new user records
    - This enables user registration functionality while maintaining security
    - Only allows INSERT operations, existing SELECT/UPDATE policies remain unchanged

  This policy allows anonymous users to create new accounts during registration,
  which is essential for the sign-up process to work properly.
*/

-- Add policy to allow user registration (INSERT for anonymous users)
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);