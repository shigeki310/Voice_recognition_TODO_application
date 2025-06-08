import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { RegisterFormData } from '../../types/auth';
import { registerSchema } from '../../utils/validation';
import clsx from 'clsx';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const { register: registerUser, checkUsername } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const watchedUsername = watch('username');

  // ユーザー名の重複チェック（デバウンス付き）
  React.useEffect(() => {
    if (!watchedUsername || watchedUsername.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const available = await checkUsername(watchedUsername);
        setUsernameAvailable(available);
      } catch (error) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername, checkUsername]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerUser(data);
      
      if (result.success) {
        navigate('/login', { 
          state: { message: 'アカウントが作成されました。ログインしてください。' }
        });
      } else {
        setError('root', { message: result.error || 'ユーザー登録に失敗しました' });
      }
    } catch (error) {
      setError('root', { message: 'ユーザー登録に失敗しました' });
    }
  };

  const getUsernameStatus = () => {
    if (!watchedUsername || watchedUsername.length < 3) return null;
    if (checkingUsername) return 'checking';
    if (usernameAvailable === true) return 'available';
    if (usernameAvailable === false) return 'unavailable';
    return null;
  };

  const usernameStatus = getUsernameStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">アカウント作成</h1>
          <p className="text-slate-600">Voice TODO Appへようこそ</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ユーザー名 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
              ユーザー名
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={clsx(
                  'block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200',
                  errors.username ? 'border-red-300' : 'border-slate-300'
                )}
                placeholder="ユーザー名を入力"
              />
              {usernameStatus && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {usernameStatus === 'checking' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  )}
                  {usernameStatus === 'available' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {usernameStatus === 'unavailable' && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
            {usernameStatus === 'unavailable' && (
              <p className="mt-1 text-sm text-red-600">このユーザー名は既に使用されています</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              3-20文字、半角英数字とアンダースコアのみ
            </p>
          </div>

          {/* パスワード */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              パスワード
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={clsx(
                  'block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200',
                  errors.password ? 'border-red-300' : 'border-slate-300'
                )}
                placeholder="パスワードを入力"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              8-32文字、英大文字・小文字・数字を各1文字以上
            </p>
          </div>

          {/* パスワード確認 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
              パスワード確認
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={clsx(
                  'block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200',
                  errors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                )}
                placeholder="パスワードを再入力"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* エラーメッセージ */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* 送信ボタン */}
          <motion.button
            type="submit"
            disabled={isSubmitting || usernameStatus === 'unavailable'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              'w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200',
              isSubmitting || usernameStatus === 'unavailable'
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            )}
          >
            {isSubmitting ? 'アカウント作成中...' : 'アカウント作成'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            既にアカウントをお持ちですか？{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              ログイン
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}