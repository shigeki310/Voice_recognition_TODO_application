import { useState, useEffect, useCallback, useRef } from 'react';
import { Todo } from '../types/todo';

interface SimpleNotificationState {
  permission: NotificationPermission;
  supported: boolean;
  isRunning: boolean;
  lastCheckTime: string;
  notificationCount: number;
}

export function useSimpleNotifications() {
  const [state, setState] = useState<SimpleNotificationState>({
    permission: 'default',
    supported: false,
    isRunning: false,
    lastCheckTime: '',
    notificationCount: 0
  });

  const intervalRef = useRef<number | null>(null);
  const lastNotifiedTodos = useRef<Set<string>>(new Set());
  const todosRef = useRef<Todo[]>([]);

  // 初期化処理
  useEffect(() => {
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'denied';

    setState(prev => ({
      ...prev,
      supported,
      permission
    }));

    if (supported && permission === 'default') {
      // 通知許可を要求
      Notification.requestPermission().then(result => {
        setState(prev => ({ ...prev, permission: result }));
        if (result === 'granted') {
          console.log('✅ 通知許可が取得されました');
          // テスト通知を送信
          showTestNotification();
        }
      });
    }
  }, []);

  // テスト通知を表示
  const showTestNotification = useCallback(() => {
    if (state.permission === 'granted') {
      try {
        const notification = new Notification('Voice TODO App', {
          body: 'シンプル通知システムが開始されました',
          icon: '/vite.svg'
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTimeout(() => {
          notification.close();
        }, 5000);
      } catch (error) {
        console.error('テスト通知の表示に失敗:', error);
      }
    }
  }, [state.permission]);

  // 時間チェック関数（提示されたコードと同様の仕組み）
  const checkTime = useCallback(() => {
    const currentTime = new Date();
    const currentMinutes = currentTime.getMinutes();
    const currentHour = currentTime.getHours();
    
    setState(prev => ({
      ...prev,
      lastCheckTime: currentTime.toLocaleTimeString()
    }));

    // 毎分0秒にチェック（提示されたコードは15分間隔だが、1分間隔に変更）
    if (currentTime.getSeconds() === 0) {
      console.log(`🕐 時間チェック実行: ${currentTime.toLocaleTimeString()}`);
      
      // リマインダーが有効なTODOをチェック
      todosRef.current.forEach(todo => {
        if (!todo.reminderEnabled || todo.completed || !todo.reminderTime) {
          return;
        }

        // リマインダー時刻を計算
        let reminderTime: Date;
        
        if (todo.dueTime) {
          const [hours, minutes] = todo.dueTime.split(':').map(Number);
          const dueDateTime = new Date(todo.dueDate);
          dueDateTime.setHours(hours, minutes, 0, 0);
          reminderTime = new Date(dueDateTime.getTime() - (todo.reminderTime * 60 * 1000));
        } else {
          reminderTime = new Date(todo.dueDate.getTime() - (todo.reminderTime * 60 * 1000));
        }

        // 現在時刻がリマインダー時刻と一致するかチェック（分単位）
        const reminderHour = reminderTime.getHours();
        const reminderMinute = reminderTime.getMinutes();
        const reminderDate = reminderTime.toDateString();
        const currentDate = currentTime.toDateString();

        if (
          currentDate === reminderDate &&
          currentHour === reminderHour &&
          currentMinutes === reminderMinute &&
          !lastNotifiedTodos.current.has(todo.id)
        ) {
          console.log(`🔔 リマインダー通知を送信: ${todo.title}`);
          
          // 通知を表示
          showReminderNotification(todo);
          
          // 通知済みとしてマーク
          lastNotifiedTodos.current.add(todo.id);
          
          setState(prev => ({
            ...prev,
            notificationCount: prev.notificationCount + 1
          }));
        }
      });
    }
  }, []);

  // リマインダー通知を表示
  const showReminderNotification = useCallback((todo: Todo) => {
    if (state.permission !== 'granted') {
      console.warn('通知許可がないため、通知を表示できません');
      return;
    }

    try {
      const options = {
        body: todo.description || '期限が近づいています',
        icon: '/vite.svg',
        tag: `reminder-${todo.id}`,
        requireInteraction: true,
        timestamp: Date.now()
      };

      const notification = new Notification(`📋 リマインダー: ${todo.title}`, options);

      notification.onshow = () => {
        console.log(`✅ 通知が表示されました: ${todo.title}`);
      };

      notification.onerror = (error) => {
        console.error('通知表示エラー:', error);
      };

      notification.onclick = () => {
        console.log(`通知がクリックされました: ${todo.title}`);
        window.focus();
        notification.close();
      };

      // 20秒後に自動で閉じる
      setTimeout(() => {
        notification.close();
      }, 20000);

    } catch (error) {
      console.error('通知の作成に失敗:', error);
    }
  }, [state.permission]);

  // 監視を開始
  const startMonitoring = useCallback((todos: Todo[]) => {
    if (!state.supported) {
      console.warn('ブラウザが通知をサポートしていません');
      return;
    }

    if (state.permission !== 'granted') {
      console.warn('通知許可が取得されていません');
      return;
    }

    if (intervalRef.current) {
      console.log('既に監視が開始されています');
      return;
    }

    console.log('🚀 シンプル通知システムを開始します（1秒間隔チェック）');
    
    // TODOリストを更新
    todosRef.current = todos;
    
    // 通知済みリストをクリア
    lastNotifiedTodos.current.clear();

    // 1秒間隔でチェック（提示されたコードと同様）
    intervalRef.current = window.setInterval(checkTime, 1000);
    
    setState(prev => ({
      ...prev,
      isRunning: true
    }));

    console.log('✅ 監視が開始されました');
  }, [state.supported, state.permission, checkTime]);

  // 監視を停止
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      
      setState(prev => ({
        ...prev,
        isRunning: false
      }));
      
      console.log('⏹️ シンプル通知システムを停止しました');
    }
  }, []);

  // TODOリストを更新
  const updateTodos = useCallback((todos: Todo[]) => {
    todosRef.current = todos;
    
    // 完了したTODOや削除されたTODOを通知済みリストから削除
    const currentTodoIds = new Set(todos.map(t => t.id));
    const notifiedIds = Array.from(lastNotifiedTodos.current);
    
    notifiedIds.forEach(id => {
      if (!currentTodoIds.has(id)) {
        lastNotifiedTodos.current.delete(id);
      }
    });
    
    // 完了したTODOを通知済みリストから削除
    todos.forEach(todo => {
      if (todo.completed && lastNotifiedTodos.current.has(todo.id)) {
        lastNotifiedTodos.current.delete(todo.id);
      }
    });
  }, []);

  // 手動で通知許可を要求
  const requestPermission = useCallback(async () => {
    if (!state.supported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        showTestNotification();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('通知許可の要求に失敗:', error);
      return false;
    }
  }, [state.supported, showTestNotification]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    updateTodos,
    requestPermission,
    showTestNotification,
    notifiedTodos: Array.from(lastNotifiedTodos.current)
  };
}