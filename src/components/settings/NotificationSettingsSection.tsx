import React from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon,
  CalendarDaysIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { NotificationSettings } from '../../types/settings';
import { t } from '../../utils/i18n';
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
    { value: 0, label: t('day.sunday') },
    { value: 1, label: t('day.monday') },
    { value: 2, label: t('day.tuesday') },
    { value: 3, label: t('day.wednesday') },
    { value: 4, label: t('day.thursday') },
    { value: 5, label: t('day.friday') },
    { value: 6, label: t('day.saturday') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('notifications.title')}</h2>
        
        {/* タスクリマインダー設定 */}
        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BellIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t('notifications.taskReminders')}</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">{t('notifications.reminderFunction')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('notifications.reminderDesc')}</p>
            </div>
            <button
              onClick={() => handleTaskReminderChange('enabled', !settings.taskReminders.enabled)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                settings.taskReminders.enabled ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-600'
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
        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDaysIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t('notifications.dailySummary')}</h3>
          </div>
          
          <div className="space-y-4">
            {/* 日次サマリー有効/無効 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">{t('notifications.dailySummaryEnabled')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('notifications.dailySummaryDesc')}</p>
              </div>
              <button
                onClick={() => handleDailySummaryChange('enabled', !settings.dailySummary.enabled)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.dailySummary.enabled ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-600'
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
                className="space-y-4 pl-4 border-l-2 border-slate-100 dark:border-slate-600"
              >
                {/* 送信時刻 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('notifications.sendTime')}
                  </label>
                  <input
                    type="time"
                    value={settings.dailySummary.time}
                    onChange={(e) => handleDailySummaryChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* 含める情報 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    {t('notifications.includeInfo')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.dailySummary.includeCompleted}
                        onChange={(e) => handleDailySummaryChange('includeCompleted', e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{t('notifications.completedTasks')}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.dailySummary.includeIncomplete}
                        onChange={(e) => handleDailySummaryChange('includeIncomplete', e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{t('notifications.incompleteTasks')}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.dailySummary.includePriority}
                        onChange={(e) => handleDailySummaryChange('includePriority', e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{t('notifications.priorityInfo')}</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 週次レポート設定 */}
        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <DocumentTextIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t('notifications.weeklyReport')}</h3>
          </div>
          
          <div className="space-y-4">
            {/* 週次レポート有効/無効 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">{t('notifications.weeklyReportEnabled')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('notifications.weeklyReportDesc')}</p>
              </div>
              <button
                onClick={() => handleWeeklyReportChange('enabled', !settings.weeklyReport.enabled)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  settings.weeklyReport.enabled ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-600'
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
                className="space-y-4 pl-4 border-l-2 border-slate-100 dark:border-slate-600"
              >
                {/* 配信曜日 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('notifications.deliveryDay')}
                  </label>
                  <select
                    value={settings.weeklyReport.dayOfWeek}
                    onChange={(e) => handleWeeklyReportChange('dayOfWeek', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('notifications.deliveryTime')}
                  </label>
                  <input
                    type="time"
                    value={settings.weeklyReport.time}
                    onChange={(e) => handleWeeklyReportChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* レポート形式 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('notifications.reportFormat')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleWeeklyReportChange('format', 'summary')}
                      className={clsx(
                        'p-3 rounded-lg border-2 transition-colors duration-200',
                        settings.weeklyReport.format === 'summary'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      <div className="font-medium">{t('notifications.summary')}</div>
                      <div className="text-xs mt-1">{t('notifications.summaryDesc')}</div>
                    </button>
                    <button
                      onClick={() => handleWeeklyReportChange('format', 'detailed')}
                      className={clsx(
                        'p-3 rounded-lg border-2 transition-colors duration-200',
                        settings.weeklyReport.format === 'detailed'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      <div className="font-medium">{t('notifications.detailed')}</div>
                      <div className="text-xs mt-1">{t('notifications.detailedDesc')}</div>
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