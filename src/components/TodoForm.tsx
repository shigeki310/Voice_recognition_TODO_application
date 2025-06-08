import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Todo, Priority } from '../types/todo';
import { XMarkIcon, CalendarIcon, FlagIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface TodoFormProps {
  todo?: Todo;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string, priority?: Priority, dueDate?: Date) => void;
  initialTitle?: string;
  selectedDate?: Date;
}

export function TodoForm({ todo, isOpen, onClose, onSubmit, initialTitle, selectedDate }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setDueDate(format(todo.dueDate, "yyyy-MM-dd'T'HH:mm"));
    } else {
      setTitle(initialTitle || '');
      setDescription('');
      setPriority('medium');
      // selectedDateが指定されている場合はその日付を使用、そうでなければ現在時刻
      const baseDate = selectedDate || new Date();
      setDueDate(format(baseDate, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [todo, initialTitle, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit(
      title.trim(),
      description.trim() || undefined,
      priority,
      new Date(dueDate)
    );
    
    if (!todo) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      const baseDate = selectedDate || new Date();
      setDueDate(format(baseDate, "yyyy-MM-dd'T'HH:mm"));
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {todo ? 'タスクを編集' : '新しいタスク'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              placeholder="タスクのタイトルを入力"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              説明（任意）
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
              placeholder="詳細な説明を入力"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
                <FlagIcon className="w-4 h-4 inline mr-1" />
                優先度
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                期限
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              {todo ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}