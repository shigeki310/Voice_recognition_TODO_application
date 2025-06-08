import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewMode } from '../types/todo';
import { ViewModeSelector } from './ViewModeSelector';
import { PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { UserSettings } from './settings/UserSettings';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedDate: Date;
  onAddTodo: () => void;
  todoCount: number;
}

export function Header({ viewMode, onViewModeChange, selectedDate, onAddTodo, todoCount }: HeaderProps) {
  const { authState, logout } = useAuth();
  const [showUserSettings, setShowUserSettings] = useState(false);

  const getDateDisplay = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, 'M月d日 (E)', { locale: ja });
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return `${format(weekStart, 'M月d日', { locale: ja })} - ${format(weekEnd, 'M月d日', { locale: ja })}`;
      case 'month':
        return format(selectedDate, 'yyyy年M月', { locale: ja });
      case 'future':
        return '次月以降のタスク';
      default:
        return '';
    }
  };

  const handleUserSettings = () => {
    setShowUserSettings(true);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30"
      >
        <div className="max-w-4xl mx-auto px-4">
          {/* 1. トップヘッダー */}
          <div className="flex items-center justify-between py-4">
            {/* 左側：アプリタイトル */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Voice TODO
              </h1>
            </div>
            
            {/* 右側：ユーザー設定アイコン */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleUserSettings}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                title="ユーザー設定"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </motion.button>
              
              {authState.user && (
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded transition-colors duration-200"
                  title="ログアウト"
                >
                  ログアウト
                </motion.button>
              )}
            </div>
          </div>

          {/* 2. ウェルカムメッセージ */}
          {authState.user && (
            <div className="pb-3">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-slate-600 font-medium"
              >
                ようこそ、<span className="text-slate-800">{authState.user.username}</span>さん
              </motion.p>
            </div>
          )}

          {/* 3. セカンドヘッダー */}
          <div className="flex items-center justify-between pb-4">
            {/* 左側：日付表示 */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <h2 className="text-lg font-semibold text-slate-800">
                  {getDateDisplay()}
                </h2>
                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {todoCount}件のタスク
                </span>
              </motion.div>
            </div>
            
            {/* 右側：追加ボタン */}
            <motion.button
              onClick={onAddTodo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-4 h-4" />
              追加
            </motion.button>
          </div>
          
          {/* ビューモードセレクター */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pb-4"
          >
            <ViewModeSelector
              currentMode={viewMode}
              onModeChange={onViewModeChange}
            />
          </motion.div>
        </div>
      </motion.header>

      {/* ユーザー設定モーダル */}
      <AnimatePresence>
        {showUserSettings && (
          <UserSettings
            isOpen={showUserSettings}
            onClose={() => setShowUserSettings(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}