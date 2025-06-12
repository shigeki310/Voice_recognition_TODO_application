import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthState, RegisterFormData, LoginFormData, PasswordResetFormData } from '../types/auth';
import { sanitizeInput, checkUsernameAvailability, hashPassword, verifyPassword } from '../utils/validation';

const AuthContext = createContext<{
  authState: AuthState;
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>;
  login: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  verifyUserForReset: (username: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (data: PasswordResetFormData) => Promise<{ success: boolean; error?: string }>;
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

  // 認証状態の初期化（一度だけ実行）
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = () => {
      console.log('認証状態を初期化中...');
      
      try {
        const storedUser = localStorage.getItem('voice_todo_user');
        if (storedUser && isMounted) {
          const user = JSON.parse(storedUser);
          console.log('ローカルストレージからユーザー情報を復元:', user.username);
          setAuthState({ user, loading: false, error: null });
        } else if (isMounted) {
          console.log('ローカルストレージにユーザー情報がありません');
          setAuthState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        console.error('ユーザー情報の復元に失敗:', error);
        localStorage.removeItem('voice_todo_user');
        if (isMounted) {
          setAuthState({ user: null, loading: false, error: null });
        }
      }
    };

    // 初期化を即座に実行
    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // 空の依存配列で一度だけ実行

  const register = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('ユーザー登録を開始:', data.username);
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const sanitizedUsername = sanitizeInput(data.username);

      const isUsernameAvailable = await checkUsernameAvailability(sanitizedUsername);
      if (!isUsernameAvailable) {
        const error = 'このユーザー名は既に使用されています';
        setAuthState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }

      const passwordHash = await hashPassword(data.password);

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

      console.log('ユーザー登録完了:', user.username);
      setAuthState({ user, loading: false, error: null });
      localStorage.setItem('voice_todo_user', JSON.stringify(user));

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'ユーザー登録に失敗しました';
      console.error('ユーザー登録エラー:', errorMessage);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const login = async (data: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('ログインを開始:', data.username);
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const sanitizedUsername = sanitizeInput(data.username);

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', sanitizedUsername)
        .single();

      if (error || !userData) {
        const errorMessage = 'ユーザー名またはパスワードが正しくありません';
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }

      const isPasswordValid = await verifyPassword(data.password, userData.password_hash);
      if (!isPasswordValid) {
        const errorMessage = 'ユーザー名またはパスワードが正しくありません';
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }

      const user: User = {
        id: userData.id,
        username: userData.username,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      console.log('ログイン完了:', user.username);
      setAuthState({ user, loading: false, error: null });
      localStorage.setItem('voice_todo_user', JSON.stringify(user));

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'ログインに失敗しました';
      console.error('ログインエラー:', errorMessage);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('ログアウトを実行');
      setAuthState({ user: null, loading: false, error: null });
      localStorage.removeItem('voice_todo_user');
    } catch (error) {
      console.error('ログアウトエラー:', error);
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

      const newPasswordHash = await hashPassword(newPassword);

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

      const { error: todosDeleteError } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', authState.user.id);

      if (todosDeleteError) {
        console.error('Todos delete error:', todosDeleteError);
        return { success: false, error: 'データの削除に失敗しました' };
      }

      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', authState.user.id);

      if (userDeleteError) {
        console.error('User delete error:', userDeleteError);
        return { success: false, error: 'アカウントの削除に失敗しました' };
      }

      setAuthState({ user: null, loading: false, error: null });
      localStorage.removeItem('voice_todo_user');

      return { success: true };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message || 'アカウントの削除に失敗しました' };
    }
  };

  const verifyUserForReset = async (username: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedUsername = sanitizeInput(username);

      const { data: userData, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', sanitizedUsername)
        .single();

      if (error || !userData) {
        return { success: false, error: 'ユーザーが見つかりません' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Verify user error:', error);
      return { success: false, error: 'ユーザーの確認に失敗しました' };
    }
  };

  const resetPassword = async (data: PasswordResetFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedUsername = sanitizeInput(data.username);

      // ユーザーの存在確認
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('username', sanitizedUsername)
        .single();

      if (fetchError || !userData) {
        return { success: false, error: 'ユーザーが見つかりません' };
      }

      // 新しいパスワードをハッシュ化
      const newPasswordHash = await hashPassword(data.newPassword);

      // パスワードを更新
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Password reset error:', updateError);
        return { success: false, error: 'パスワードの更新に失敗しました' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'パスワードのリセットに失敗しました' };
    }
  };

  return {
    authState,
    register,
    login,
    logout,
    checkUsername,
    changePassword,
    deleteAccount,
    verifyUserForReset,
    resetPassword
  };
};

export { AuthContext };