import { useState, useEffect, useCallback, useRef } from 'react';
import { Todo } from '../types/todo';

interface SimpleNotificationState {
  supported: boolean;
  permission: NotificationPermission;
  isRunning: boolean;
  lastCheckTime: string;
  notificationCount: number;
  notifiedTodos: string[];
}

export function useSimpleNotifications() {
  const [state, setState] = useState<SimpleNotificationState>({
    supported: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'denied',
    isRunning: false,
    lastCheckTime: new Date().toLocaleTimeString(),
    notificationCount: 0,
    notifiedTodos: []
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const todosRef = useRef<Todo[]>([]);

  const requestPermission = useCallback(async () => {
    if (!state.supported) return false;
    
    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('通知許可の取得に失敗:', error);
      return false;
    }
  }, [state.supported]);

  const showNotification = useCallback((title: string, body?: string) => {
    if (state.permission !== 'granted') return;
    
    try {
      const notification = new Notification(title, {
        body,
        icon: '/vite.svg',
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
      
      setState(prev => ({ 
        ...prev, 
        notificationCount: prev.notificationCount + 1 
      }));
    } catch (error) {
      console.error('通知の表示に失敗:', error);
    }
  }, [state.permission]);

  const checkReminders = useCallback(() => {
    const now = new Date();
    const currentTodos = todosRef.current;
    
    setState(prev => ({ 
      ...prev, 
      lastCheckTime: now.toLocaleTimeString() 
    }));

    currentTodos.forEach(todo => {
      if (!todo.reminderEnabled || todo.completed) return;
      if (state.notifiedTodos.includes(todo.id)) return;

      const dueDate = new Date(todo.dueDate);
      let reminderTime: Date;

      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':').map(Number);
        reminderTime = new Date(dueDate);
        reminderTime.setHours(hours, minutes, 0, 0);
        reminderTime = new Date(reminderTime.getTime() - (todo.reminderTime || 0) * 60 * 1000);
      } else {
        reminderTime = new Date(dueDate.getTime() - (todo.reminderTime || 0) * 60 * 1000);
      }

      if (now >= reminderTime && now.getTime() - reminderTime.getTime() < 60000) {
        showNotification(`📋 ${todo.title}`, todo.description || 'タスクの時間です');
        setState(prev => ({
          ...prev,
          notifiedTodos: [...prev.notifiedTodos, todo.id]
        }));
      }
    });
  }, [showNotification, state.notifiedTodos]);

  const startMonitoring = useCallback((todos: Todo[]) => {
    if (state.isRunning) return;
    
    todosRef.current = todos;
    setState(prev => ({ ...prev, isRunning: true }));
    
    intervalRef.current = setInterval(checkReminders, 30000); // 30秒間隔
    console.log('🚀 シンプル通知システム: 監視開始');
  }, [state.isRunning, checkReminders]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isRunning: false }));
    console.log('⏹️ シンプル通知システム: 監視停止');
  }, []);

  const updateTodos = useCallback((todos: Todo[]) => {
    todosRef.current = todos;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    requestPermission,
    startMonitoring,
    stopMonitoring,
    updateTodos
  };
}