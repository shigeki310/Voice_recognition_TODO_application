import React from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon,
  PaintBrushIcon,
  LanguageIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { UserSettings } from '../../types/settings';
import clsx from 'clsx';

interface AppSettingsSectionProps {
  settings: UserSettings;
  onSettingsChange: (settings: Partial<UserSettings>) => void;
}

export function AppSettingsSection({ settings, onSettingsChange }: AppSettingsSectionProps) {
  const handleNotificationChange = (key: keyof UserSettings['notifications'], value: boolean) => {
    onSettingsChange({
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const handleThemeChange = (theme: UserSettings['theme']) => {
    onSettingsChange({ theme });
  };

  const handleLanguageChange = (language: UserSettings['language']) => {
    onSettingsChange({ language });
  };

  const themeOptions = [
    { value: 'light', label: 'ライト', icon: SunIcon },
    { value: 'dark', label: 'ダーク', icon: MoonIcon },
    { value: 'system', label: 'システム', icon: ComputerDesktopIcon },
  ] as const;

  const languageOptions = [
    { value: 'ja', label: '日本語' },
    { value: 'en', label: 'English' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">アプリ設定</h2>
        
        {/* 通知設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BellIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">通知設定</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">タスクリマインダー</h4>
                <p className="text-sm text-slate-500">期限が近づいたタスクを通知</p>
              </div>
              <button
                onClick={() => handleNotificationChange('taskReminders', !settings.notifications.taskReminders)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.notifications.taskReminders ? 'bg-primary-600' : 'bg-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                    settings.notifications.taskReminders ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">日次サマリー</h4>
                <p className="text-sm text-slate-500">毎日の終わりにタスクの進捗を通知</p>
              </div>
              <button
                onClick={() => handleNotificationChange('dailySummary', !settings.notifications.dailySummary)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.notifications.dailySummary ? 'bg-primary-600' : 'bg-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                    settings.notifications.dailySummary ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">週次レポート</h4>
                <p className="text-sm text-slate-500">週の終わりに完了したタスクのレポートを送信</p>
              </div>
              <button
                onClick={() => handleNotificationChange('weeklyReport', !settings.notifications.weeklyReport)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.notifications.weeklyReport ? 'bg-primary-600' : 'bg-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                    settings.notifications.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* テーマ設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PaintBrushIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">テーマ</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(option => {
              const Icon = option.icon;
              const isSelected = settings.theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={clsx(
                    'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors duration-200',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 言語設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <LanguageIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">言語</h3>
          </div>
          
          <div className="space-y-2">
            {languageOptions.map(option => {
              const isSelected = settings.language === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleLanguageChange(option.value)}
                  className={clsx(
                    'w-full flex items-center justify-between p-3 rounded-lg border transition-colors duration-200',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}