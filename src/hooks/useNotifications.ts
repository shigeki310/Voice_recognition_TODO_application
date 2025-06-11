import { useState, useEffect, useCallback } from 'react';
import { Todo } from '../types/todo';

interface NotificationState {
  permission: NotificationPermission;
  supported: boolean;
}

interface ScheduledReminder {
  todoId: string;
  timeoutId: number;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    supported: false
  });

  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);

  // 通知間隔を1時間（3600000ミリ秒）に設定
  const NOTIFICATION_INTERVAL = 60 * 60 * 1000; // 1時間

  useEffect(() => {
    if ('Notification' in window) {
      setState({
        permission: Notification.permission,
        supported: true
      });
    } else {
      console.warn('このブラウザは通知機能をサポートしていません');
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.supported) {
      console.warn('通知機能がサポートされていません');
      return false;
    }

    if (state.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        console.log('通知許可が取得されました');
        return true;
      } else {
        console.warn('通知許可が拒否されました');
        return false;
      }
    } catch (error) {
      console.error('通知許可の取得に失敗しました:', error);
      return false;
    }
  }, [state.supported, state.permission]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!state.supported) {
      console.warn('通知機能がサポートされていません');
      return null;
    }

    if (state.permission !== 'granted') {
      console.warn('通知許可が取得されていません');
      return null;
    }

    // 通知間隔チェック（1時間以内の重複通知を防ぐ）
    const now = Date.now();
    if (now - lastNotificationTime < NOTIFICATION_INTERVAL) {
      console.log('通知間隔が短すぎるため、通知をスキップしました');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        requireInteraction: false,
        silent: false,
        ...options
      });

      console.log('通知を表示しました:', title);
      setLastNotificationTime(now);

      // 通知クリック時の処理
      notification.onclick = () => {
        console.log('通知がクリックされました');
        window.focus();
        notification.close();
      };

      // 自動で閉じる（8秒後）
      setTimeout(() => {
        notification.close();
      }, 8000);

      return notification;
    } catch (error) {
      console.error('通知の表示に失敗しました:', error);
      return null;
    }
  }, [state.permission, state.supported, lastNotificationTime, NOTIFICATION_INTERVAL]);

  const scheduleReminder = useCallback((todo: Todo) => {
    if (!todo.reminderEnabled || !todo.reminderTime) {
      console.log('リマインダーが無効または時間が設定されていません:', todo.title);
      return null;
    }

    const now = new Date();
    let reminderTime: Date;

    // 時刻が設定されている場合は、その時刻から計算
    if (todo.dueTime) {
      const [hours, minutes] = todo.dueTime.split(':').map(Number);
      const dueDateTime = new Date(todo.dueDate);
      dueDateTime.setHours(hours, minutes, 0, 0);
      reminderTime = new Date(dueDateTime.getTime() - (todo.reminderTime * 60 * 1000));
    } else {
      // 時刻が設定されていない場合は、日付の開始時刻から計算
      reminderTime = new Date(todo.dueDate.getTime() - (todo.reminderTime * 60 * 1000));
    }

    console.log('リマインダー計算:', {
      todoTitle: todo.title,
      dueDate: todo.dueDate,
      dueTime: todo.dueTime,
      reminderMinutes: todo.reminderTime,
      reminderTime: reminderTime,
      now: now
    });

    if (reminderTime <= now) {
      console.log('リマインダー時刻が既に過ぎています:', todo.title);
      return null;
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    // 1時間未満の場合はスケジュールしない
    if (timeUntilReminder < NOTIFICATION_INTERVAL) {
      console.log(`リマインダー時刻まで1時間未満のため、スケジュールしません: ${todo.title}`);
      return null;
    }

    console.log(`リマインダーを${Math.round(timeUntilReminder / 1000 / 60)}分後にスケジュールしました:`, todo.title);

    const timeoutId = window.setTimeout(() => {
      console.log('リマインダー通知を表示:', todo.title);
      showNotification(`リマインダー: ${todo.title}`, {
        body: todo.description || '期限が近づいています',
        tag: `reminder-${todo.id}`,
        icon: '/vite.svg',
        requireInteraction: true,
      });

      // スケジュールリストから削除
      setScheduledReminders(prev => 
        prev.filter(reminder => reminder.timeoutId !== timeoutId)
      );
    }, timeUntilReminder);

    // スケジュールリストに追加
    setScheduledReminders(prev => [
      ...prev.filter(reminder => reminder.todoId !== todo.id),
      { todoId: todo.id, timeoutId }
    ]);

    return timeoutId;
  }, [showNotification, NOTIFICATION_INTERVAL]);

  const cancelReminder = useCallback((todoId: string) => {
    const reminder = scheduledReminders.find(r => r.todoId === todoId);
    if (reminder) {
      clearTimeout(reminder.timeoutId);
      setScheduledReminders(prev => 
        prev.filter(r => r.todoId !== todoId)
      );
      console.log('リマインダーをキャンセルしました:', todoId);
    }
  }, [scheduledReminders]);

  const cancelAllReminders = useCallback(() => {
    scheduledReminders.forEach(reminder => {
      clearTimeout(reminder.timeoutId);
    });
    setScheduledReminders([]);
    console.log('すべてのリマインダーをキャンセルしました');
  }, [scheduledReminders]);

  // テスト用の即座通知機能（開発モードでのみ有効）
  const testNotification = useCallback((todo: Todo) => {
    if (process.env.NODE_ENV !== 'development') {
      console.log('テスト通知は開発モードでのみ利用可能です');
      return;
    }
    
    console.log('テスト通知を表示:', todo.title);
    // テスト通知は間隔制限を無視
    const notification = new Notification(`テスト通知: ${todo.title}`, {
      body: todo.description || 'これはテスト通知です',
      tag: `test-${todo.id}`,
      icon: '/vite.svg',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 5000);
  }, []);

  return {
    ...state,
    requestPermission,
    showNotification,
    scheduleReminder,
    cancelReminder,
    cancelAllReminders,
    testNotification,
    scheduledCount: scheduledReminders.length,
    notificationInterval: NOTIFICATION_INTERVAL
  };
}