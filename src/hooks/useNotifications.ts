import { useState, useEffect, useCallback, useRef } from 'react';
import { Todo } from '../types/todo';

interface NotificationState {
  permission: NotificationPermission;
  supported: boolean;
}

interface ScheduledReminder {
  todoId: string;
  timeoutId: number;
  scheduledTime: Date;
  reminderTime: Date;
  todoTitle: string;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    supported: false
  });

  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const lastNotificationTime = useRef<Record<string, number>>({});
  const initializationRef = useRef(false);
  const notificationRefs = useRef<Map<string, Notification>>(new Map());

  // 通知間隔を30秒に設定
  const NOTIFICATION_INTERVAL = 30 * 1000; // 30秒

  // 初期化処理
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    // ブラウザサポートチェック
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'denied';

    setState(prev => ({
      ...prev,
      permission,
      supported
    }));

    if (supported && permission === 'granted') {
      // 初期化完了後にテスト通知を送信
      setTimeout(() => {
        testBrowserNotification();
      }, 1000);
    }
  }, []);

  // ブラウザの通知機能をテスト
  const testBrowserNotification = useCallback(() => {
    const currentPermission = Notification.permission;
    if (currentPermission !== 'granted') {
      return;
    }
    
    try {
      const testNotification = new Notification('🔔 Voice TODO App', {
        body: '通知システムが正常に動作しています',
        icon: '/vite.svg',
        tag: 'system-test',
        requireInteraction: false,
        silent: false,
        renotify: true,
        timestamp: Date.now()
      });

      testNotification.onclick = () => {
        window.focus();
        testNotification.close();
      };

      testNotification.onclose = () => {
        // 通知が閉じられた時の処理
      };

      // 5秒後に自動で閉じる
      setTimeout(() => {
        testNotification.close();
      }, 5000);

    } catch (error) {
      console.error('テスト通知の作成に失敗しました:', error);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.supported) {
      return false;
    }

    if (state.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({ 
        ...prev, 
        permission
      }));
      
      if (permission === 'granted') {
        setTimeout(() => {
          testBrowserNotification();
        }, 500);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('通知許可の取得に失敗しました:', error);
      return false;
    }
  }, [state.supported, state.permission, testBrowserNotification]);

  const showNotification = useCallback((title: string, options?: NotificationOptions, todoId?: string) => {
    if (!state.supported) {
      return null;
    }

    if (state.permission !== 'granted') {
      return null;
    }

    // 同じTODOの通知間隔チェック
    const now = Date.now();
    if (todoId && lastNotificationTime.current[todoId]) {
      const timeSinceLastNotification = now - lastNotificationTime.current[todoId];
      if (timeSinceLastNotification < NOTIFICATION_INTERVAL) {
        return null;
      }
    }

    try {
      const notificationOptions = {
        icon: '/vite.svg',
        requireInteraction: false,
        silent: false,
        renotify: true,
        timestamp: Date.now(),
        ...options
      };

      const notification = new Notification(title, notificationOptions);

      notification.onshow = () => {
        if (todoId) {
          lastNotificationTime.current[todoId] = now;
        }
      };

      notification.onerror = (error) => {
        console.error('通知表示エラー:', error);
      };

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (todoId) {
          notificationRefs.current.delete(todoId);
        }
      };

      notification.onclose = () => {
        if (todoId) {
          notificationRefs.current.delete(todoId);
        }
      };

      // 通知を参照として保存
      if (todoId) {
        notificationRefs.current.set(todoId, notification);
      }

      // 自動で閉じる（20秒後）
      setTimeout(() => {
        notification.close();
        if (todoId) {
          notificationRefs.current.delete(todoId);
        }
      }, 20000);

      return notification;
    } catch (error) {
      console.error('通知の表示に失敗しました:', error);
      return null;
    }
  }, [state.permission, state.supported, NOTIFICATION_INTERVAL]);

  const scheduleReminder = useCallback((todo: Todo) => {
    if (!todo.reminderEnabled) {
      return null;
    }

    if (!todo.reminderTime) {
      return null;
    }

    if (todo.completed) {
      return null;
    }

    const now = new Date();
    let reminderTime: Date;

    try {
      // 時刻が設定されている場合は、その時刻から計算
      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          return null;
        }
        
        const dueDateTime = new Date(todo.dueDate);
        dueDateTime.setHours(hours, minutes, 0, 0);
        reminderTime = new Date(dueDateTime.getTime() - (todo.reminderTime * 60 * 1000));
      } else {
        // 時刻が設定されていない場合は、日付の開始時刻から計算
        const dueDateStart = new Date(todo.dueDate);
        dueDateStart.setHours(0, 0, 0, 0);
        reminderTime = new Date(dueDateStart.getTime() - (todo.reminderTime * 60 * 1000));
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      if (timeUntilReminder <= 0) {
        const pastByMinutes = Math.abs(timeUntilReminder / 1000 / 60);
        
        // 過去の時刻でも5分以内なら即座に通知
        if (pastByMinutes <= 5) {
          setTimeout(() => {
            showNotification(`📋 ${todo.title}`, {
              body: todo.description || 'タスクの時間になりました',
              tag: `reminder-${todo.id}`,
              icon: '/vite.svg'
            }, todo.id);
          }, 1000);
        }
        
        return null;
      }

      const timeoutId = window.setTimeout(() => {
        showNotification(`📋 ${todo.title}`, {
          body: todo.description || 'タスクの時間になりました',
          tag: `reminder-${todo.id}`,
          icon: '/vite.svg'
        }, todo.id);

        // スケジュールリストから削除
        setScheduledReminders(prev => 
          prev.filter(reminder => reminder.timeoutId !== timeoutId)
        );
      }, timeUntilReminder);

      // スケジュールリストに追加
      const newReminder: ScheduledReminder = {
        todoId: todo.id,
        timeoutId,
        scheduledTime: now,
        reminderTime,
        todoTitle: todo.title
      };

      setScheduledReminders(prev => [
        ...prev.filter(reminder => reminder.todoId !== todo.id),
        newReminder
      ]);

      return timeoutId;
    } catch (error) {
      console.error('リマインダーのスケジューリングに失敗しました:', error);
      return null;
    }
  }, [showNotification]);

  const cancelReminder = useCallback((todoId: string) => {
    const reminder = scheduledReminders.find(r => r.todoId === todoId);
    if (reminder) {
      clearTimeout(reminder.timeoutId);
      setScheduledReminders(prev => 
        prev.filter(r => r.todoId !== todoId)
      );
    }

    // 表示中の通知も閉じる
    const notification = notificationRefs.current.get(todoId);
    if (notification) {
      notification.close();
      notificationRefs.current.delete(todoId);
    }
  }, [scheduledReminders]);

  const cancelAllReminders = useCallback(() => {
    if (scheduledReminders.length > 0) {
      scheduledReminders.forEach(reminder => {
        clearTimeout(reminder.timeoutId);
      });
      setScheduledReminders([]);
    }

    // 表示中の通知もすべて閉じる
    notificationRefs.current.forEach((notification) => {
      notification.close();
    });
    notificationRefs.current.clear();
  }, [scheduledReminders]);

  return {
    ...state,
    requestPermission,
    showNotification,
    scheduleReminder,
    cancelReminder,
    cancelAllReminders,
    scheduledCount: scheduledReminders.length,
    scheduledReminders,
    notificationInterval: NOTIFICATION_INTERVAL
  };
}