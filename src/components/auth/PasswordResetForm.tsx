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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { PasswordResetFormData } from '../../types/auth';
import { passwordResetSchema } from '../../utils/validation';
import clsx from 'clsx';

export function PasswordResetForm() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'username' | 'reset'>('username');
  const [username, setUsername] = useState('');
  
  const { resetPassword, verifyUserForReset } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema)
  });

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('root', { message: 'ユーザー名を入力してください' });
      return;
    }

    try {
      const result = await verifyUserForReset(username.trim());
      
      if (result.success) {
        setStep('reset');
        reset({ username: username.trim() });
      } else {
        setError('root', { message: result.error || 'ユーザーが見つかりません' });
      }
    } catch (error) {
      setError('root', { message: 'ユーザーの確認に失敗しました' });
    }
  };

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      const result = await resetPassword(data);
      
      if (result.success) {
        navigate('/login', { 
          state: { message: 'パスワードが変更されました。新しいパスワードでログインしてください。' }
        });
      } else {
        setError('root', { message: result.error || 'パスワードの変更に失敗しました' });
      }
    } catch (error) {
      setError('root', { message: 'パスワードの変更に失敗しました' });
    }
  };

  const handleBack = () => {
    if (step === 'reset') {
      setStep('username');
      setUsername('');
      reset();
    } else {
      navigate('/login');
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
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {step === 'username' ? 'パスワードリセット' : '新しいパスワード'}
          </h1>
          <p className="text-slate-600">
            {step === 'username' 
              ? 'ユーザー名を入力してください' 
              : '新しいパスワードを設定してください'
            }
          </p>
        </div>

        {step === 'username' ? (
          <form onSubmit={handleUsernameSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                ユーザー名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={clsx(
                    'block w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200',
                    errors.root ? 'border-red-300' : 'border-slate-300'
                  )}
                  placeholder="ユーザー名を入力"
                  autoFocus
                />
              </div>
            </div>

            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200',
                isSubmitting || !username.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              )}
            >
              {isSubmitting ? '確認中...' : '次へ'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ユーザー名（読み取り専用） */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ユーザー名
              </label>
              <div className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                {username}
              </div>
              <input
                {...register('username')}
                type="hidden"
                value={username}
              />
            </div>

            {/* 新しいパスワード */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                新しいパスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  className={clsx(
                    'block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200',
                    errors.newPassword ? 'border-red-300' : 'border-slate-300'
                  )}
                  placeholder="新しいパスワードを入力"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
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

            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

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
              {isSubmitting ? 'パスワード変更中...' : 'パスワードを変更'}
            </motion.button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
          >
            ログインページに戻る
          </Link>
        </div>
      </motion.div>
    </div>
  );
}