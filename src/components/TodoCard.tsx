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
      whileHover={{ y: -1 }}
      className={clsx(
        'task-card p-3 group relative',
        todo.priority === 'high' && 'priority-high',
        todo.priority === 'medium' && 'priority-medium',
        todo.priority === 'low' && 'priority-low',
        todo.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggle(todo.id)}
          className="flex-shrink-0 mt-0.5 transition-colors duration-200"
        >
          {todo.completed ? (
            <CheckCircleIconSolid className="w-4 h-4 text-green-500" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-slate-400 hover:text-green-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={clsx(
            'font-medium text-slate-900 mb-1 text-sm leading-tight',
            todo.completed && 'line-through text-slate-500'
          )}>
            {todo.title}
          </h3>
          
          {todo.description && (
            <p className="text-xs text-slate-600 mb-2 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span className={clsx(
                'truncate',
                isOverdue && !todo.completed && 'text-red-500 font-medium',
                isDueToday && !todo.completed && 'text-amber-600 font-medium'
              )}>
                {format(todo.dueDate, 'HH:mm', { locale: ja })}
              </span>
            </div>
            
            <div className={clsx(
              'flex items-center gap-1 px-1.5 py-0.5 rounded-full',
              priority.bg,
              priority.border,
              'border'
            )}>
              <PriorityIcon className={clsx('w-2.5 h-2.5', priority.color)} />
              <span className={clsx('text-xs', priority.color)}>{priority.label}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-2 right-2">
          <button
            onClick={() => onEdit(todo)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors duration-200"
          >
            <PencilIcon className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}