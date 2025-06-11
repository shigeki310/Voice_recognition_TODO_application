import React, { useEffect, useRef } from 'react';
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

  const lastProcessedTodos = useRef<string>('');
  const permissionRequested = useRef(false);

  // 通知許可を要求（初回のみ）
  useEffect(() => {
    if (permission === 'default' && supported && !permissionRequested.current) {
      permissionRequested.current = true;
      console.log('通知許可を要求します');
      requestPermission().then(granted => {
        if (granted) {
          console.log('通知許可が取得されました - リマインダーを管理します');
        } else {
          console.warn('通知許可が拒否されました');
        }
      });
    }
  }, [permission, requestPermission, supported]);

  // TODOリストの変更を監視（不要な再処理を防ぐ）
  useEffect(() => {
    // TODOリストのハッシュを作成して変更を検出
    const todosHash = JSON.stringify(
      todos
        .filter(t => t.reminderEnabled)
        .map(t => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate.getTime(),
          dueTime: t.dueTime,
          reminderTime: t.reminderTime,
          completed: t.completed
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    // 前回と同じ内容の場合は処理をスキップ
    if (todosHash === lastProcessedTodos.current) {
      return;
    }

    lastProcessedTodos.current = todosHash;

    console.log('ReminderManager: リマインダー設定を更新します', {
      totalTodos: todos.length,
      todosWithReminders: todos.filter(t => t.reminderEnabled).length,
      permission,
      supported,
      notificationIntervalMinutes: notificationInterval / (1000 * 60)
    });

    // 通知許可がない場合は何もしない
    if (permission !== 'granted') {
      console.log('通知許可がないため、リマインダーをスケジュールしません');
      return;
    }

    // 既存のリマインダーをすべてキャンセル
    cancelAllReminders();

    // 有効なリマインダーをスケジュール
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
      
      // 未来のリマインダーのみを対象とする
      return timeUntilReminder > 0;
    });

    console.log(`アクティブなリマインダー: ${activeReminders.length}件`);

    activeReminders.forEach(todo => {
      const timeoutId = scheduleReminder(todo);
      if (timeoutId) {
        const now = new Date();
        let reminderTime: Date;

        if (todo.dueTime) {
          const [hours, minutes] = todo.dueTime.split(':').map(Number);
          const dueDateTime = new Date(todo.dueDate);
          dueDateTime.setHours(hours, minutes, 0, 0);
          reminderTime = new Date(dueDateTime.getTime() - (todo.reminderTime! * 60 * 1000));
        } else {
          reminderTime = new Date(todo.dueDate.getTime() - (todo.reminderTime! * 60 * 1000));
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        console.log(`リマインダーをスケジュールしました: ${todo.title} (${Math.round(timeUntilReminder / 1000 / 60)}分後)`);
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