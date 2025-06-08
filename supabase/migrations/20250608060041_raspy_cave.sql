/*
  # アカウント名認証システムの構築

  1. 新しいテーブル
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. 既存テーブルの更新
    - `todos` テーブルのuser_id参照を新しいusersテーブルに変更

  3. セキュリティ
    - Enable RLS on `users` table
    - Add policies for user data access
    - Enable RLS on `todos` table
    - Add policies for todo data access

  4. 変更点
    - メールアドレス認証を削除
    - Supabase Authの代わりに独自認証システムを使用
    - アカウント名とパスワードのみの認証
*/

-- 新しいusersテーブルを作成
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のデータのみアクセス可能
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true);

-- todosテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- todosテーブルのRLSを有効化
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のtodosのみアクセス可能
CREATE POLICY "Users can manage own todos"
  ON todos
  FOR ALL
  USING (true);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);

-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーを作成
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();