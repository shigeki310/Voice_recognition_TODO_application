import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentArrowDownIcon,
  FolderArrowDownIcon,
  CalendarIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { PrivacySettings } from '../../types/settings';
import { User } from '../../types/auth';
import clsx from 'clsx';

interface PrivacySettingsSectionProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: Partial<PrivacySettings>) => void;
  user: User | null;
}

export function PrivacySettingsSection({ settings, onSettingsChange, user }: PrivacySettingsSectionProps) {
  const [loading, setLoading] = useState(false);

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    onSettingsChange({ [key]: value });
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
        todos: [], // 実際のTODOデータ
        format: settings.exportFormat,
        period: settings.exportPeriod
      };
      
      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      if (settings.exportFormat === 'csv') {
        // CSV形式でのエクスポート
        fileContent = 'ID,Title,Description,Completed,Priority,Due Date,Created At\n';
        fileName = `voice-todo-data-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        // JSON形式でのエクスポート
        fileContent = JSON.stringify(exportData, null, 2);
        fileName = `voice-todo-data-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }
      
      // ファイルダウンロード
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // 成功メッセージの表示
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'データのエクスポートが完了しました';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (error) {
      // エラーメッセージの表示
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'データのエクスポートに失敗しました';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const exportFormatOptions = [
    { value: 'csv', label: 'CSV', description: 'スプレッドシートで開ける形式', icon: '📊' },
    { value: 'json', label: 'JSON', description: 'プログラムで処理しやすい形式', icon: '📄' },
  ] as const;

  const exportPeriodOptions = [
    { value: 'all', label: 'すべて', description: '全期間のデータ' },
    { value: 'last30days', label: '過去30日', description: '最近1ヶ月のデータ' },
    { value: 'last90days', label: '過去90日', description: '最近3ヶ月のデータ' },
    { value: 'lastyear', label: '過去1年', description: '最近1年のデータ' },
  ] as const;

  const downloadFormatOptions = [
    { value: 'zip', label: 'ZIP圧縮', description: '複数ファイルを圧縮' },
    { value: 'individual', label: '個別ファイル', description: 'ファイルごとに分割' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">データエクスポート</h2>
        
        {/* データエクスポート設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <DocumentArrowDownIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">エクスポート設定</h3>
          </div>
          
          <div className="space-y-6">
            {/* エクスポート形式 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                エクスポート形式
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exportFormatOptions.map(option => {
                  const isSelected = settings.exportFormat === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handlePrivacyChange('exportFormat', option.value)}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-left flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-75">{option.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* エクスポート期間 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                エクスポート対象期間
              </label>
              <div className="space-y-2">
                {exportPeriodOptions.map(option => {
                  const isSelected = settings.exportPeriod === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handlePrivacyChange('exportPeriod', option.value)}
                      className={clsx(
                        'w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm opacity-75">{option.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ダウンロード形式 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <ArchiveBoxIcon className="w-4 h-4 inline mr-1" />
                ダウンロード形式
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {downloadFormatOptions.map(option => {
                  const isSelected = settings.downloadFormat === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handlePrivacyChange('downloadFormat', option.value)}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <FolderArrowDownIcon className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-75">{option.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* データエクスポート実行 */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900">データをエクスポート</h3>
              <p className="text-sm text-slate-500 mt-1">
                現在の設定: {settings.exportFormat.toUpperCase()}形式、
                {exportPeriodOptions.find(opt => opt.value === settings.exportPeriod)?.label}、
                {downloadFormatOptions.find(opt => opt.value === settings.downloadFormat)?.label}
              </p>
            </div>
            <button
              onClick={handleDataExport}
              disabled={loading}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200',
                loading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
              )}
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              {loading ? 'エクスポート中...' : 'エクスポート開始'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}