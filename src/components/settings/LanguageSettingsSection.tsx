import React from 'react';
import { motion } from 'framer-motion';
import { 
  LanguageIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { LanguageSettings } from '../../types/settings';
import clsx from 'clsx';

interface LanguageSettingsSectionProps {
  settings: LanguageSettings;
  onSettingsChange: (settings: Partial<LanguageSettings>) => void;
}

export function LanguageSettingsSection({ settings, onSettingsChange }: LanguageSettingsSectionProps) {
  const handleLanguageChange = (language: LanguageSettings['language']) => {
    onSettingsChange({ language });
  };

  const handleTimeFormatChange = (timeFormat: LanguageSettings['timeFormat']) => {
    onSettingsChange({ timeFormat });
  };

  const languageOptions = [
    { value: 'ja', label: '日本語', nativeName: '日本語', flag: '🇯🇵' },
    { value: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸' },
  ] as const;

  const timeFormatOptions = [
    { value: '12h', label: '12時間形式', example: '2:30 PM', description: 'AM/PM表示' },
    { value: '24h', label: '24時間形式', example: '14:30', description: '24時間表示' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">言語・地域設定</h2>
        
        {/* 言語設定 */}
        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <LanguageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">表示言語</h3>
          </div>
          
          <div className="space-y-3">
            {languageOptions.map(option => {
              const isSelected = settings.language === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleLanguageChange(option.value)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                  )}
                >
                  <span className="text-2xl">{option.flag}</span>
                  <div className="text-left flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm opacity-75">{option.nativeName}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>注意:</strong> 言語を変更すると、アプリケーションが再読み込みされます。
            </p>
          </div>
        </div>

        {/* 時刻形式設定 */}
        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">時刻形式</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timeFormatOptions.map(option => {
              const isSelected = settings.timeFormat === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleTimeFormatChange(option.value)}
                  className={clsx(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                  )}
                >
                  <div className="font-mono text-lg font-bold">{option.example}</div>
                  <div className="text-center">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>現在の設定:</strong> {timeFormatOptions.find(opt => opt.value === settings.timeFormat)?.label}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}