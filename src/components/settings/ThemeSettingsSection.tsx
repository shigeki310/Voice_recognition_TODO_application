import React from 'react';
import { motion } from 'framer-motion';
import { 
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { ThemeSettings } from '../../types/settings';
import clsx from 'clsx';

interface ThemeSettingsSectionProps {
  settings: ThemeSettings;
  onSettingsChange: (settings: Partial<ThemeSettings>) => void;
}

export function ThemeSettingsSection({ settings, onSettingsChange }: ThemeSettingsSectionProps) {
  const handleModeChange = (mode: ThemeSettings['mode']) => {
    onSettingsChange({ mode });
  };

  const modeOptions = [
    { value: 'light', label: 'ライト', icon: SunIcon, description: '明るいテーマ' },
    { value: 'dark', label: 'ダーク', icon: MoonIcon, description: '暗いテーマ' },
    { value: 'system', label: 'システム', icon: ComputerDesktopIcon, description: 'システム設定に従う' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">テーマ設定</h2>
        
        {/* テーマモード設定 */}
        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <PaintBrushIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">表示モード</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {modeOptions.map(option => {
              const Icon = option.icon;
              const isSelected = settings.mode === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleModeChange(option.value)}
                  className={clsx(
                    'flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                  )}
                >
                  <Icon className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs mt-1 opacity-75">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>現在の設定:</strong> {modeOptions.find(opt => opt.value === settings.mode)?.label}
              {settings.mode === 'system' && (
                <span className="block mt-1 text-xs opacity-75">
                  システムの設定に応じて自動的に切り替わります
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}