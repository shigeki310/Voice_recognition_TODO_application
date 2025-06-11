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
  BellIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { useNotifications } from '../hooks/useNotifications';
import clsx from 'clsx';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  compact?: boolean; // 週・月表示用のコンパクトモード
}

const priorityConfig = {
  high: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: '高'
  },
  medium: {
    icon: InformationCircleIcon,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: '中'
  },
  low: {
    icon: CheckIcon,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: '低'
  }
};

// タイトルを適切に省略する関数
const truncateTitle = (title: string, maxLength: number = 10): string => {
  if (title.length <= maxLength) {
    return title;
  }
  
  // 10文字で切り取り、適切な区切りを探す
  const truncated = title.substring(0, maxLength);
  
  // 句読点や区切り文字で終わっている場合はそのまま
  if (/[。、！？\s]$/.test(truncated)) {
    return truncated + '...';
  }
  
  // 最後の区切り文字を探す
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
  const { testNotification } = useNotifications();
  const priority = priorityConfig[todo.priority];
  const PriorityIcon = priority.icon;
  
  const isOverdue = !todo.completed && todo.dueDate < new Date();
  const isDueToday = format(todo.dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  // 時刻表示の準備
  const getTimeDisplay = () => {
    if (todo.dueTime) {
      return todo.dueTime;
    }
    return null;
  };

  const timeDisplay = getTimeDisplay();

  // テスト通知ボタン（開発モードのみ）
  const handleTestNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    testNotification(todo);
  };

  // コンパクトモード（週・月表示）の場合
  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        className={clsx(
          'p-2 rounded-lg border group cursor-pointer transition-all duration-200',
          todo.priority === 'high' && 'border-l-2 border-l-red-400 bg-red-50/80',
          todo.priority === 'medium' && 'border-l-2 border-l-amber-400 bg-amber-50/80',
          todo.priority === 'low' && 'border-l-2 border-l-green-400 bg-green-50/80',
          todo.completed && 'opacity-60',
          'bg-white shadow-sm hover:shadow-md'
        )}
        onClick={() => onEdit(todo)}
      >
        <div className="flex items-start gap-1">
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
              title={todo.title} // ホバー時に完全なタイトルを表示
            >
              {truncateTitle(todo.title, 10)}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-2 h-2 text-slate-400" />
                <span className={clsx(
                  'text-xs',
                  isOverdue && !todo.completed ? 'text-red-500 font-medium' : 'text-slate-500'
                )}>
                  {format(todo.dueDate, 'M/d', { locale: ja })}
                  {timeDisplay && (
                    <span className="ml-1 text-xs">
                      {timeDisplay}
                    </span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-0.5">
                {todo.reminderEnabled && (
                  <BellIcon className="w-2 h-2 text-blue-500" />
                )}
                <div className={clsx(
                  'flex items-center gap-0.5 px-1 py-0.5 rounded text-xs',
                  priority.bg
                )}>
                  <PriorityIcon className={clsx('w-2 h-2', priority.color)} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {process.env.NODE_ENV === 'development' && todo.reminderEnabled && (
              <button
                onClick={handleTestNotification}
                className="p-0.5 text-blue-400 hover:text-blue-600 rounded"
                title="テスト通知"
              >
                <BellIcon className="w-2.5 h-2.5" />
              </button>
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

  // 通常モード（日表示）の場合
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={clsx(
        'task-card p-4 group',
        todo.priority === 'high' && 'priority-high',
        todo.priority === 'medium' && 'priority-medium',
        todo.priority === 'low' && 'priority-low',
        todo.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
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
            'font-medium text-slate-900 mb-1',
            todo.completed && 'line-through text-slate-500'
          )}>
            {todo.title}
          </h3>
          
          {todo.description && (
            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
              {todo.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <span className={clsx(
                isOverdue && !todo.completed && 'text-red-500 font-medium',
                isDueToday && !todo.completed && 'text-amber-600 font-medium'
              )}>
                {format(todo.dueDate, 'M月d日', { locale: ja })}
                {timeDisplay && (
                  <span className="ml-2 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {timeDisplay}
                  </span>
                )}
              </span>
            </div>
            
            <div className={clsx(
              'flex items-center gap-1 px-2 py-0.5 rounded-full',
              priority.bg,
              priority.border,
              'border'
            )}>
              <PriorityIcon className={clsx('w-3 h-3', priority.color)} />
              <span className={priority.color}>{priority.label}</span>
            </div>

            {todo.reminderEnabled && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                <BellIcon className="w-3 h-3 text-blue-500" />
                <span className="text-blue-600">
                  {todo.reminderTime}分前
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {process.env.NODE_ENV === 'development' && todo.reminderEnabled && (
            <button
              onClick={handleTestNotification}
              className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="テスト通知"
            >
              <BellIcon className="w-4 h-4" />
            </button>
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