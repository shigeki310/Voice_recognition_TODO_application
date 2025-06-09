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
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
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

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user) {
        return { success: false, error: 'ユーザーがログインしていません' };
      }

      // 現在のパスワードを検証
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', authState.user.id)
        .single();

      if (fetchError || !userData) {
        return { success: false, error: 'ユーザー情報の取得に失敗しました' };
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.password_hash);
      if (!isCurrentPasswordValid) {
        return { success: false, error: '現在のパスワードが正しくありません' };
      }

      // 新しいパスワードをハッシュ化
      const newPasswordHash = await hashPassword(newPassword);

      // パスワードを更新
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (updateError) {
        console.error('Password update error:', updateError);
        return { success: false, error: 'パスワードの更新に失敗しました' };
      }

      // ローカルストレージのユーザー情報を更新
      const updatedUser = {
        ...authState.user,
        updated_at: new Date().toISOString()
      };
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem('voice_todo_user', JSON.stringify(updatedUser));

      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'パスワードの変更に失敗しました' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user) {
        return { success: false, error: 'ユーザーがログインしていません' };
      }

      // ユーザーに関連するTODOを削除（CASCADE設定により自動削除されるが、明示的に実行）
      const { error: todosDeleteError } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', authState.user.id);

      if (todosDeleteError) {
        console.error('Todos delete error:', todosDeleteError);
        return { success: false, error: 'データの削除に失敗しました' };
      }

      // ユーザーアカウントを削除
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', authState.user.id);

      if (userDeleteError) {
        console.error('User delete error:', userDeleteError);
        return { success: false, error: 'アカウントの削除に失敗しました' };
      }

      // ローカル状態をクリア
      setAuthState({ user: null, loading: false, error: null });
      localStorage.removeItem('voice_todo_user');

      return { success: true };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message || 'アカウントの削除に失敗しました' };
    }
  };

  return {
    authState,
    register,
    login,
    logout,
    checkUsername,
    changePassword,
    deleteAccount
  };
};

export { AuthContext };