import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Todo, Priority, RepeatType } from '../types/todo';
import { XMarkIcon, CalendarIcon, FlagIcon, ClockIcon, ArrowPathIcon, BellIcon } from '@heroicons/react/24/outline';
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
    dueTime?: string,
    reminderEnabled?: boolean,
    reminderTime?: number,
    repeatType?: RepeatType
  ) => void;
  initialTitle?: string;
  selectedDate?: Date;
}

export function TodoForm({ 
  todo, 
  isOpen, 
  onClose, 
  onSubmit, 
  initialTitle, 
  selectedDate 
}: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(10); // 10分前がデフォルト
  const [repeatType, setRepeatType] = useState<RepeatType>('none');

  // 現在時刻を取得する関数
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (todo) {
      // 編集モード：既存のTODOデータを設定
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setDueDate(format(todo.dueDate, "yyyy-MM-dd"));
      setDueTime(todo.dueTime || '');
      setReminderEnabled(todo.reminderEnabled || false);
      setReminderTime(todo.reminderTime || 10);
      setRepeatType(todo.repeatType || 'none');
    } else {
      // 新規作成モード：デフォルト値を設定
      setTitle(initialTitle || '');
      setDescription('');
      setPriority('medium');
      const baseDate = selectedDate || new Date();
      setDueDate(format(baseDate, "yyyy-MM-dd"));
      // 新規作成時は現在時刻をデフォルトに設定
      setDueTime(getCurrentTime());
      setReminderEnabled(false);
      setReminderTime(10); // 10分前
      setRepeatType('none');
    }
  }, [todo, initialTitle, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 日付と時刻を組み合わせて Date オブジェクトを作成
    let dueDateObj: Date;
    if (dueTime) {
      dueDateObj = new Date(`${dueDate}T${dueTime}:00`);
    } else {
      dueDateObj = new Date(dueDate + 'T00:00:00');
    }

    onSubmit(
      title.trim(),
      description.trim() || undefined,
      priority,
      dueDateObj,
      dueTime || undefined,
      reminderEnabled,
      reminderTime,
      repeatType
    );
    
    if (!todo) {
      // 新規作成後はフォームをリセット
      setTitle('');
      setDescription('');
      setPriority('medium');
      const baseDate = selectedDate || new Date();
      setDueDate(format(baseDate, "yyyy-MM-dd"));
      // リセット時も現在時刻を設定
      setDueTime(getCurrentTime());
      setReminderEnabled(false);
      setReminderTime(10);
      setRepeatType('none');
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
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

          {/* 説明 */}
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

          {/* 優先度と期限日 */}
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
                期限日
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* 時刻指定 */}
          <div>
            <label htmlFor="dueTime" className="block text-sm font-medium text-slate-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              時刻
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                id="dueTime"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setDueTime(getCurrentTime())}
                className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
                title="現在時刻を設定"
              >
                現在
              </button>
              <button
                type="button"
                onClick={() => setDueTime('')}
                className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
                title="時刻をクリア"
              >
                クリア
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              新規作成時は現在時刻が自動設定されます
            </p>
          </div>

          {/* リマインダー設定 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <BellIcon className="w-4 h-4" />
                リマインダー
              </label>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  reminderEnabled ? 'bg-primary-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    通知タイミング
                  </label>
                  <select
                    value={reminderTime}
                    onChange={(e) => setReminderTime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  >
                    <option value={10}>10分前</option>
                    <option value={30}>30分前</option>
                    <option value={60}>1時間前</option>
                    <option value={360}>6時間前</option>
                    <option value={1440}>1日前</option>
                    <option value={10080}>1週間前</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    ※ 通知は設定した時間に表示されます
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* 繰り返し設定 */}
          <div>
            <label htmlFor="repeatType" className="block text-sm font-medium text-slate-700 mb-2">
              <ArrowPathIcon className="w-4 h-4 inline mr-1" />
              繰り返し
            </label>
            <select
              id="repeatType"
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            >
              <option value="none">繰り返しなし</option>
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
              <option value="yearly">毎年</option>
            </select>
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