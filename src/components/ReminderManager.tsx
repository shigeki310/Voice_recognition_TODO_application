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
    debugInfo,
    scheduledReminders
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
      // 拒否されている場合の案内を削除
    }
  }, [permission, requestPermission, supported]);

  // TODOリストの変更を監視
  useEffect(() => {
    // 初期化が完了していない場合は処理をスキップ
    if (!initializationComplete.current) {
      console.log('🔄 ReminderManager: 初期化が完了していないため、処理をスキップします', {
        permission,
        supported,
        initializationComplete: initializationComplete.current
      });
      return;
    }

    // リマインダーが有効なTODOのみを抽出
    const activeTodos = todos
      .filter(t => t.reminderEnabled && !t.completed && t.reminderTime)
      .map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate.getTime(),
        dueTime: t.dueTime,
        reminderTime: t.reminderTime,
        completed: t.completed,
        reminderEnabled: t.reminderEnabled
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

    const todosHash = JSON.stringify(activeTodos);

    // 前回と同じ内容の場合は処理をスキップ
    if (todosHash === lastProcessedTodos.current) {
      console.log('🔄 ReminderManager: TODOリストに変更がないため、処理をスキップします');
      return;
    }

    lastProcessedTodos.current = todosHash;

    console.log('🔄 ReminderManager: リマインダー設定を更新します', {
      totalTodos: todos.length,
      todosWithReminders: activeTodos.length,
      permission,
      supported,
      notificationIntervalSeconds: notificationInterval / 1000,
      currentScheduledCount: scheduledCount
    });

    // 詳細なTODO情報をログ出力
    if (activeTodos.length > 0) {
      console.group('📋 リマインダー対象のTODO詳細');
      activeTodos.forEach(todo => {
        const originalTodo = todos.find(t => t.id === todo.id);
        if (originalTodo) {
          console.log(`📝 ${todo.title}`, {
            期限日: new Date(todo.dueDate).toLocaleString(),
            時刻: todo.dueTime || '未設定',
            リマインダー: `${todo.reminderTime}分前`,
            完了状態: todo.completed ? '完了' : '未完了',
            リマインダー有効: todo.reminderEnabled ? '有効' : '無効'
          });
        }
      });
      console.groupEnd();
    } else {
      console.log('📋 リマインダー対象のTODOがありません', {
        totalTodos: todos.length,
        completedTodos: todos.filter(t => t.completed).length,
        todosWithoutReminder: todos.filter(t => !t.reminderEnabled).length,
        todosWithoutReminderTime: todos.filter(t => t.reminderEnabled && !t.reminderTime).length
      });
    }

    // 通知許可がない場合は何もしない
    if (permission !== 'granted') {
      console.log('⚠️ 通知許可がないため、リマインダーをスケジュールしません', {
        currentPermission: permission,
        requiredPermission: 'granted'
      });
      return;
    }

    // 既存のリマインダーをすべてキャンセル
    console.log('🧹 既存のリマインダーをクリアします', {
      currentScheduledCount: scheduledCount
    });
    cancelAllReminders();

    // 有効なリマインダーをスケジュール
    const now = new Date();
    console.log('⏰ リマインダーのスケジューリングを開始します', {
      現在時刻: now.toLocaleString(),
      対象TODO数: activeTodos.length
    });

    let successCount = 0;
    let errorCount = 0;
    const schedulingResults: any[] = [];

    activeTodos.forEach(todoData => {
      const todo = todos.find(t => t.id === todoData.id);
      if (!todo) {
        console.warn(`⚠️ TODOが見つかりません: ${todoData.id}`);
        return;
      }

      console.log(`📅 スケジューリング中: ${todo.title}`);
      
      const timeoutId = scheduleReminder(todo);
      
      const result = {
        title: todo.title,
        success: !!timeoutId,
        reminderTime: todo.reminderTime,
        dueDate: todo.dueDate.toLocaleString(),
        dueTime: todo.dueTime
      };
      
      schedulingResults.push(result);
      
      if (timeoutId) {
        successCount++;
        console.log(`✅ スケジュール成功: ${todo.title}`);
      } else {
        errorCount++;
        console.log(`❌ スケジュール失敗: ${todo.title}`);
      }
    });

    console.log(`📊 リマインダー管理結果:`, {
      成功: successCount,
      失敗: errorCount,
      合計: activeTodos.length,
      現在のスケジュール数: scheduledCount
    });

    // 詳細な結果をテーブル形式で表示
    if (schedulingResults.length > 0) {
      console.table(schedulingResults);
    }

    // クリーンアップ
    return () => {
      console.log('🧹 ReminderManager: クリーンアップを実行');
      cancelAllReminders();
    };
  }, [todos, scheduleReminder, cancelAllReminders, permission, notificationInterval, scheduledCount]);

  // 開発モード用のデバッグ情報表示
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const reminderTodos = todos.filter(t => t.reminderEnabled && !t.completed);
      
      const debugData = {
        permission,
        supported,
        scheduledCount,
        todosWithReminders: reminderTodos.length,
        initializationComplete: initializationComplete.current,
        debugInfo,
        scheduledReminders: scheduledReminders.map(r => ({
          title: r.todoTitle,
          reminderTime: r.reminderTime.toLocaleString(),
          minutesUntil: Math.round((r.reminderTime.getTime() - Date.now()) / 1000 / 60)
        }))
      };
      
      console.log('🔧 ReminderManager Debug Info:', debugData);

      // デバッグ情報をグローバルに公開（開発時のみ）
      (window as any).reminderDebug = {
        ...debugData,
        showDebugInfo,
        todos: reminderTodos,
        allTodos: todos
      };
    }
  }, [permission, supported, scheduledCount, todos, debugInfo, showDebugInfo, scheduledReminders]);

  // このコンポーネントは何も表示しない
  return null;
}