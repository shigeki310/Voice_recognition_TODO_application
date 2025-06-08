import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { LoginFormData } from '../../types/auth';
import { loginSchema } from '../../utils/validation';
import clsx from 'clsx';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const message = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data);
      
      if (result.success) {
        navigate('/');
      } else {
        setError('root', { message: result.error || 'ログインに失敗しました' });
      }
    } catch (error) {
      setError('root', { message: 'ログインに失敗しました' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">ログイン</h1>
          <p className="text-slate-600">Voice TODO Appにログイン</p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

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
                  'block w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200',
                  errors.username ? 'border-red-300' : 'border-slate-300'
                )}
                placeholder="ユーザー名を入力"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
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
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              'w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200',
              isSubmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            )}
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            アカウントをお持ちでない方は{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              新規登録
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}