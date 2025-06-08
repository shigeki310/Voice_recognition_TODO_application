import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { UserSettings } from '../../types/settings';
import { User } from '../../types/auth';
import clsx from 'clsx';

interface PrivacySectionProps {
  settings: UserSettings;
  onSettingsChange: (settings: Partial<UserSettings>) => void;
  user: User | null;
}

export function PrivacySection({ settings, onSettingsChange, user }: PrivacySectionProps) {
  const [loading, setLoading] = useState(false);
  const [showDataDeleteConfirm, setShowDataDeleteConfirm] = useState(false);

  const handlePrivacyChange = (key: keyof UserSettings['privacy'], value: boolean) => {
    onSettingsChange({
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
  };

  const handleDataExport = async () => {
    setLoading(true);
    try {
      // データエクスポート処理
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模擬API呼び出し
      
      // 模擬データの作成
      const exportData = {
        user: user,
        settings: settings,
        exportDate: new Date().toISOString(),
        todos: [] // 実際のTODOデータ
      };
      
      // ファイルダウンロード
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-todo-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('データのエクスポートが完了しました');
    } catch (error) {
      alert('データのエクスポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDataDelete = async () => {
    setLoading(true);
    try {
      // データ削除処理
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬API呼び出し
      alert('すべてのデータが削除されました');
      setShowDataDeleteConfirm(false);
    } catch (error) {
      alert('データの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">プライバシー設定</h2>
        
        {/* プライバシー設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheckIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">データの取り扱い</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">データ共有</h4>
                <p className="text-sm text-slate-500">サービス改善のためのデータ共有を許可</p>
              </div>
              <button
                onClick={() => handlePrivacyChange('dataSharing', !settings.privacy.dataSharing)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.privacy.dataSharing ? 'bg-primary-600' : 'bg-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                    settings.privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">使用状況の分析</h4>
                <p className="text-sm text-slate-500">アプリの使用状況を分析してサービスを改善</p>
              </div>
              <button
                onClick={() => handlePrivacyChange('analytics', !settings.privacy.analytics)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.privacy.analytics ? 'bg-primary-600' : 'bg-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                    settings.privacy.analytics ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* データ管理 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-slate-900 mb-4">データ管理</h3>
          
          <div className="space-y-3">
            {/* データエクスポート */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DocumentArrowDownIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <h4 className="font-medium text-slate-900">データをエクスポート</h4>
                  <p className="text-sm text-slate-500">すべてのデータをJSONファイルでダウンロード</p>
                </div>
              </div>
              <button
                onClick={handleDataExport}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'エクスポート中...' : 'エクスポート'}
              </button>
            </div>
          </div>
        </div>

        {/* データ削除 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-red-900">データの完全削除</h3>
          </div>
          
          <p className="text-sm text-red-700 mb-4">
            すべてのTODOデータと設定を完全に削除します。この操作は取り消せません。
          </p>
          
          {!showDataDeleteConfirm ? (
            <button
              onClick={() => setShowDataDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <TrashIcon className="w-4 h-4" />
              すべてのデータを削除
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-red-900">
                本当にすべてのデータを削除しますか？この操作は取り消せません。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDataDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {loading ? '削除中...' : 'すべて削除'}
                </button>
                <button
                  onClick={() => setShowDataDeleteConfirm(false)}
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