import React from 'react';
import { motion } from 'framer-motion';
import { 
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon
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

  const handleColorPaletteChange = (colorPalette: ThemeSettings['colorPalette']) => {
    onSettingsChange({ colorPalette });
  };

  const handleFontSizeChange = (fontSize: ThemeSettings['fontSize']) => {
    onSettingsChange({ fontSize });
  };

  const modeOptions = [
    { value: 'light', label: 'ライト', icon: SunIcon, description: '明るいテーマ' },
    { value: 'dark', label: 'ダーク', icon: MoonIcon, description: '暗いテーマ' },
    { value: 'system', label: 'システム', icon: ComputerDesktopIcon, description: 'システム設定に従う' },
  ] as const;

  const colorPaletteOptions = [
    { value: 'blue', label: 'ブルー', color: 'bg-blue-500', description: 'デフォルトの青色' },
    { value: 'purple', label: 'パープル', color: 'bg-purple-500', description: '紫色のアクセント' },
    { value: 'green', label: 'グリーン', color: 'bg-green-500', description: '自然な緑色' },
    { value: 'orange', label: 'オレンジ', color: 'bg-orange-500', description: '暖かいオレンジ' },
    { value: 'pink', label: 'ピンク', color: 'bg-pink-500', description: '優しいピンク' },
  ] as const;

  const fontSizeOptions = [
    { value: 'small', label: '小', description: '読みやすい小さめのフォント' },
    { value: 'medium', label: '中', description: '標準的なフォントサイズ' },
    { value: 'large', label: '大', description: '見やすい大きめのフォント' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">テーマ設定</h2>
        
        {/* テーマモード設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PaintBrushIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">表示モード</h3>
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
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
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
        </div>

        {/* カラーパレット設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <SwatchIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">カラーパレット</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {colorPaletteOptions.map(option => {
              const isSelected = settings.colorPalette === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleColorPaletteChange(option.value)}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <div className={clsx('w-6 h-6 rounded-full', option.color)} />
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

        {/* フォントサイズ設定 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-medium text-slate-900">フォントサイズ</h3>
          </div>
          
          <div className="space-y-3">
            {fontSizeOptions.map(option => {
              const isSelected = settings.fontSize === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleFontSizeChange(option.value)}
                  className={clsx(
                    'w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <div className="text-left">
                    <div className={clsx(
                      'font-medium',
                      option.value === 'small' && 'text-sm',
                      option.value === 'medium' && 'text-base',
                      option.value === 'large' && 'text-lg'
                    )}>
                      {option.label} - サンプルテキスト
                    </div>
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
      </div>
    </motion.div>
  );
}