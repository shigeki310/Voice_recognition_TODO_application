import { useState, useEffect, useCallback, useRef } from 'react';
import { Todo } from '../types/todo';

interface NotificationState {
  permission: NotificationPermission;
  supported: boolean;
  debugInfo: {
    lastError?: string;
    lastNotificationTime?: string;
    permissionRequestCount: number;
    notificationAttempts: number;
    successfulNotifications: number;
  };
}

interface ScheduledReminder {
  todoId: string;
  timeoutId: number;
  scheduledTime: Date;
  reminderTime: Date;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    supported: false,
    debugInfo: {
      permissionRequestCount: 0,
      notificationAttempts: 0,
      successfulNotifications: 0
    }
  });

  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const lastNotificationTime = useRef<Record<string, number>>({});
  const initializationRef = useRef(false);

  // 通知間隔を1分（60000ミリ秒）に短縮（テスト用）
  const NOTIFICATION_INTERVAL = 1 * 60 * 1000; // 1分

  // 詳細なデバッグログ関数
  const debugLog = useCallback((message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔔 [${timestamp}] ${message}`, data || '');
  }, []);

  // 初期化処理
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    debugLog('通知システムを初期化中...');

    // ブラウザサポートチェック
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'denied';

    debugLog('ブラウザ環境チェック', {
      supported,
      permission,
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      isSecureContext: window.isSecureContext
    });

    setState(prev => ({
      ...prev,
      permission,
      supported,
      debugInfo: {
        ...prev.debugInfo,
        lastError: supported ? undefined : 'ブラウザが通知をサポートしていません'
      }
    }));

    if (!supported) {
      debugLog('❌ このブラウザは通知機能をサポートしていません');
      return;
    }

    if (permission === 'granted') {
      debugLog('✅ 通知許可は既に取得済みです');
      // テスト通知を送信
      setTimeout(() => {
        testBrowserNotification();
      }, 1000);
    } else {
      debugLog('⚠️ 通知許可が必要です', { currentPermission: permission });
    }
  }, []);

  // ブラウザの通知機能をテスト
  const testBrowserNotification = useCallback(() => {
    debugLog('ブラウザ通知機能をテスト中...');
    
    try {
      const testNotification = new Notification('Voice TODO App', {
        body: '通知システムが正常に動作しています',
        icon: '/vite.svg',
        tag: 'system-test',
        requireInteraction: false,
        silent: false
      });

      debugLog('✅ テスト通知を作成しました');

      testNotification.onshow = () => {
        debugLog('✅ テスト通知が表示されました');
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            successfulNotifications: prev.debugInfo.successfulNotifications + 1,
            lastNotificationTime: new Date().toLocaleString()
          }
        }));
      };

      testNotification.onerror = (error) => {
        debugLog('❌ テスト通知でエラーが発生しました', error);
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            lastError: 'テスト通知の表示に失敗しました'
          }
        }));
      };

      testNotification.onclick = () => {
        debugLog('テスト通知がクリックされました');
        testNotification.close();
      };

      // 5秒後に自動で閉じる
      setTimeout(() => {
        testNotification.close();
      }, 5000);

    } catch (error) {
      debugLog('❌ テスト通知の作成に失敗しました', error);
      setState(prev => ({
        ...prev,
        debugInfo: {
          ...prev.debugInfo,
          lastError: `テスト通知エラー: ${error}`
        }
      }));
    }
  }, [debugLog]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.supported) {
      debugLog('❌ 通知機能がサポートされていません');
      return false;
    }

    setState(prev => ({
      ...prev,
      debugInfo: {
        ...prev.debugInfo,
        permissionRequestCount: prev.debugInfo.permissionRequestCount + 1
      }
    }));

    if (state.permission === 'granted') {
      debugLog('✅ 通知許可は既に取得済みです');
      return true;
    }

    try {
      debugLog('🔔 通知許可を要求中...', {
        currentPermission: state.permission,
        requestCount: state.debugInfo.permissionRequestCount + 1
      });

      const permission = await Notification.requestPermission();
      
      debugLog('通知許可の結果', {
        newPermission: permission,
        previousPermission: state.permission
      });

      setState(prev => ({ 
        ...prev, 
        permission,
        debugInfo: {
          ...prev.debugInfo,
          lastError: permission === 'granted' ? undefined : `通知許可が拒否されました: ${permission}`
        }
      }));
      
      if (permission === 'granted') {
        debugLog('✅ 通知許可が取得されました - テスト通知を送信します');
        setTimeout(() => {
          testBrowserNotification();
        }, 500);
        return true;
      } else {
        debugLog('❌ 通知許可が拒否されました', permission);
        return false;
      }
    } catch (error) {
      debugLog('❌ 通知許可の取得に失敗しました', error);
      setState(prev => ({
        ...prev,
        debugInfo: {
          ...prev.debugInfo,
          lastError: `許可要求エラー: ${error}`
        }
      }));
      return false;
    }
  }, [state.supported, state.permission, state.debugInfo.permissionRequestCount, debugLog, testBrowserNotification]);

  const showNotification = useCallback((title: string, options?: NotificationOptions, todoId?: string) => {
    setState(prev => ({
      ...prev,
      debugInfo: {
        ...prev.debugInfo,
        notificationAttempts: prev.debugInfo.notificationAttempts + 1
      }
    }));

    debugLog('通知表示を試行中', {
      title,
      todoId,
      supported: state.supported,
      permission: state.permission,
      attemptNumber: state.debugInfo.notificationAttempts + 1
    });

    if (!state.supported) {
      const error = '通知機能がサポートされていません';
      debugLog('❌ ' + error);
      setState(prev => ({
        ...prev,
        debugInfo: { ...prev.debugInfo, lastError: error }
      }));
      return null;
    }

    if (state.permission !== 'granted') {
      const error = `通知許可が取得されていません。現在の状態: ${state.permission}`;
      debugLog('❌ ' + error);
      setState(prev => ({
        ...prev,
        debugInfo: { ...prev.debugInfo, lastError: error }
      }));
      return null;
    }

    // 同じTODOの通知間隔チェック
    const now = Date.now();
    if (todoId && lastNotificationTime.current[todoId]) {
      const timeSinceLastNotification = now - lastNotificationTime.current[todoId];
      if (timeSinceLastNotification < NOTIFICATION_INTERVAL) {
        const message = `通知間隔が短すぎるため、通知をスキップしました（前回から${Math.round(timeSinceLastNotification / 1000 / 60)}分経過）`;
        debugLog('⏭️ ' + message);
        return null;
      }
    }

    try {
      const notificationOptions = {
        icon: '/vite.svg',
        badge: '/vite.svg',
        requireInteraction: true,
        silent: false,
        timestamp: Date.now(),
        ...options
      };

      debugLog('通知オブジェクトを作成中', {
        title,
        options: notificationOptions
      });

      const notification = new Notification(title, notificationOptions);

      debugLog('✅ 通知オブジェクトが作成されました');

      // 通知イベントハンドラー
      notification.onshow = () => {
        debugLog('🎉 通知が表示されました!', title);
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            successfulNotifications: prev.debugInfo.successfulNotifications + 1,
            lastNotificationTime: new Date().toLocaleString(),
            lastError: undefined
          }
        }));
        
        if (todoId) {
          lastNotificationTime.current[todoId] = now;
        }
      };

      notification.onerror = (error) => {
        debugLog('❌ 通知表示エラー', error);
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            lastError: `通知表示エラー: ${error}`
          }
        }));
      };

      notification.onclick = () => {
        debugLog('通知がクリックされました', title);
        window.focus();
        notification.close();
      };

      notification.onclose = () => {
        debugLog('通知が閉じられました', title);
      };

      // 自動で閉じる（20秒後）
      setTimeout(() => {
        notification.close();
        debugLog('通知を自動で閉じました', title);
      }, 20000);

      return notification;
    } catch (error) {
      const errorMessage = `通知の表示に失敗しました: ${error}`;
      debugLog('❌ ' + errorMessage, error);
      setState(prev => ({
        ...prev,
        debugInfo: {
          ...prev.debugInfo,
          lastError: errorMessage
        }
      }));
      return null;
    }
  }, [state.permission, state.supported, state.debugInfo.notificationAttempts, NOTIFICATION_INTERVAL, debugLog]);

  const scheduleReminder = useCallback((todo: Todo) => {
    if (!todo.reminderEnabled || !todo.reminderTime) {
      debugLog('リマインダーが無効または時間が設定されていません', {
        title: todo.title,
        reminderEnabled: todo.reminderEnabled,
        reminderTime: todo.reminderTime
      });
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

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    debugLog('リマインダー時刻を計算', {
      todo: todo.title,
      dueDate: todo.dueDate.toLocaleString(),
      dueTime: todo.dueTime,
      reminderMinutes: todo.reminderTime,
      calculatedReminderTime: reminderTime.toLocaleString(),
      timeUntilReminderMs: timeUntilReminder,
      timeUntilReminderMinutes: Math.round(timeUntilReminder / 1000 / 60)
    });

    if (timeUntilReminder <= 0) {
      debugLog('⚠️ リマインダー時刻が既に過ぎています', {
        todo: todo.title,
        reminderTime: reminderTime.toLocaleString(),
        now: now.toLocaleString(),
        pastByMinutes: Math.abs(timeUntilReminder / 1000 / 60).toFixed(1)
      });
      return null;
    }
    
    debugLog('⏰ リマインダーをスケジュールします', {
      todo: todo.title,
      reminderTime: reminderTime.toLocaleString(),
      minutesUntil: Math.round(timeUntilReminder / 1000 / 60),
      hoursUntil: Math.round(timeUntilReminder / 1000 / 60 / 60)
    });

    const timeoutId = window.setTimeout(() => {
      debugLog('🔔 リマインダー通知を表示します', {
        todo: todo.title,
        scheduledTime: reminderTime.toLocaleString(),
        actualTime: new Date().toLocaleString()
      });
      
      showNotification(`📋 リマインダー: ${todo.title}`, {
        body: todo.description || '期限が近づいています',
        tag: `reminder-${todo.id}`,
        icon: '/vite.svg',
        requireInteraction: true,
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
      reminderTime
    };

    setScheduledReminders(prev => [
      ...prev.filter(reminder => reminder.todoId !== todo.id),
      newReminder
    ]);

    debugLog('✅ リマインダーがスケジュールされました', {
      todoId: todo.id,
      timeoutId,
      reminderTime: reminderTime.toLocaleString()
    });

    return timeoutId;
  }, [showNotification, debugLog]);

  const cancelReminder = useCallback((todoId: string) => {
    const reminder = scheduledReminders.find(r => r.todoId === todoId);
    if (reminder) {
      clearTimeout(reminder.timeoutId);
      setScheduledReminders(prev => 
        prev.filter(r => r.todoId !== todoId)
      );
      debugLog('❌ リマインダーをキャンセルしました', {
        todoId,
        timeoutId: reminder.timeoutId
      });
    }
  }, [scheduledReminders, debugLog]);

  const cancelAllReminders = useCallback(() => {
    if (scheduledReminders.length > 0) {
      scheduledReminders.forEach(reminder => {
        clearTimeout(reminder.timeoutId);
      });
      setScheduledReminders([]);
      debugLog(`❌ ${scheduledReminders.length}件のリマインダーをキャンセルしました`);
    }
  }, [scheduledReminders, debugLog]);

  // テスト用の即座通知機能
  const testNotification = useCallback((todo: Todo) => {
    debugLog('🧪 テスト通知を実行します', {
      todo: todo.title,
      permission: state.permission,
      supported: state.supported
    });
    
    if (state.permission !== 'granted') {
      const message = '通知許可が取得されていないため、テスト通知を表示できません';
      debugLog('❌ ' + message);
      alert(`${message}\n\n現在の許可状態: ${state.permission}\n\nブラウザの設定で通知を許可してください。`);
      return;
    }
    
    // テスト通知は間隔制限を無視
    try {
      const notification = new Notification(`🧪 テスト通知: ${todo.title}`, {
        body: todo.description || 'これはテスト通知です',
        tag: `test-${todo.id}`,
        icon: '/vite.svg',
        requireInteraction: false,
        timestamp: Date.now()
      });

      notification.onshow = () => {
        debugLog('✅ テスト通知が表示されました');
      };

      notification.onerror = (error) => {
        debugLog('❌ テスト通知でエラーが発生しました', error);
      };

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      debugLog('❌ テスト通知の表示に失敗しました', error);
      alert(`テスト通知の表示に失敗しました: ${error}`);
    }
  }, [state.permission, state.supported, debugLog]);

  // デバッグ情報を表示する関数
  const showDebugInfo = useCallback(() => {
    const info = {
      通知サポート: state.supported ? '✅ サポート済み' : '❌ 未サポート',
      通知許可: state.permission,
      許可要求回数: state.debugInfo.permissionRequestCount,
      通知試行回数: state.debugInfo.notificationAttempts,
      成功した通知: state.debugInfo.successfulNotifications,
      最後の通知時刻: state.debugInfo.lastNotificationTime || '未実行',
      最後のエラー: state.debugInfo.lastError || 'なし',
      スケジュール済みリマインダー: scheduledReminders.length,
      ブラウザ: navigator.userAgent,
      プロトコル: window.location.protocol,
      セキュアコンテキスト: window.isSecureContext ? '✅' : '❌'
    };

    console.table(info);
    alert(`通知システム デバッグ情報:\n\n${Object.entries(info).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
  }, [state, scheduledReminders.length]);

  return {
    ...state,
    requestPermission,
    showNotification,
    scheduleReminder,
    cancelReminder,
    cancelAllReminders,
    testNotification,
    showDebugInfo,
    scheduledCount: scheduledReminders.length,
    scheduledReminders,
    notificationInterval: NOTIFICATION_INTERVAL
  };
}