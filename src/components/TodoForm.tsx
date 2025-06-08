import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Todo, Priority, TaskStatus } from '../types/todo';
import { XMarkIcon, CalendarIcon, FlagIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface TodoFormProps {
  todo?: Todo;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    title: string, 
    description?: string, 
    priority?: Priority, 
    dueDate?: Date,
    startTime?: Date,
    endTime?: Date,
    status?: TaskStatus
  ) => void;
  initialTitle?: string;
  selectedDate?: Date;
}

const statusOptions = [
  { value: 'not_started', label: '未開始', color: 'text-slate-500', bg: 'bg-slate-50' },
  { value: 'in_progress', label: '進行中', color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'completed', label: '完了', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'on_hold', label: '保留', color: 'text-amber-600', bg: 'bg-amber-50' },
];

export function TodoForm({ todo, isOpen, onClose, onSubmit, initialTitle, selectedDate }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setStatus(todo.status);
      setDueDate(format(todo.dueDate, "yyyy-MM-dd'T'HH:mm"));
      setStartTime(todo.startTime ? format(todo.startTime, "HH:mm") : '');
      setEndTime(todo.endTime ? format(todo.endTime, "HH:mm") : '');
    } else {
      setTitle(initialTitle || '');
      setDescription('');
      setPriority('medium');
      setStatus('not_started');
      
      // selectedDateが指定されている場合はその日付を使用、そうでなければ現在時刻
      const baseDate = selectedDate || new Date();
      setDueDate(format(baseDate, "yyyy-MM-dd'T'HH:mm"));
      setStartTime('09:00');
      setEndTime('10:00');
    }
  }, [todo, initialTitle, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dueDateObj = new Date(dueDate);
    const startTimeObj = startTime ? new Date(`${format(dueDateObj, 'yyyy-MM-dd')}T${startTime}`) : undefined;
    const endTimeObj = endTime ? new Date(`${format(dueDateObj, 'yyyy-MM-dd')}T${endTime}`) : undefined;

    onSubmit(
      title.trim(),
      description.trim() || undefined,
      priority,
      dueDateObj,
      startTimeObj,
      endTimeObj,
      status
    );
    
    if (!todo) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('not_started');
      const baseDate = selectedDate || new Date();
      setDueDate(format(baseDate, "yyyy-MM-dd'T'HH:mm"));
      setStartTime('09:00');
      setEndTime('10:00');
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
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
          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              タスクタイトル
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

          {/* 説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              タスク詳細（任意）
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

          {/* 日付と時間 */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                期限日時
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

          {/* 開始時間と終了時間 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                開始時間
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                終了時間
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* 優先度とステータス */}
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
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                ステータス
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ステータス表示 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">現在のステータス:</span>
            {statusOptions.map(option => (
              status === option.value && (
                <span
                  key={option.value}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${option.bg} ${option.color}`}
                >
                  {option.label}
                </span>
              )
            ))}
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