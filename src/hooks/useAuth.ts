import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthState, RegisterFormData, LoginFormData } from '../types/auth';
import { sanitizeInput, checkUsernameAvailability, hashPassword, verifyPassword } from '../utils/validation';

const AuthContext = createContext<{
  authState: AuthState;
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>;
  login: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // ローカルストレージから認証状態を復元
    const loadAuthState = () => {
      const storedUser = localStorage.getItem('voice_todo_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setAuthState({ user, loading: false, error: null });
        } catch (error) {
          localStorage.removeItem('voice_todo_user');
          setAuthState({ user: null, loading: false, error: null });
        }
      } else {
        setAuthState({ user: null, loading: false, error: null });
      }
    };

    loadAuthState();
  }, []);

  const register = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // 入力値のサニタイズ
      const sanitizedUsername = sanitizeInput(data.username);

      // ユーザー名の重複チェック
      const isUsernameAvailable = await checkUsernameAvailability(sanitizedUsername);
      if (!isUsernameAvailable) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'このユーザー名は既に使用されています' }));
        return { success: false, error: 'このユーザー名は既に使用されています' };
      }

      // パスワードのハッシュ化
      const passwordHash = await hashPassword(data.password);

      // ユーザー登録
      const { data: userData, error } = await supabase
        .from('users')
        .insert({
          username: sanitizedUsername,
          password_hash: passwordHash
        })
        .select()
        .single();

      if (error) throw error;

      const user: User = {
        id: userData.id,
        username: userData.username,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      setAuthState({ user, loading: false, error: null });
      localStorage.setItem('voice_todo_user', JSON.stringify(user));

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'ユーザー登録に失敗しました';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const login = async (data: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const sanitizedUsername = sanitizeInput(data.username);

      // ユーザー情報を取得
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', sanitizedUsername)
        .single();

      if (error || !userData) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'ユーザー名またはパスワードが正しくありません' }));
        return { success: false, error: 'ユーザー名またはパスワードが正しくありません' };
      }

      // パスワード検証
      const isPasswordValid = await verifyPassword(data.password, userData.password_hash);
      if (!isPasswordValid) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'ユーザー名またはパスワードが正しくありません' }));
        return { success: false, error: 'ユーザー名またはパスワードが正しくありません' };
      }

      const user: User = {
        id: userData.id,
        username: userData.username,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      setAuthState({ user, loading: false, error: null });
      localStorage.setItem('voice_todo_user', JSON.stringify(user));

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'ログインに失敗しました';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setAuthState({ user: null, loading: false, error: null });
      localStorage.removeItem('voice_todo_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkUsername = async (username: string): Promise<boolean> => {
    return await checkUsernameAvailability(sanitizeInput(username));
  };

  return {
    authState,
    register,
    login,
    logout,
    checkUsername
  };
};

export { AuthContext };