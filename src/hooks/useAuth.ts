import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthState, RegisterFormData, LoginFormData } from '../types/auth';
import { sanitizeInput, checkUsernameAvailability } from '../utils/validation';

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
    // 初期認証状態の確認
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setAuthState({ user: null, loading: false, error: null });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      const user: User = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      setAuthState({ user, loading: false, error: null });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setAuthState({ user: null, loading: false, error: 'プロフィールの読み込みに失敗しました' });
    }
  };

  const register = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // 入力値のサニタイズ
      const sanitizedUsername = sanitizeInput(data.username);
      const sanitizedEmail = sanitizeInput(data.email);

      // ユーザー名の重複チェック
      const isUsernameAvailable = await checkUsernameAvailability(sanitizedUsername);
      if (!isUsernameAvailable) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'このユーザー名は既に使用されています' }));
        return { success: false, error: 'このユーザー名は既に使用されています' };
      }

      // Supabase Authでユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          data: {
            username: sanitizedUsername
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // プロフィールテーブルにユーザー情報を保存
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: sanitizedUsername,
            email: sanitizedEmail
          });

        if (profileError) throw profileError;

        return { success: true };
      }

      throw new Error('ユーザー登録に失敗しました');
    } catch (error: any) {
      const errorMessage = error.message || 'ユーザー登録に失敗しました';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const login = async (data: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(data.email),
        password: data.password
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'ログインに失敗しました';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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