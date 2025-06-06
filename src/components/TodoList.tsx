import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo, ViewMode } from '../types/todo';
import { TodoCard } from './TodoCard';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TodoListProps {
  todos: Todo[];
  viewMode: ViewMode;
  selectedDate: Date;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, viewMode, selectedDate, onToggle, onEdit, onDelete }: TodoListProps) {
  const getFilteredTodos = () => {
    switch (viewMode) {
      case 'day':
        return todos.filter(todo => isSameDay(todo.dueDate, selectedDate));
      
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return todos.filter(todo => 
          todo.dueDate >= weekStart && todo.dueDate <= weekEnd
        );
      
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return todos.filter(todo => 
          todo.dueDate >= monthStart && todo.dueDate <= monthEnd
        );
      
      default:
        return todos;
    }
  };

  const getGroupedTodos = () => {
    const filtered = getFilteredTodos();
    
    if (viewMode === 'day') {
      return { [format(selectedDate, 'yyyy-MM-dd')]: filtered };
    }
    
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const grouped: Record<string, Todo[]> = {};
      days.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        grouped[dayKey] = filtered.filter(todo => isSameDay(todo.dueDate, day));
      });
      
      return grouped;
    }
    
    // Month view - group by date
    const grouped: Record<string, Todo[]> = {};
    filtered.forEach(todo => {
      const dateKey = format(todo.dueDate, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(todo);
    });
    
    return grouped;
  };

  const groupedTodos = getGroupedTodos();
  const hasAnyTodos = Object.values(groupedTodos).some(todos => todos.length > 0);

  if (!hasAnyTodos) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">タスクがありません</h3>
        <p className="text-slate-500">新しいタスクを追加してみましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {Object.entries(groupedTodos).map(([dateKey, dayTodos]) => {
          if (dayTodos.length === 0 && viewMode !== 'week') return null;
          
          const date = new Date(dateKey);
          const isToday = isSameDay(date, new Date());
          
          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {(viewMode === 'week' || viewMode === 'month') && (
                <div className="flex items-center gap-3">
                  <h3 className={`text-sm font-medium ${isToday ? 'text-primary-600' : 'text-slate-700'}`}>
                    {format(date, 'M月d日 (E)', { locale: ja })}
                    {isToday && <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">今日</span>}
                  </h3>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-500">{dayTodos.length}件</span>
                </div>
              )}
              
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {dayTodos.map(todo => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}