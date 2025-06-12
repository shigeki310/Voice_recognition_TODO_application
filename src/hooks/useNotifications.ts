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

    // テスト通知は削除
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
      
      return permission === 'granted';
    } catch (error) {
      console.error('通知許可の取得に失敗しました:', error);
      return false;
    }
  }, [state.supported, state.permission]);

  const showNotification = useCallback((title: string, options?: NotificationOptions, todoId?: string) => {
    if (!state.supported) {
      console.log('通知がサポートされていません');
      return null;
    }

    if (state.permission !== 'granted') {
      console.log('通知許可が取得されていません:', state.permission);
      return null;
    }

    // 同じTODOの通知間隔チェック
    const now = Date.now();
    if (todoId && lastNotificationTime.current[todoId]) {
      const timeSinceLastNotification = now - lastNotificationTime.current[todoId];
      if (timeSinceLastNotification < NOTIFICATION_INTERVAL) {
        console.log('通知間隔が短すぎるため、スキップします');
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

      console.log('通知を表示します:', title);
      const notification = new Notification(title, notificationOptions);

      notification.onshow = () => {
        console.log('通知が表示されました:', title);
        if (todoId) {
          lastNotificationTime.current[todoId] = now;
        }
      };

      notification.onerror = (error) => {
        console.error('通知表示エラー:', error);
      };

      notification.onclick = () => {
        console.log('通知がクリックされました:', title);
        window.focus();
        notification.close();
        if (todoId) {
          notificationRefs.current.delete(todoId);
        }
      };

      notification.onclose = () => {
        console.log('通知が閉じられました:', title);
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
    console.log('リマインダーをスケジュール中:', todo.title, {
      reminderEnabled: todo.reminderEnabled,
      reminderTime: todo.reminderTime,
      completed: todo.completed,
      dueDate: todo.dueDate.toLocaleString(),
      dueTime: todo.dueTime
    });

    if (!todo.reminderEnabled) {
      console.log('リマインダーが無効です');
      return null;
    }

    if (!todo.reminderTime) {
      console.log('リマインダー時間が設定されていません');
      return null;
    }

    if (todo.completed) {
      console.log('完了済みのタスクです');
      return null;
    }

    const now = new Date();
    let reminderTime: Date;

    try {
      // 時刻が設定されている場合は、その時刻から計算
      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          console.log('無効な時刻形式です:', todo.dueTime);
          return null;
        }
        
        const dueDateTime = new Date(todo.dueDate);
        dueDateTime.setHours(hours, minutes, 0, 0);
        reminderTime = new Date(dueDateTime.getTime() - (todo.reminderTime * 60 * 1000));
        
        console.log('時刻指定ありのリマインダー時刻:', {
          dueDateTime: dueDateTime.toLocaleString(),
          reminderTime: reminderTime.toLocaleString(),
          reminderMinutes: todo.reminderTime
        });
      } else {
        // 時刻が設定されていない場合は、日付の開始時刻から計算
        const dueDateStart = new Date(todo.dueDate);
        dueDateStart.setHours(0, 0, 0, 0);
        reminderTime = new Date(dueDateStart.getTime() - (todo.reminderTime * 60 * 1000));
        
        console.log('時刻指定なしのリマインダー時刻:', {
          dueDateStart: dueDateStart.toLocaleString(),
          reminderTime: reminderTime.toLocaleString(),
          reminderMinutes: todo.reminderTime
        });
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      const minutesUntilReminder = Math.round(timeUntilReminder / 1000 / 60);

      console.log('リマインダーまでの時間:', {
        now: now.toLocaleString(),
        reminderTime: reminderTime.toLocaleString(),
        timeUntilReminderMs: timeUntilReminder,
        minutesUntilReminder: minutesUntilReminder
      });

      if (timeUntilReminder <= 0) {
        const pastByMinutes = Math.abs(timeUntilReminder / 1000 / 60);
        console.log('リマインダー時刻が過去です:', pastByMinutes, '分前');
        
        // 過去の時刻でも5分以内なら即座に通知
        if (pastByMinutes <= 5) {
          console.log('5分以内の過去時刻のため、即座に通知します');
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

      console.log('リマインダーをスケジュールします:', minutesUntilReminder, '分後');

      const timeoutId = window.setTimeout(() => {
        console.log('スケジュールされたリマインダー通知を表示:', todo.title);
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

      console.log('リマインダーがスケジュールされました:', {
        todoId: todo.id,
        timeoutId,
        reminderTime: reminderTime.toLocaleString()
      });

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
      console.log('リマインダーをキャンセルしました:', todoId);
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
      console.log('すべてのリマインダーをキャンセルします:', scheduledReminders.length, '件');
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