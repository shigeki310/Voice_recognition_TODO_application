import { useEffect } from 'react';
import { Todo } from '../types/todo';
import { useSimpleNotifications } from '../hooks/useSimpleNotifications';

interface SimpleReminderManagerProps {
  todos: Todo[];
  enabled?: boolean;
}

export function SimpleReminderManager({ todos, enabled = true }: SimpleReminderManagerProps) {
  const {
    supported,
    permission,
    isRunning,
    lastCheckTime,
    notificationCount,
    startMonitoring,
    stopMonitoring,
    updateTodos,
    requestPermission,
    notifiedTodos
  } = useSimpleNotifications();

  // 初期化と通知許可の要求
  useEffect(() => {
    if (!enabled) return;

    if (supported && permission === 'default') {
      console.log('🔔 シンプル通知システム: 通知許可を要求します');
      requestPermission();
    }
  }, [enabled, supported, permission, requestPermission]);

  // 監視の開始/停止
  useEffect(() => {
    if (!enabled) {
      stopMonitoring();
      return;
    }

    if (permission === 'granted' && !isRunning) {
      console.log('🚀 シンプル通知システム: 監視を開始します');
      startMonitoring(todos);
    } else if (permission !== 'granted' && isRunning) {
      console.log('⏹️ シンプル通知システム: 許可がないため監視を停止します');
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enabled, permission, isRunning, todos, startMonitoring, stopMonitoring]);

  // TODOリストの更新
  useEffect(() => {
    if (enabled && isRunning) {
      updateTodos(todos);
    }
  }, [todos, enabled, isRunning, updateTodos]);

  // 開発モード用のデバッグ情報
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugInfo = {
        supported,
        permission,
        isRunning,
        lastCheckTime,
        notificationCount,
        todosWithReminders: todos.filter(t => t.reminderEnabled && !t.completed).length,
        notifiedTodos: notifiedTodos.length
      };

      console.log('🔧 SimpleReminderManager Debug:', debugInfo);

      // グローバルデバッグ情報を公開
      (window as any).simpleReminderDebug = {
        ...debugInfo,
        todos: todos.filter(t => t.reminderEnabled && !t.completed),
        notifiedTodoIds: notifiedTodos
      };
    }
  }, [supported, permission, isRunning, lastCheckTime, notificationCount, todos, notifiedTodos]);

  // 開発モード用のUI表示
  if (process.env.NODE_ENV === 'development' && enabled) {
    return (
      <div className="fixed bottom-4 left-4 bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs max-w-xs">
        <div className="font-medium text-slate-900 mb-2">🔔 シンプル通知システム</div>
        <div className="space-y-1 text-slate-600">
          <div>サポート: {supported ? '✅' : '❌'}</div>
          <div>許可: {permission}</div>
          <div>動作中: {isRunning ? '✅' : '❌'}</div>
          <div>最終チェック: {lastCheckTime}</div>
          <div>通知回数: {notificationCount}</div>
          <div>監視対象: {todos.filter(t => t.reminderEnabled && !t.completed).length}件</div>
          <div>通知済み: {notifiedTodos.length}件</div>
        </div>
      </div>
    );
  }

  return null;
}