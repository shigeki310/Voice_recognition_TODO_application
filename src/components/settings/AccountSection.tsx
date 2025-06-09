import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types/auth';
import { PasswordChangeData } from '../../types/settings';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

interface AccountSectionProps {
  user: User | null;
}

export function AccountSection({ user }: AccountSectionProps) {
  const { changePassword, deleteAccount } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(null);

    // バリデーション
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('すべてのフィールドを入力してください');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('新しいパスワードは8文字以上で入力してください');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setError('新しいパスワードは半角英大文字、小文字、数字を各1文字以上含む必要があります');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        setSuccess('パスワードが変更されました');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        setError(result.error || 'パスワードの変更に失敗しました');
      }
    } catch (error) {
      setError('パスワードの変更に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteAccount();
      
      if (result.success) {
        // アカウント削除成功時は自動的にログアウトされる
      } else {
        setError(result.error || 'アカウントの削除に失敗しました');
      }
    } catch (error) {
      setError('アカウントの削除に失敗しました');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const resetForm = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError(null);
    setSuccess(null);
    setShowPasswordForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">アカウント設定</h2>
        
        {/* 成功メッセージ */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {/* パスワード変更 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <KeyIcon className="w-5 h-5 text-slate-400" />
              <h3 className="font-medium text-slate-900">パスワード変更</h3>
            </div>
            <button
              onClick={() => showPasswordForm ? resetForm() : setShowPasswordForm(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showPasswordForm ? 'キャンセル' : '変更する'}
            </button>
          </div>
          
          {showPasswordForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* 現在のパスワード */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  現在のパスワード
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="現在のパスワードを入力"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 新しいパスワード */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  新しいパスワード
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="新しいパスワードを入力"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  8-32文字、英大文字・小文字・数字を各1文字以上
                </p>
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  新しいパスワード（確認）
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="新しいパスワードを再入力"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className={clsx(
                  'w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200',
                  loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                )}
              >
                {loading ? 'パスワード変更中...' : 'パスワードを変更'}
              </button>
            </motion.div>
          )}
        </div>

        {/* アカウント削除 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-red-900">危険な操作</h3>
          </div>
          
          <p className="text-sm text-red-700 mb-4">
            アカウントを削除すると、すべてのデータが完全に削除され、復元できません。
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <TrashIcon className="w-4 h-4" />
              アカウントを削除
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-red-900">
                本当にアカウントを削除しますか？この操作は取り消せません。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAccountDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {loading ? '削除中...' : '削除する'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors duration-200"
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}