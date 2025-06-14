import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Check for placeholder values
if (supabaseUrl.includes('your-project-ref') || supabaseAnonKey.includes('your-anon-key')) {
  console.error('Placeholder Supabase credentials detected. Please update your .env file with actual values.');
  throw new Error('Please update your .env file with actual Supabase credentials from your project dashboard.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Expected format: https://your-project-ref.supabase.co');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          completed: boolean;
          priority: 'low' | 'medium' | 'high';
          due_date: string;
          due_time: string | null;
          reminder_enabled: boolean;
          reminder_time: number | null;
          repeat_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          priority?: 'low' | 'medium' | 'high';
          due_date: string;
          due_time?: string | null;
          reminder_enabled?: boolean;
          reminder_time?: number | null;
          repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string;
          due_time?: string | null;
          reminder_enabled?: boolean;
          reminder_time?: number | null;
          repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};