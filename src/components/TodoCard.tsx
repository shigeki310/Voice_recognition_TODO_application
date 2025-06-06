import React from 'react';
import { motion } from 'framer-motion';
import { Todo } from '../types/todo';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
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

export function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const priority = priorityConfig[todo.priority];
  const PriorityIcon = priority.icon;
  
  const isOverdue = !todo.completed && todo.dueDate < new Date();
  const isDueToday = format(todo.dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

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
              <ClockIcon className="w-3 h-3" />
              <span className={clsx(
                isOverdue && !todo.completed && 'text-red-500 font-medium',
                isDueToday && !todo.completed && 'text-amber-600 font-medium'
              )}>
                {format(todo.dueDate, 'M月d日 HH:mm', { locale: ja })}
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
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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