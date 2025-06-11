import { useState, useEffect, useCallback } from 'react';
import { Todo } from '../types/todo';

interface NotificationState {
  permission: NotificationPermission;
  supported: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    supported: false
  });

  useEffect(() => {
    if ('Notification' in window) {
      setState({
        permission: Notification.permission,
        supported: true
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.supported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('通知許可の取得に失敗しました:', error);
      return false;
    }
  }, [state.supported]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (state.permission !== 'granted') return null;

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      });

      // 通知クリック時の処理
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 自動で閉じる（5秒後）
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('通知の表示に失敗しました:', error);
      return null;
    }
  }, [state.permission]);

  const scheduleReminder = useCallback((todo: Todo) => {
    if (!todo.reminderEnabled || !todo.reminderTime) return;

    const now = new Date();
    const reminderTime = new Date(todo.dueDate.getTime() - (todo.reminderTime * 60 * 1000));

    if (reminderTime <= now) return; // 既に過ぎている場合はスケジュールしない

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      showNotification(`リマインダー: ${todo.title}`, {
        body: todo.description || '期限が近づいています',
        tag: `reminder-${todo.id}`,
        requireInteraction: true
      });
    }, timeUntilReminder);

    return timeoutId;
  }, [showNotification]);

  const cancelReminder = useCallback((timeoutId: number) => {
    clearTimeout(timeoutId);
  }, []);

  return {
    ...state,
    requestPermission,
    showNotification,
    scheduleReminder,
    cancelReminder
  };
}