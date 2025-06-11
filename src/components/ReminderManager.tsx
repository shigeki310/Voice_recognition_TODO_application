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
    scheduledCount,
    notificationInterval
  } = useNotifications();

  useEffect(() => {
    // 通知許可を要求（初回のみ）
    if (permission === 'default' && supported) {
      console.log('通知許可を要求します');
      requestPermission().then(granted => {
        if (granted) {
          console.log('通知許可が取得されました - 1時間間隔でリマインダーを管理します');
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
      supported,
      notificationIntervalHours: notificationInterval / (1000 * 60 * 60)
    });

    // 既存のリマインダーをすべてキャンセル
    cancelAllReminders();

    // 通知許可がない場合は何もしない
    if (permission !== 'granted') {
      console.log('通知許可がないため、リマインダーをスケジュールしません');
      return;
    }

    // 有効なリマインダーをスケジュール（1時間以上先のもののみ）
    const activeReminders = todos.filter(todo => {
      if (!todo.reminderEnabled || todo.completed || !todo.reminderTime) {
        return false;
      }

      // リマインダー時刻を計算
      const now = new Date();
      let reminderTime: Date;

      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':').map(Number);
        const dueDateTime = new Date(todo.dueDate);
        dueDateTime.setHours(hours, minutes, 0, 0);
        reminderTime = new Date(dueDateTime.getTime() - (todo.reminderTime * 60 * 1000));
      } else {
        reminderTime = new Date(todo.dueDate.getTime() - (todo.reminderTime * 60 * 1000));
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      // 1時間以上先のリマインダーのみを対象とする
      return timeUntilReminder >= notificationInterval;
    });

    console.log(`アクティブなリマインダー（1時間以上先）: ${activeReminders.length}件`);

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
  }, [todos, scheduleReminder, cancelAllReminders, permission, notificationInterval]);

  // このコンポーネントは何も表示しない
  return null;
}