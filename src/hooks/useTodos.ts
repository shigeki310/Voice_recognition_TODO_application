import { useState, useCallback, useEffect, useRef } from 'react';
import { Todo, Priority, RepeatType } from '../types/todo';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false); // 初期値をfalseに変更
  const { authState } = useAuth();
  
  // 初期化状態を管理
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  // TODOの読み込み（ユーザーが変わった時のみ実行）
  const loadTodos = useCallback(async (userId: string) => {
    if (!userId) {
      console.log('ユーザーIDがないため、TODOの読み込みをスキップ');
      return;
    }

    try {
      setLoading(true);
      console.log('TODOデータを読み込み中...', userId);

      const { data: connectionTest, error: connectionError } = await supabase
        .from('todos')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      const formattedTodos: Todo[] = (data || []).map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description || undefined,
        completed: todo.completed,
        priority: todo.priority as Priority,
        dueDate: new Date(todo.due_date),
        dueTime: todo.due_time || undefined,
        reminderEnabled: todo.reminder_enabled || false,
        reminderTime: todo.reminder_time || undefined,
        repeatType: (todo.repeat_type as RepeatType) || 'none',
        createdAt: new Date(todo.created_at),
        updatedAt: new Date(todo.updated_at)
      }));

      setTodos(formattedTodos);
      console.log(`TODOデータ読み込み完了: ${formattedTodos.length}件`);
    } catch (error) {
      console.error('Error loading todos:', error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 認証状態の変化を監視
  useEffect(() => {
    const handleAuthChange = async () => {
      // 認証状態がまだ読み込み中の場合は何もしない
      if (authState.loading) {
        console.log('認証状態が読み込み中のため、TODO読み込みを待機');
        return;
      }

      const newUserId = authState.user?.id || null;
      
      // ユーザーが変わった場合のみ処理
      if (newUserId !== currentUserId.current) {
        console.log('ユーザーが変更されました:', {
          previous: currentUserId.current,
          current: newUserId
        });
        
        currentUserId.current = newUserId;
        isInitialized.current = false;

        if (newUserId) {
          // ログイン時：TODOを読み込み
          await loadTodos(newUserId);
          isInitialized.current = true;
        } else {
          // ログアウト時：TODOをクリア
          console.log('ログアウトのため、TODOをクリア');
          setTodos([]);
          setLoading(false);
          isInitialized.current = true;
        }
      } else if (!isInitialized.current && newUserId) {
        // 同じユーザーだが初期化されていない場合
        console.log('同じユーザーの初期化を実行');
        await loadTodos(newUserId);
        isInitialized.current = true;
      } else {
        // 変更なし、または既に初期化済み
        console.log('TODO読み込みをスキップ（変更なしまたは初期化済み）');
      }
    };

    handleAuthChange();
  }, [authState.loading, authState.user?.id, loadTodos]);

  const addTodo = useCallback(async (
    title: string, 
    description?: string, 
    priority: Priority = 'medium', 
    dueDate?: Date,
    dueTime?: string,
    reminderEnabled?: boolean,
    reminderTime?: number,
    repeatType?: RepeatType
  ) => {
    if (!authState.user) {
      console.error('ユーザーがログインしていないため、TODO追加をスキップ');
      return null;
    }

    try {
      console.log('新しいTODOを追加中:', title);

      const newTodo = {
        user_id: authState.user.id,
        title,
        description: description || null,
        completed: false,
        priority,
        due_date: (dueDate || new Date()).toISOString(),
        due_time: dueTime || null,
        reminder_enabled: reminderEnabled || false,
        reminder_time: reminderTime || null,
        repeat_type: repeatType || 'none'
      };

      const { data, error } = await supabase
        .from('todos')
        .insert(newTodo)
        .select()
        .single();

      if (error) {
        console.error('Error adding todo:', error);
        throw error;
      }

      const formattedTodo: Todo = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        completed: data.completed,
        priority: data.priority as Priority,
        dueDate: new Date(data.due_date),
        dueTime: data.due_time || undefined,
        reminderEnabled: data.reminder_enabled || false,
        reminderTime: data.reminder_time || undefined,
        repeatType: (data.repeat_type as RepeatType) || 'none',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // ローカル状態を即座に更新（再読み込みを避ける）
      setTodos(prev => [formattedTodo, ...prev]);
      console.log('新しいTODOを追加しました:', formattedTodo.title);
      return formattedTodo;
    } catch (error) {
      console.error('Error adding todo:', error);
      return null;
    }
  }, [authState.user]);

  const updateTodo = useCallback(async (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    if (!authState.user) {
      console.error('ユーザーがログインしていないため、TODO更新をスキップ');
      return;
    }

    try {
      console.log('TODOを更新中:', id);

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString();
      if (updates.dueTime !== undefined) updateData.due_time = updates.dueTime || null;
      if (updates.reminderEnabled !== undefined) updateData.reminder_enabled = updates.reminderEnabled;
      if (updates.reminderTime !== undefined) updateData.reminder_time = updates.reminderTime || null;
      if (updates.repeatType !== undefined) updateData.repeat_type = updates.repeatType;

      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', authState.user.id);

      if (error) {
        console.error('Error updating todo:', error);
        throw error;
      }

      // ローカル状態を即座に更新（再読み込みを避ける）
      setTodos(prev => prev.map(todo => 
        todo.id === id 
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      ));
      console.log('TODOを更新しました:', id);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }, [authState.user]);

  const deleteTodo = useCallback(async (id: string) => {
    if (!authState.user) {
      console.error('ユーザーがログインしていないため、TODO削除をスキップ');
      return;
    }

    try {
      console.log('TODOを削除中:', id);

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user.id);

      if (error) {
        console.error('Error deleting todo:', error);
        throw error;
      }

      // ローカル状態を即座に更新（再読み込みを避ける）
      setTodos(prev => prev.filter(todo => todo.id !== id));
      console.log('TODOを削除しました:', id);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }, [authState.user]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      console.error('指定されたTODOが見つかりません:', id);
      return;
    }

    await updateTodo(id, { completed: !todo.completed });
  }, [todos, updateTodo]);

  const reorderTodos = useCallback((activeId: string, overId: string) => {
    setTodos(prev => {
      const oldIndex = prev.findIndex(todo => todo.id === activeId);
      const newIndex = prev.findIndex(todo => todo.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newTodos = [...prev];
      const [removed] = newTodos.splice(oldIndex, 1);
      newTodos.splice(newIndex, 0, removed);
      
      return newTodos;
    });
  }, []);

  // 手動リロード機能（緊急時のみ使用）
  const forceReload = useCallback(async () => {
    if (!authState.user) {
      console.log('ユーザーがログインしていないため、強制リロードをスキップ');
      return;
    }
    
    console.log('強制リロードを実行します');
    isInitialized.current = false;
    await loadTodos(authState.user.id);
    isInitialized.current = true;
  }, [authState.user, loadTodos]);

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    reorderTodos,
    forceReload, // 緊急時用
  };
}