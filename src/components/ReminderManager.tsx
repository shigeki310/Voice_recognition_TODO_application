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
  const initializationComplete = useRef(false);

  // 通知許可を要求（初回のみ）
  useEffect(() => {
    if (permission === 'default' && supported && !permissionRequested.current) {
      permissionRequested.current = true;
      console.log('🔔 通知許可を要求します');
      
      // ユーザーに分かりやすい説明を表示
      const userConfirm = window.confirm(
        'Voice TODO Appからリマインダー通知を送信します。\n' +
        'タスクの期限前に通知を受け取るには、ブラウザの通知許可が必要です。\n\n' +
        '通知を許可しますか？'
      );
      
      if (userConfirm) {
        requestPermission().then(granted => {
          if (granted) {
            console.log('✅ 通知許可が取得されました - リマインダーを管理します');
            initializationComplete.current = true;
          } else {
            console.warn('❌ 通知許可が拒否されました');
            alert('通知が拒否されました。リマインダー機能を使用するには、ブラウザの設定で通知を許可してください。');
          }
        });
      } else {
        console.log('ユーザーが通知許可をキャンセルしました');
      }
    } else if (permission === 'granted') {
      initializationComplete.current = true;
    }
  }, [permission, requestPermission, supported]);

  // TODOリストの変更を監視（不要な再処理を防ぐ）
  useEffect(() => {
    // 初期化が完了していない場合は処理をスキップ
    if (!initializationComplete.current) {
      console.log('ReminderManager: 初期化が完了していないため、処理をスキップします');
      return;
    }

    // TODOリストのハッシュを作成して変更を検出
    const todosHash = JSON.stringify(
      todos
        .filter(t => t.reminderEnabled && !t.completed)
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

    console.log('🔄 ReminderManager: リマインダー設定を更新します', {
      totalTodos: todos.length,
      todosWithReminders: todos.filter(t => t.reminderEnabled && !t.completed).length,
      permission,
      supported,
      notificationIntervalMinutes: notificationInterval / (1000 * 60)
    });

    // 通知許可がない場合は何もしない
    if (permission !== 'granted') {
      console.log('⚠️ 通知許可がないため、リマインダーをスケジュールしません');
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

    console.log(`📋 アクティブなリマインダー: ${activeReminders.length}件`);

    if (activeReminders.length === 0) {
      console.log('スケジュールするリマインダーがありません');
      return;
    }

    let successCount = 0;
    activeReminders.forEach(todo => {
      const timeoutId = scheduleReminder(todo);
      if (timeoutId) {
        successCount++;
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
        console.log(`✅ リマインダーをスケジュールしました: ${todo.title} (${Math.round(timeUntilReminder / 1000 / 60)}分後)`);
      }
    });

    console.log(`📊 リマインダー管理結果: ${successCount}/${activeReminders.length}件がスケジュールされました`);

    // クリーンアップ
    return () => {
      console.log('🧹 ReminderManager: クリーンアップを実行');
      cancelAllReminders();
    };
  }, [todos, scheduleReminder, cancelAllReminders, permission, notificationInterval, initializationComplete.current]);

  // 開発モード用のデバッグ情報表示
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 ReminderManager Debug Info:', {
        permission,
        supported,
        scheduledCount,
        todosWithReminders: todos.filter(t => t.reminderEnabled && !t.completed).length,
        initializationComplete: initializationComplete.current
      });
    }
  }, [permission, supported, scheduledCount, todos]);

  // このコンポーネントは何も表示しない
  return null;
}