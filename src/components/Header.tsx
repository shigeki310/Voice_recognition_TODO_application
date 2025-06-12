import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewMode } from '../types/todo';
import { ViewModeSelector } from './ViewModeSelector';
import { PlusIcon, Cog6ToothIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { UserSettings } from './settings/UserSettings';
import { Todo } from '../types/todo';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddTodo: () => void;
  todos: Todo[];
}

export function Header({ viewMode, onViewModeChange, selectedDate, onDateChange, onAddTodo, todos }: HeaderProps) {
  const { authState, logout } = useAuth();
  const [showUserSettings, setShowUserSettings] = useState(false);

  // 基準日: 2025/06/08
  const baseDate = new Date('2025-06-08');

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

  const getTaskCount = () => {
    switch (viewMode) {
      case 'day':
        // 本日のタスク数
        return todos.filter(todo => isSameDay(todo.dueDate, selectedDate)).length;
      
      case 'week':
        // 週のタスク数
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return todos.filter(todo => 
          todo.dueDate >= weekStart && todo.dueDate <= weekEnd
        ).length;
      
      case 'month':
        // 月のタスク数
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return todos.filter(todo => 
          todo.dueDate >= monthStart && todo.dueDate <= monthEnd
        ).length;
      
      case 'future':
        // 次月以降のタスク数（基準日の翌月以降）
        const nextMonthStart = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
        return todos.filter(todo => todo.dueDate >= nextMonthStart).length;
      
      default:
        return 0;
    }
  };

  const taskCount = getTaskCount();

  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        onDateChange(subDays(selectedDate, 1));
        break;
      case 'week':
        onDateChange(subWeeks(selectedDate, 1));
        break;
      case 'month':
        onDateChange(subMonths(selectedDate, 1));
        break;
      case 'future':
        // 次月以降ビューでは日付移動は無効
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        onDateChange(addDays(selectedDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(selectedDate, 1));
        break;
      case 'month':
        onDateChange(addMonths(selectedDate, 1));
        break;
      case 'future':
        // 次月以降ビューでは日付移動は無効
        break;
    }
  };

  const handleUserSettings = () => {
    setShowUserSettings(true);
  };

  const isNavigationEnabled = viewMode !== 'future';

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30"
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {/* 1. トップヘッダー */}
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* 左側：アプリタイトル */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pb-4">
            {/* 左側：日付表示とナビゲーション */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 日付ナビゲーション */}
              {isNavigationEnabled && (
                <div className="flex items-center gap-1">
                  <motion.button
                    onClick={handlePrevious}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                    title="前へ"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                    title="次へ"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"
              >
                <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                  {getDateDisplay()}
                </h2>
                <span className="text-xs sm:text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full w-fit">
                  {taskCount}件のタスク
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
              className="flex items-center justify-center sm:justify-start gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">追加</span>
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