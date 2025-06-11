import React, { useEffect } from 'react';
import { Todo } from '../types/todo';
import { useNotifications } from '../hooks/useNotifications';

interface ReminderManagerProps {
  todos: Todo[];
}

export function ReminderManager({ todos }: ReminderManagerProps) {
  const { scheduleReminder, cancelReminder, requestPermission, permission } = useNotifications();

  useEffect(() => {
    // 通知許可を要求
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const reminderTimeouts: number[] = [];

    // 有効なリマインダーをスケジュール
    todos.forEach(todo => {
      if (todo.reminderEnabled && !todo.completed) {
        const timeoutId = scheduleReminder(todo);
        if (timeoutId) {
          reminderTimeouts.push(timeoutId);
        }
      }
    });

    // クリーンアップ
    return () => {
      reminderTimeouts.forEach(timeoutId => {
        cancelReminder(timeoutId);
      });
    };
  }, [todos, scheduleReminder, cancelReminder]);

  return null; // このコンポーネントはUIを持たない
}