import React from 'react';
import { motion } from 'framer-motion';
import { Todo } from '../types/todo';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckIcon,
  ClockIcon,
  BellIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { useNotifications } from '../hooks/useNotifications';
import clsx from 'clsx';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

const priorityConfig = {
  high: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: '高',
    accent: 'bg-red-500'
  },
  medium: {
    icon: InformationCircleIcon,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: '中',
    accent: 'bg-amber-500'
  },
  low: {
    icon: CheckIcon,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: '低',
    accent: 'bg-green-500'
  }
};

const truncateTitle = (title: string, maxLength: number = 12): string => {
  if (title.length <= maxLength) {
    return title;
  }
  
  const truncated = title.substring(0, maxLength);
  
  if (/[。、！？\s]$/.test(truncated)) {
    return truncated + '...';
  }
  
  const lastPunctuation = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('、'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？'),
    truncated.lastIndexOf(' ')
  );
  
  if (lastPunctuation > maxLength * 0.6) {
    return truncated.substring(0, lastPunctuation + 1) + '...';
  }
  
  return truncated + '...';
};

export function TodoCard({ todo, onToggle, onEdit, onDelete, compact = false }: TodoCardProps) {
  const { testNotification, showDebugInfo, permission } = useNotifications();
  const priority = priorityConfig[todo.priority];
  const PriorityIcon = priority.icon;
  
  const isOverdue = !todo.completed && todo.dueDate < new Date();
  const isDueToday = format(todo.dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  // 時刻とリマインダーの統合表示
  const getTimeInfo = () => {
    const timeDisplay = todo.dueTime || null;
    const reminderDisplay = todo.reminderEnabled && todo.reminderTime ? (() => {
      if (todo.reminderTime >= 1440) {
        const days = Math.floor(todo.reminderTime / 1440);
        return `${days}日前`;
      } else if (todo.reminderTime >= 60) {
        const hours = Math.floor(todo.reminderTime / 60);
        return `${hours}時間前`;
      } else {
        return `${todo.reminderTime}分前`;
      }
    })() : null;

    return { timeDisplay, reminderDisplay };
  };

  const { timeDisplay, reminderDisplay } = getTimeInfo();

  const handleTestNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🧪 テスト通知ボタンがクリックされました:', todo.title);
    testNotification(todo);
  };

  const handleDebugInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🔧 デバッグ情報ボタンがクリックされました');
    showDebugInfo();
  };

  // コンパクトモード（週・月表示）
  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        className={clsx(
          'relative p-2 rounded-lg border group cursor-pointer transition-all duration-200 bg-white shadow-sm hover:shadow-md',
          todo.completed && 'opacity-60'
        )}
        onClick={() => onEdit(todo)}
      >
        {/* 優先度アクセント */}
        <div className={clsx('absolute left-0 top-0 bottom-0 w-1 rounded-l-lg', priority.accent)} />
        
        <div className="flex items-start gap-2 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(todo.id);
            }}
            className="flex-shrink-0 mt-0.5"
          >
            {todo.completed ? (
              <CheckCircleIconSolid className="w-3 h-3 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-3 h-3 text-slate-400 hover:text-green-500" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 
              className={clsx(
                'text-xs font-medium leading-tight mb-1',
                todo.completed ? 'line-through text-slate-500' : 'text-slate-900'
              )}
              title={todo.title}
            >
              {truncateTitle(todo.title, 12)}
            </h3>
            
            {/* 統合された時間情報 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-2 h-2 text-slate-400" />
                <span className={clsx(
                  isOverdue && !todo.completed ? 'text-red-500 font-medium' : 'text-slate-500'
                )}>
                  {format(todo.dueDate, 'M/d', { locale: ja })}
                </span>
                {timeDisplay && (
                  <>
                    <ClockIcon className="w-2 h-2 text-slate-400 ml-1" />
                    <span className="text-slate-600">{timeDisplay}</span>
                  </>
                )}
              </div>
              
              {/* リマインダーと優先度を横並び */}
              <div className="flex items-center gap-1">
                {reminderDisplay && (
                  <div className="flex items-center gap-0.5 px-1 py-0.5 rounded text-xs bg-blue-50">
                    <BellIcon className="w-2 h-2 text-blue-500" />
                    <span className="text-blue-600 text-xs">{reminderDisplay}</span>
                  </div>
                )}
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  priority.accent
                )} title={`優先度: ${priority.label}`} />
              </div>
            </div>
          </div>

          {/* ホバー時のアクションボタン */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {process.env.NODE_ENV === 'development' && (
              <>
                <button
                  onClick={handleDebugInfo}
                  className="p-0.5 text-purple-400 hover:text-purple-600 rounded"
                  title="デバッグ情報"
                >
                  <BugAntIcon className="w-2.5 h-2.5" />
                </button>
                {todo.reminderEnabled && (
                  <button
                    onClick={handleTestNotification}
                    className="p-0.5 text-blue-400 hover:text-blue-600 rounded"
                    title="テスト通知"
                  >
                    <BellIcon className="w-2.5 h-2.5" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(todo);
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
            >
              <PencilIcon className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(todo.id);
              }}
              className="p-0.5 text-slate-400 hover:text-red-500 rounded"
            >
              <TrashIcon className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 通常モード（日表示）
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={clsx(
        'relative bg-white rounded-xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-200 p-4 group',
        todo.completed && 'opacity-60'
      )}
    >
      {/* 優先度アクセント */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', priority.accent)} />
      
      <div className="flex items-start gap-3 ml-1">
        <button
          onClick={() => onToggle(todo.id)}
          className="flex-shrink-0 mt-0.5 transition-colors duration-200"
        >
          {todo.completed ? (
            <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
          ) : (
            <CheckCircleIcon className="w-5 h-5 text-slate-400 hover:text-green-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={clsx(
            'font-medium text-slate-900 mb-2',
            todo.completed && 'line-through text-slate-500'
          )}>
            {todo.title}
          </h3>
          
          {todo.description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {todo.description}
            </p>
          )}

          {/* 統合された情報バー */}
          <div className="flex items-center justify-between">
            {/* 左側：日付と時刻 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-slate-400" />
                <span className={clsx(
                  'text-sm',
                  isOverdue && !todo.completed && 'text-red-500 font-medium',
                  isDueToday && !todo.completed && 'text-amber-600 font-medium'
                )}>
                  {format(todo.dueDate, 'M月d日', { locale: ja })}
                </span>
              </div>
              
              {timeDisplay && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-slate-600">{timeDisplay}</span>
                </div>
              )}
            </div>

            {/* 右側：リマインダーと優先度 */}
            <div className="flex items-center gap-2">
              {reminderDisplay && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-200">
                  <BellIcon className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">
                    {reminderDisplay}
                  </span>
                </div>
              )}
              
              <div className={clsx(
                'flex items-center gap-1 px-2 py-1 rounded-full border',
                priority.bg,
                priority.border
              )}>
                <PriorityIcon className={clsx('w-3 h-3', priority.color)} />
                <span className={clsx('text-xs font-medium', priority.color)}>{priority.label}</span>
              </div>
            </div>
          </div>

          {/* 開発モード用の通知状態表示 */}
          {process.env.NODE_ENV === 'development' && todo.reminderEnabled && (
            <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
              通知許可: {permission === 'granted' ? '✅' : permission === 'denied' ? '❌' : '⚠️'}
              {permission !== 'granted' && ' (通知が表示されません)'}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {process.env.NODE_ENV === 'development' && (
            <>
              <button
                onClick={handleDebugInfo}
                className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                title="デバッグ情報を表示"
              >
                <BugAntIcon className="w-4 h-4" />
              </button>
              {todo.reminderEnabled && (
                <button
                  onClick={handleTestNotification}
                  className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="テスト通知を送信"
                >
                  <BellIcon className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}