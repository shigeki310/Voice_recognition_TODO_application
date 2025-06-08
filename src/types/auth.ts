export interface User {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface ValidationError {
  field: string;
  message: string;
}