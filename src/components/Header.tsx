import React from 'react';
import { motion } from 'framer-motion';
import { ViewMode } from '../types/todo';
import { ViewModeSelector } from './ViewModeSelector';
import { PlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedDate: Date;
  onAddTodo: () => void;
  todoCount: number;
}

export function Header({ viewMode, onViewModeChange, selectedDate, onAddTodo, todoCount }: HeaderProps) {
  const { authState, logout } = useAuth();

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

  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30"
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Voice TODO
            </h1>
            <p className="text-sm text-slate-600">
              {getDateDisplay()} • {todoCount}件のタスク
            </p>
            {authState.user && (
              <p className="text-xs text-slate-500 mt-1">
                ようこそ、{authState.user.username}さん
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onAddTodo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              追加
            </motion.button>
            
            {authState.user && (
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-medium transition-colors duration-200"
                title="ログアウト"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
        
        <ViewModeSelector
          currentMode={viewMode}
          onModeChange={onViewModeChange}
        />
      </div>
    </motion.header>
  );
}