import React, { useEffect } from 'react';
import { Todo } from '../types/todo';
import { useNotifications } from '../hooks/useNotifications';

interface ReminderManagerProps {
  todos: Todo[];
}

export function ReminderManager({ todos }: ReminderManagerProps) {
  const { 
    scheduleReminder, 
    cancelReminder, 
    cancelAllReminders,
    requestPermission, 
    permission,
    supported,
    scheduledCount
  } = useNotifications();

  useEffect(() => {
    // 通知許可を要求
    if (permission === 'default' && supported) {
      console.log('通知許可を要求します');
      requestPermission().then(granted => {
        if (granted) {
          console.log('通知許可が取得されました');
        } else {
          console.warn('通知許可が拒否されました');
        }
      });
    }
  }, [permission, requestPermission, supported]);

  useEffect(() => {
    console.log('ReminderManager: TODOリストが更新されました', {
      totalTodos: todos.length,
      todosWithReminders: todos.filter(t => t.reminderEnabled).length,
      permission,
      supported
    });

    // 既存のリマインダーをすべてキャンセル
    cancelAllReminders();

    // 通知許可がない場合は何もしない
    if (permission !== 'granted') {
      console.log('通知許可がないため、リマインダーをスケジュールしません');
      return;
    }

    // 有効なリマインダーをスケジュール
    const activeReminders = todos.filter(todo => 
      todo.reminderEnabled && 
      !todo.completed && 
      todo.reminderTime
    );

    console.log('アクティブなリマインダー:', activeReminders.length);

    activeReminders.forEach(todo => {
      const timeoutId = scheduleReminder(todo);
      if (timeoutId) {
        console.log(`リマインダーをスケジュールしました: ${todo.title}`);
      }
    });

    // クリーンアップ
    return () => {
      console.log('ReminderManager: クリーンアップを実行');
      cancelAllReminders();
    };
  }, [todos, scheduleReminder, cancelAllReminders, permission]);

  // このコンポーネントは何も表示しない
  return null;
}