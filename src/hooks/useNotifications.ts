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
    schedulingAttempts: number;
    schedulingErrors: string[];
    browserInfo: string;
    osNotificationSettings?: string;
    actualDisplayCount: number;
    failedDisplayCount: number;
  };
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
    supported: false,
    debugInfo: {
      permissionRequestCount: 0,
      notificationAttempts: 0,
      successfulNotifications: 0,
      schedulingAttempts: 0,
      schedulingErrors: [],
      browserInfo: navigator.userAgent,
      actualDisplayCount: 0,
      failedDisplayCount: 0
    }
  });

  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const lastNotificationTime = useRef<Record<string, number>>({});
  const initializationRef = useRef(false);
  const notificationRefs = useRef<Map<string, Notification>>(new Map());

  // 通知間隔を30秒に短縮（デバッグ用）
  const NOTIFICATION_INTERVAL = 30 * 1000; // 30秒

  // 詳細なデバッグログ関数
  const debugLog = useCallback((message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔔 [${timestamp}] ${message}`, data || '');
  }, []);

  // エラーログ関数
  const errorLog = useCallback((message: string, error?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`❌ [${timestamp}] ${message}`, error || '');
    
    setState(prev => ({
      ...prev,
      debugInfo: {
        ...prev.debugInfo,
        lastError: message,
        schedulingErrors: [...prev.debugInfo.schedulingErrors.slice(-4), `${timestamp}: ${message}`]
      }
    }));
  }, []);

  // 通知が実際に表示されているかを検証する関数
  const verifyNotificationDisplay = useCallback((notification: Notification, title: string) => {
    let displayVerified = false;
    let timeoutId: number;

    // 通知の表示状態を監視
    const checkDisplayStatus = () => {
      // ブラウザによっては、通知が表示されない場合でもonshowが呼ばれることがある
      // より確実な検証のため、複数の方法で確認
      
      // 方法1: 通知オブジェクトの状態確認
      try {
        // 通知が閉じられていない場合は表示されている可能性が高い
        if (notification) {
          debugLog('✅ 通知オブジェクトは有効です', { title });
          displayVerified = true;
        }
      } catch (error) {
        debugLog('⚠️ 通知オブジェクトの状態確認でエラー', { title, error });
      }

      // 方法2: ユーザーの操作を促すフォールバック
      if (!displayVerified) {
        setTimeout(() => {
          debugLog('⚠️ 通知が表示されていない可能性があります - フォールバック通知を試行', { title });
          
          // より強制的な通知を試行
          try {
            const fallbackNotification = new Notification(`🔔 ${title}`, {
              body: '前の通知が表示されなかった可能性があります',
              icon: '/vite.svg',
              tag: `fallback-${Date.now()}`,
              requireInteraction: true,
              silent: false,
              renotify: true,
              timestamp: Date.now()
            });

            fallbackNotification.onshow = () => {
              debugLog('✅ フォールバック通知が表示されました', { title });
              setState(prev => ({
                ...prev,
                debugInfo: {
                  ...prev.debugInfo,
                  actualDisplayCount: prev.debugInfo.actualDisplayCount + 1
                }
              }));
            };

            fallbackNotification.onerror = () => {
              debugLog('❌ フォールバック通知も失敗しました', { title });
              setState(prev => ({
                ...prev,
                debugInfo: {
                  ...prev.debugInfo,
                  failedDisplayCount: prev.debugInfo.failedDisplayCount + 1
                }
              }));
            };

            // フォールバック通知も自動で閉じる
            setTimeout(() => {
              fallbackNotification.close();
            }, 15000);

          } catch (error) {
            errorLog('フォールバック通知の作成に失敗', error);
          }
        }, 3000); // 3秒後にフォールバック
      }
    };

    // 2秒後に表示状態をチェック
    timeoutId = window.setTimeout(checkDisplayStatus, 2000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [debugLog, errorLog]);

  // 初期化処理
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    debugLog('🚀 通知システムを初期化中...');

    // ブラウザサポートチェック
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'denied';

    debugLog('ブラウザ環境チェック', {
      supported,
      permission,
      userAgent: navigator.userAgent.substring(0, 100),
      protocol: window.location.protocol,
      isSecureContext: window.isSecureContext,
      hostname: window.location.hostname,
      platform: navigator.platform,
      language: navigator.language
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
      errorLog('このブラウザは通知機能をサポートしていません');
      return;
    }

    if (permission === 'granted') {
      debugLog('✅ 通知許可は既に取得済みです');
      // 初期化完了後にテスト通知を送信
      setTimeout(() => {
        testBrowserNotification();
      }, 1000);
    } else {
      debugLog('⚠️ 通知許可が必要です', { currentPermission: permission });
    }
  }, [debugLog, errorLog]);

  // ブラウザの通知機能をテスト
  const testBrowserNotification = useCallback(() => {
    debugLog('🧪 ブラウザ通知機能をテスト中...');
    
    // 直接ブラウザの許可状態をチェック
    const currentPermission = Notification.permission;
    if (currentPermission !== 'granted') {
      errorLog('通知許可がないため、テスト通知をスキップします', { permission: currentPermission });
      return;
    }
    
    try {
      // より確実な通知設定
      const testNotification = new Notification('🔔 Voice TODO App - システムテスト', {
        body: '通知システムが正常に動作しています。この通知が見えていますか？',
        icon: '/vite.svg',
        tag: 'system-test',
        requireInteraction: true, // ユーザーの操作が必要
        silent: false, // 音を鳴らす
        renotify: true, // 同じtagでも再通知
        timestamp: Date.now(),
        // 追加のオプション
        badge: '/vite.svg',
        dir: 'auto',
        lang: 'ja'
      });

      debugLog('✅ テスト通知オブジェクトを作成しました');

      // 表示検証を開始
      const cleanupVerification = verifyNotificationDisplay(testNotification, 'システムテスト');

      testNotification.onshow = () => {
        debugLog('🎉 テスト通知が表示されました!');
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            successfulNotifications: prev.debugInfo.successfulNotifications + 1,
            actualDisplayCount: prev.debugInfo.actualDisplayCount + 1,
            lastNotificationTime: new Date().toLocaleString(),
            lastError: undefined
          }
        }));
      };

      testNotification.onerror = (error) => {
        errorLog('テスト通知でエラーが発生しました', error);
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            failedDisplayCount: prev.debugInfo.failedDisplayCount + 1
          }
        }));
      };

      testNotification.onclick = () => {
        debugLog('テスト通知がクリックされました');
        window.focus();
        testNotification.close();
        if (cleanupVerification) cleanupVerification();
      };

      testNotification.onclose = () => {
        debugLog('テスト通知が閉じられました');
        if (cleanupVerification) cleanupVerification();
      };

      // 通知を参照として保存
      notificationRefs.current.set('system-test', testNotification);

      // 10秒後に自動で閉じる
      setTimeout(() => {
        testNotification.close();
        notificationRefs.current.delete('system-test');
        debugLog('テスト通知を自動で閉じました');
        if (cleanupVerification) cleanupVerification();
      }, 10000);

    } catch (error) {
      errorLog('テスト通知の作成に失敗しました', error);
      setState(prev => ({
        ...prev,
        debugInfo: {
          ...prev.debugInfo,
          failedDisplayCount: prev.debugInfo.failedDisplayCount + 1
        }
      }));
    }
  }, [debugLog, errorLog, verifyNotificationDisplay]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.supported) {
      errorLog('通知機能がサポートされていません');
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
        errorLog('通知許可が拒否されました', permission);
        return false;
      }
    } catch (error) {
      errorLog('通知許可の取得に失敗しました', error);
      return false;
    }
  }, [state.supported, state.permission, state.debugInfo.permissionRequestCount, debugLog, errorLog, testBrowserNotification]);

  const showNotification = useCallback((title: string, options?: NotificationOptions, todoId?: string) => {
    setState(prev => ({
      ...prev,
      debugInfo: {
        ...prev.debugInfo,
        notificationAttempts: prev.debugInfo.notificationAttempts + 1
      }
    }));

    debugLog('🔔 通知表示を試行中', {
      title,
      todoId,
      supported: state.supported,
      permission: state.permission,
      attemptNumber: state.debugInfo.notificationAttempts + 1
    });

    if (!state.supported) {
      errorLog('通知機能がサポートされていません');
      return null;
    }

    if (state.permission !== 'granted') {
      errorLog(`通知許可が取得されていません。現在の状態: ${state.permission}`);
      return null;
    }

    // 同じTODOの通知間隔チェック
    const now = Date.now();
    if (todoId && lastNotificationTime.current[todoId]) {
      const timeSinceLastNotification = now - lastNotificationTime.current[todoId];
      if (timeSinceLastNotification < NOTIFICATION_INTERVAL) {
        const message = `通知間隔が短すぎるため、通知をスキップしました（前回から${Math.round(timeSinceLastNotification / 1000)}秒経過）`;
        debugLog('⏭️ ' + message);
        return null;
      }
    }

    try {
      // より確実な通知設定
      const notificationOptions = {
        icon: '/vite.svg',
        badge: '/vite.svg',
        requireInteraction: true, // ユーザーの操作を要求
        silent: false, // 音を鳴らす
        renotify: true, // 同じtagでも再通知
        timestamp: Date.now(),
        dir: 'auto' as NotificationDirection,
        lang: 'ja',
        ...options
      };

      debugLog('通知オブジェクトを作成中', {
        title,
        options: notificationOptions
      });

      const notification = new Notification(title, notificationOptions);

      debugLog('✅ 通知オブジェクトが作成されました');

      // 表示検証を開始
      const cleanupVerification = verifyNotificationDisplay(notification, title);

      // 通知イベントハンドラー
      notification.onshow = () => {
        debugLog('🎉 通知が表示されました!', title);
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            successfulNotifications: prev.debugInfo.successfulNotifications + 1,
            actualDisplayCount: prev.debugInfo.actualDisplayCount + 1,
            lastNotificationTime: new Date().toLocaleString(),
            lastError: undefined
          }
        }));
        
        if (todoId) {
          lastNotificationTime.current[todoId] = now;
        }
      };

      notification.onerror = (error) => {
        errorLog('通知表示エラー', error);
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            failedDisplayCount: prev.debugInfo.failedDisplayCount + 1
          }
        }));
      };

      notification.onclick = () => {
        debugLog('通知がクリックされました', title);
        window.focus();
        notification.close();
        if (todoId) {
          notificationRefs.current.delete(todoId);
        }
        if (cleanupVerification) cleanupVerification();
      };

      notification.onclose = () => {
        debugLog('通知が閉じられました', title);
        if (todoId) {
          notificationRefs.current.delete(todoId);
        }
        if (cleanupVerification) cleanupVerification();
      };

      // 通知を参照として保存
      if (todoId) {
        notificationRefs.current.set(todoId, notification);
      }

      // 自動で閉じる（30秒後）
      setTimeout(() => {
        notification.close();
        if (todoId) {
          notificationRefs.current.delete(todoId);
        }
        debugLog('通知を自動で閉じました', title);
        if (cleanupVerification) cleanupVerification();
      }, 30000);

      return notification;
    } catch (error) {
      errorLog(`通知の表示に失敗しました: ${error}`, error);
      setState(prev => ({
        ...prev,
        debugInfo: {
          ...prev.debugInfo,
          failedDisplayCount: prev.debugInfo.failedDisplayCount + 1
        }
      }));
      return null;
    }
  }, [state.permission, state.supported, state.debugInfo.notificationAttempts, NOTIFICATION_INTERVAL, debugLog, errorLog, verifyNotificationDisplay]);

  const scheduleReminder = useCallback((todo: Todo) => {
    setState(prev => ({
      ...prev,
      debugInfo: {
        ...prev.debugInfo,
        schedulingAttempts: prev.debugInfo.schedulingAttempts + 1
      }
    }));

    debugLog('📅 リマインダーのスケジューリングを開始', {
      todoId: todo.id,
      title: todo.title,
      reminderEnabled: todo.reminderEnabled,
      reminderTime: todo.reminderTime,
      dueDate: todo.dueDate.toLocaleString(),
      dueTime: todo.dueTime,
      completed: todo.completed,
      attemptNumber: state.debugInfo.schedulingAttempts + 1
    });

    if (!todo.reminderEnabled) {
      debugLog('⚠️ リマインダーが無効です', { todoId: todo.id, title: todo.title });
      return null;
    }

    if (!todo.reminderTime) {
      errorLog('リマインダー時間が設定されていません', { todoId: todo.id, title: todo.title });
      return null;
    }

    if (todo.completed) {
      debugLog('⚠️ 完了済みのタスクです', { todoId: todo.id, title: todo.title });
      return null;
    }

    const now = new Date();
    let reminderTime: Date;

    try {
      // 時刻が設定されている場合は、その時刻から計算
      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          errorLog('無効な時刻形式です', { 
            todoId: todo.id, 
            title: todo.title, 
            dueTime: todo.dueTime 
          });
          return null;
        }
        
        const dueDateTime = new Date(todo.dueDate);
        dueDateTime.setHours(hours, minutes, 0, 0);
        reminderTime = new Date(dueDateTime.getTime() - (todo.reminderTime * 60 * 1000));
        
        debugLog('時刻指定ありのリマインダー時刻を計算', {
          dueDateTime: dueDateTime.toLocaleString(),
          reminderMinutes: todo.reminderTime,
          calculatedReminderTime: reminderTime.toLocaleString()
        });
      } else {
        // 時刻が設定されていない場合は、日付の開始時刻から計算
        const dueDateStart = new Date(todo.dueDate);
        dueDateStart.setHours(0, 0, 0, 0);
        reminderTime = new Date(dueDateStart.getTime() - (todo.reminderTime * 60 * 1000));
        
        debugLog('時刻指定なしのリマインダー時刻を計算', {
          dueDateStart: dueDateStart.toLocaleString(),
          reminderMinutes: todo.reminderTime,
          calculatedReminderTime: reminderTime.toLocaleString()
        });
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      debugLog('リマインダー時刻の詳細', {
        todo: todo.title,
        now: now.toLocaleString(),
        reminderTime: reminderTime.toLocaleString(),
        timeUntilReminderMs: timeUntilReminder,
        timeUntilReminderMinutes: Math.round(timeUntilReminder / 1000 / 60),
        timeUntilReminderHours: Math.round(timeUntilReminder / 1000 / 60 / 60)
      });

      if (timeUntilReminder <= 0) {
        const pastByMinutes = Math.abs(timeUntilReminder / 1000 / 60);
        debugLog('⚠️ リマインダー時刻が既に過ぎています', {
          todo: todo.title,
          reminderTime: reminderTime.toLocaleString(),
          now: now.toLocaleString(),
          pastByMinutes: pastByMinutes.toFixed(1)
        });
        
        // 過去の時刻でも5分以内なら即座に通知
        if (pastByMinutes <= 5) {
          debugLog('🔔 5分以内の過去時刻のため、即座に通知します');
          setTimeout(() => {
            showNotification(`📋 リマインダー: ${todo.title}`, {
              body: todo.description || '期限が近づいています',
              tag: `reminder-${todo.id}`,
              icon: '/vite.svg',
              requireInteraction: true,
            }, todo.id);
          }, 1000);
        }
        
        return null;
      }
      
      debugLog('⏰ リマインダーをスケジュールします', {
        todo: todo.title,
        reminderTime: reminderTime.toLocaleString(),
        minutesUntil: Math.round(timeUntilReminder / 1000 / 60),
        hoursUntil: Math.round(timeUntilReminder / 1000 / 60 / 60)
      });

      const timeoutId = window.setTimeout(() => {
        debugLog('🔔 スケジュールされたリマインダー通知を表示します', {
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
        reminderTime,
        todoTitle: todo.title
      };

      setScheduledReminders(prev => [
        ...prev.filter(reminder => reminder.todoId !== todo.id),
        newReminder
      ]);

      debugLog('✅ リマインダーがスケジュールされました', {
        todoId: todo.id,
        todoTitle: todo.title,
        timeoutId,
        reminderTime: reminderTime.toLocaleString(),
        minutesUntil: Math.round(timeUntilReminder / 1000 / 60)
      });

      return timeoutId;
    } catch (error) {
      errorLog('リマインダーのスケジューリングに失敗しました', {
        error,
        todoId: todo.id,
        title: todo.title,
        dueDate: todo.dueDate,
        dueTime: todo.dueTime,
        reminderTime: todo.reminderTime
      });
      return null;
    }
  }, [showNotification, debugLog, errorLog, state.debugInfo.schedulingAttempts]);

  const cancelReminder = useCallback((todoId: string) => {
    const reminder = scheduledReminders.find(r => r.todoId === todoId);
    if (reminder) {
      clearTimeout(reminder.timeoutId);
      setScheduledReminders(prev => 
        prev.filter(r => r.todoId !== todoId)
      );
      debugLog('❌ リマインダーをキャンセルしました', {
        todoId,
        todoTitle: reminder.todoTitle,
        timeoutId: reminder.timeoutId
      });
    }

    // 表示中の通知も閉じる
    const notification = notificationRefs.current.get(todoId);
    if (notification) {
      notification.close();
      notificationRefs.current.delete(todoId);
      debugLog('🔕 表示中の通知を閉じました', { todoId });
    }
  }, [scheduledReminders, debugLog]);

  const cancelAllReminders = useCallback(() => {
    if (scheduledReminders.length > 0) {
      debugLog(`🧹 ${scheduledReminders.length}件のリマインダーをキャンセルします`, {
        reminders: scheduledReminders.map(r => ({
          todoId: r.todoId,
          title: r.todoTitle,
          reminderTime: r.reminderTime.toLocaleString()
        }))
      });
      
      scheduledReminders.forEach(reminder => {
        clearTimeout(reminder.timeoutId);
      });
      setScheduledReminders([]);
      
      debugLog(`✅ ${scheduledReminders.length}件のリマインダーをキャンセルしました`);
    } else {
      debugLog('キャンセルするリマインダーがありません');
    }

    // 表示中の通知もすべて閉じる
    notificationRefs.current.forEach((notification, todoId) => {
      notification.close();
      debugLog('🔕 表示中の通知を閉じました', { todoId });
    });
    notificationRefs.current.clear();
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
      errorLog(message);
      alert(`${message}\n\n現在の許可状態: ${state.permission}\n\nブラウザの設定で通知を許可してください。`);
      return;
    }
    
    // テスト通知は間隔制限を無視
    try {
      const notification = new Notification(`🧪 テスト通知: ${todo.title}`, {
        body: todo.description || 'これはテスト通知です。この通知が見えていますか？',
        tag: `test-${todo.id}`,
        icon: '/vite.svg',
        requireInteraction: true,
        silent: false,
        renotify: true,
        timestamp: Date.now()
      });

      // 表示検証を開始
      const cleanupVerification = verifyNotificationDisplay(notification, `テスト: ${todo.title}`);

      notification.onshow = () => {
        debugLog('✅ テスト通知が表示されました');
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            actualDisplayCount: prev.debugInfo.actualDisplayCount + 1
          }
        }));
      };

      notification.onerror = (error) => {
        errorLog('テスト通知でエラーが発生しました', error);
        setState(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            failedDisplayCount: prev.debugInfo.failedDisplayCount + 1
          }
        }));
      };

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (cleanupVerification) cleanupVerification();
      };

      notification.onclose = () => {
        if (cleanupVerification) cleanupVerification();
      };

      setTimeout(() => {
        notification.close();
        if (cleanupVerification) cleanupVerification();
      }, 8000);
    } catch (error) {
      errorLog('テスト通知の表示に失敗しました', error);
      alert(`テスト通知の表示に失敗しました: ${error}`);
    }
  }, [state.permission, state.supported, debugLog, errorLog, verifyNotificationDisplay]);

  // デバッグ情報を表示する関数
  const showDebugInfo = useCallback(() => {
    const info = {
      '🔧 システム情報': {
        通知サポート: state.supported ? '✅ サポート済み' : '❌ 未サポート',
        通知許可: state.permission,
        ブラウザ: navigator.userAgent.split(' ').slice(-2).join(' '),
        プロトコル: window.location.protocol,
        セキュアコンテキスト: window.isSecureContext ? '✅' : '❌',
        ホスト名: window.location.hostname,
        プラットフォーム: navigator.platform,
        言語: navigator.language
      },
      '📊 統計情報': {
        許可要求回数: state.debugInfo.permissionRequestCount,
        通知試行回数: state.debugInfo.notificationAttempts,
        成功した通知: state.debugInfo.successfulNotifications,
        実際に表示された通知: state.debugInfo.actualDisplayCount,
        表示に失敗した通知: state.debugInfo.failedDisplayCount,
        スケジューリング試行: state.debugInfo.schedulingAttempts,
        スケジュール済みリマインダー: scheduledReminders.length,
        通知間隔: `${NOTIFICATION_INTERVAL / 1000}秒`
      },
      '🕐 時刻情報': {
        現在時刻: new Date().toLocaleString(),
        最後の通知時刻: state.debugInfo.lastNotificationTime || '未実行',
        最後のエラー: state.debugInfo.lastError || 'なし'
      },
      '📋 スケジュール詳細': scheduledReminders.length > 0 ? 
        scheduledReminders.map(r => ({
          タスク: r.todoTitle,
          リマインダー時刻: r.reminderTime.toLocaleString(),
          残り時間: `${Math.round((r.reminderTime.getTime() - Date.now()) / 1000 / 60)}分`
        })) : ['スケジュールされたリマインダーはありません']
    };

    console.group('🔔 通知システム デバッグ情報');
    Object.entries(info).forEach(([category, data]) => {
      console.group(category);
      console.table(data);
      console.groupEnd();
    });
    console.groupEnd();

    // エラー履歴も表示
    if (state.debugInfo.schedulingErrors.length > 0) {
      console.group('❌ エラー履歴');
      state.debugInfo.schedulingErrors.forEach(error => console.log(error));
      console.groupEnd();
    }

    const summary = `通知システム デバッグ情報:\n\n` +
      `サポート: ${state.supported ? '✅' : '❌'}\n` +
      `許可: ${state.permission}\n` +
      `スケジュール済み: ${scheduledReminders.length}件\n` +
      `成功した通知: ${state.debugInfo.successfulNotifications}件\n` +
      `実際に表示: ${state.debugInfo.actualDisplayCount}件\n` +
      `表示失敗: ${state.debugInfo.failedDisplayCount}件\n` +
      `最後のエラー: ${state.debugInfo.lastError || 'なし'}\n\n` +
      `⚠️ 通知が表示されない場合:\n` +
      `1. ブラウザの通知設定を確認\n` +
      `2. OSの通知設定を確認\n` +
      `3. 集中モード/おやすみモードを確認\n` +
      `4. ブラウザを再起動\n\n` +
      `詳細はコンソールをご確認ください。`;

    alert(summary);
  }, [state, scheduledReminders, NOTIFICATION_INTERVAL]);

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