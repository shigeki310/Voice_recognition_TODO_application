import React from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon,
  CalendarDaysIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { NotificationSettings } from '../../types/settings';
import clsx from 'clsx';

interface NotificationSettingsSectionProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: Partial<NotificationSettings>) => void;
}

export function NotificationSettingsSection({ settings, onSettingsChange }: NotificationSettingsSectionProps) {
  const handleTaskReminderChange = (key: keyof NotificationSettings['taskReminders'], value: any) => {
    onSettingsChange({
      taskReminders: {
        ...settings.taskReminders,
        [key]: value
      }
    });
  };

  const handleDailySummaryChange = (key: keyof NotificationSettings['dailySummary'], value: any) => {
    onSettingsChange({
      dailySummary: {
        ...settings.dailySummary,
        [key]: value
      }
    });
  };

  const handleWeeklyReportChange = (key: keyof NotificationSettings['weeklyReport'], value: any) => {
    onSettingsChange({
      weeklyReport: {
        ...settings.weeklyReport,
        [key]: value
      }
    });
  };

  const dayOfWeekOptions = [
    { value: 0, label: '日曜日' },
    { value: 1, label: '月曜日' },
    { value: 2, label: '火曜日' },
    { value: 3, label: '水曜日' },
    { value: 4, label: '木曜日' },
    { value: 5, label: '金曜日' },
    { value: 6, label: '土曜日' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">通知設定</h2>
        
        {/* タスクリマインダー設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BellIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">タスクリマインダー</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">リマインダー機能</h4>
              <p className="text-sm text-slate-500">タスクの期限前に通知を送信</p>
            </div>
            <button
              onClick={() => handleTaskReminderChange('enabled', !settings.taskReminders.enabled)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                settings.taskReminders.enabled ? 'bg-primary-600' : 'bg-slate-200'
              )}
            >
              <span
                className={clsx(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                  settings.taskReminders.enabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* 日次サマリー設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">日次サマリー</h3>
          </div>
          
          <div className="space-y-4">
            {/* 日次サマリー有効/無効 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">日次サマリー送信</h4>
                <p className="text-sm text-slate-500">毎日の終わりにタスクの進捗を通知</p>
              </div>
              <button
                onClick={() => handleDailySummaryChange('enabled', !settings.dailySummary.enabled)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.dailySummary.enabled ? 'bg-primary-600' : 'bg-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                    settings.dailySummary.enabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {settings.dailySummary.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pl-4 border-l-2 border-slate-100"
              >
                {/* 送信時刻 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    送信時刻
                  </label>
                  <input
                    type="time"
                    value={settings.dailySummary.time}
                    onChange={(e) => handleDailySummaryChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* 含める情報 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    含める情報
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.dailySummary.includeCompleted}
                        onChange={(e) => handleDailySummaryChange('includeCompleted', e.target.checked)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">完了したタスク</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.dailySummary.includeIncomplete}
                        onChange={(e) => handleDailySummaryChange('includeIncomplete', e.target.checked)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">未完了のタスク</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.dailySummary.includePriority}
                        onChange={(e) => handleDailySummaryChange('includePriority', e.target.checked)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">優先度情報</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 週次レポート設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <DocumentTextIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">週次レポート</h3>
          </div>
          
          <div className="space-y-4">
            {/* 週次レポート有効/無効 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">週次レポート送信</h4>
                <p className="text-sm text-slate-500">週の終わりに完了したタスクのレポートを送信</p>
              </div>
              <button
                onClick={() => handleWeeklyReportChange('enabled', !settings.weeklyReport.enabled)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.weeklyReport.enabled ? 'bg-primary-600' : 'bg-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                    settings.weeklyReport.enabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {settings.weeklyReport.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pl-4 border-l-2 border-slate-100"
              >
                {/* 配信曜日 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    配信曜日
                  </label>
                  <select
                    value={settings.weeklyReport.dayOfWeek}
                    onChange={(e) => handleWeeklyReportChange('dayOfWeek', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {dayOfWeekOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 配信時間 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    配信時間
                  </label>
                  <input
                    type="time"
                    value={settings.weeklyReport.time}
                    onChange={(e) => handleWeeklyReportChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* レポート形式 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    レポート形式
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleWeeklyReportChange('format', 'summary')}
                      className={clsx(
                        'p-3 rounded-lg border-2 transition-colors duration-200',
                        settings.weeklyReport.format === 'summary'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      <div className="font-medium">サマリー</div>
                      <div className="text-xs mt-1">簡潔な概要</div>
                    </button>
                    <button
                      onClick={() => handleWeeklyReportChange('format', 'detailed')}
                      className={clsx(
                        'p-3 rounded-lg border-2 transition-colors duration-200',
                        settings.weeklyReport.format === 'detailed'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      <div className="font-medium">詳細</div>
                      <div className="text-xs mt-1">完全なレポート</div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}