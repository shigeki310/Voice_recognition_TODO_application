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
    notificationInterval,
    showDebugInfo,
    debugInfo
  } = useNotifications();

  const lastProcessedTodos = useRef<string>('');
  const permissionRequested = useRef(false);
  const initializationComplete = useRef(false);

  // 通知許可を要求（初回のみ）
  useEffect(() => {
    if (permission === 'default' && supported && !permissionRequested.current) {
      permissionRequested.current = true;
      console.log('🔔 ReminderManager: 通知許可を要求します');
      
      // より詳細な説明を表示
      const userConfirm = window.confirm(
        '🔔 Voice TODO App - 通知許可のお願い\n\n' +
        'タスクのリマインダー通知を受け取るには、ブラウザの通知許可が必要です。\n\n' +
        '機能:\n' +
        '• タスクの期限前にリマインダー通知\n' +
        '• 10分前〜1週間前まで設定可能\n' +
        '• 重要なタスクを見逃し防止\n\n' +
        '通知を許可しますか？\n' +
        '（後でブラウザの設定からも変更できます）'
      );
      
      if (userConfirm) {
        console.log('ユーザーが通知許可に同意しました');
        requestPermission().then(granted => {
          if (granted) {
            console.log('✅ 通知許可が取得されました - リマインダー管理を開始します');
            initializationComplete.current = true;
          } else {
            console.warn('❌ 通知許可が拒否されました');
            alert(
              '❌ 通知許可が拒否されました\n\n' +
              'リマインダー機能を使用するには:\n' +
              '1. ブラウザのアドレスバー左側の🔒アイコンをクリック\n' +
              '2. 「通知」を「許可」に変更\n' +
              '3. ページを再読み込み\n\n' +
              'または、ブラウザの設定から通知を許可してください。'
            );
          }
        });
      } else {
        console.log('ユーザーが通知許可をキャンセルしました');
        alert(
          'ℹ️ 通知許可がキャンセルされました\n\n' +
          'リマインダー機能は無効になります。\n' +
          '後で有効にするには、ブラウザの設定で通知を許可してください。'
        );
      }
    } else if (permission === 'granted') {
      console.log('✅ 通知許可は既に取得済みです');
      initializationComplete.current = true;
    } else if (permission === 'denied') {
      console.warn('❌ 通知許可が拒否されています');
      // 拒否されている場合の案内
      if (!permissionRequested.current) {
        permissionRequested.current = true;
        setTimeout(() => {
          alert(
            '⚠️ 通知が無効になっています\n\n' +
            'リマインダー機能を使用するには:\n' +
            '1. ブラウザのアドレスバー左側のアイコンをクリック\n' +
            '2. 「通知」を「許可」に変更\n' +
            '3. ページを再読み込み\n\n' +
            'または、ブラウザの設定から通知を許可してください。'
          );
        }, 2000);
      }
    }
  }, [permission, requestPermission, supported]);

  // TODOリストの変更を監視
  useEffect(() => {
    // 初期化が完了していない場合は処理をスキップ
    if (!initializationComplete.current) {
      console.log('ReminderManager: 初期化が完了していないため、処理をスキップします', {
        permission,
        supported,
        initializationComplete: initializationComplete.current
      });
      return;
    }

    // TODOリストのハッシュを作成して変更を検出
    const activeTodos = todos
      .filter(t => t.reminderEnabled && !t.completed)
      .map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate.getTime(),
        dueTime: t.dueTime,
        reminderTime: t.reminderTime,
        completed: t.completed
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

    const todosHash = JSON.stringify(activeTodos);

    // 前回と同じ内容の場合は処理をスキップ
    if (todosHash === lastProcessedTodos.current) {
      return;
    }

    lastProcessedTodos.current = todosHash;

    console.log('🔄 ReminderManager: リマインダー設定を更新します', {
      totalTodos: todos.length,
      todosWithReminders: activeTodos.length,
      permission,
      supported,
      notificationIntervalMinutes: notificationInterval / (1000 * 60),
      debugInfo
    });

    // 通知許可がない場合は何もしない
    if (permission !== 'granted') {
      console.log('⚠️ 通知許可がないため、リマインダーをスケジュールしません', {
        currentPermission: permission,
        requiredPermission: 'granted'
      });
      return;
    }

    // 既存のリマインダーをすべてキャンセル
    console.log('🧹 既存のリマインダーをクリアします');
    cancelAllReminders();

    // 有効なリマインダーをスケジュール
    const now = new Date();
    const validReminders = activeTodos.filter(todo => {
      if (!todo.reminderTime) {
        console.log(`⚠️ リマインダー時間が設定されていません: ${todo.title}`);
        return false;
      }

      // リマインダー時刻を計算
      let reminderTime: Date;

      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':').map(Number);
        const dueDateTime = new Date(todo.dueDate);
        dueDateTime.setHours(hours, minutes, 0, 0);
        reminderTime = new Date(dueDateTime.getTime() - (todo.reminderTime * 60 * 1000));
      } else {
        reminderTime = new Date(todo.dueDate - (todo.reminderTime * 60 * 1000));
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      if (timeUntilReminder <= 0) {
        console.log(`⏰ リマインダー時刻が過去です: ${todo.title} (${Math.abs(timeUntilReminder / 1000 / 60).toFixed(1)}分前)`);
        return false;
      }

      console.log(`✅ 有効なリマインダー: ${todo.title} (${Math.round(timeUntilReminder / 1000 / 60)}分後)`);
      return true;
    });

    console.log(`📋 スケジュール対象のリマインダー: ${validReminders.length}件`);

    if (validReminders.length === 0) {
      console.log('スケジュールするリマインダーがありません');
      return;
    }

    let successCount = 0;
    validReminders.forEach(todoData => {
      const todo = todos.find(t => t.id === todoData.id);
      if (!todo) return;

      const timeoutId = scheduleReminder(todo);
      if (timeoutId) {
        successCount++;
      }
    });

    console.log(`📊 リマインダー管理結果: ${successCount}/${validReminders.length}件がスケジュールされました`);

    // クリーンアップ
    return () => {
      console.log('🧹 ReminderManager: クリーンアップを実行');
      cancelAllReminders();
    };
  }, [todos, scheduleReminder, cancelAllReminders, permission, notificationInterval]);

  // 開発モード用のデバッグ情報表示
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugData = {
        permission,
        supported,
        scheduledCount,
        todosWithReminders: todos.filter(t => t.reminderEnabled && !t.completed).length,
        initializationComplete: initializationComplete.current,
        debugInfo
      };
      
      console.log('🔧 ReminderManager Debug Info:', debugData);

      // デバッグ情報をグローバルに公開（開発時のみ）
      (window as any).reminderDebug = {
        ...debugData,
        showDebugInfo,
        todos: todos.filter(t => t.reminderEnabled && !t.completed)
      };
    }
  }, [permission, supported, scheduledCount, todos, debugInfo, showDebugInfo]);

  // このコンポーネントは何も表示しない
  return null;
}