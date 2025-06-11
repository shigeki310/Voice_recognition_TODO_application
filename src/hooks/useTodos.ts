import { useState, useCallback, useEffect, useRef } from 'react';
import { Todo, Priority, RepeatType } from '../types/todo';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();
  const loadingRef = useRef(false);
  const initialLoadDone = useRef(false);
  
  // TODOの読み込み（初回のみ実行）
  const loadTodos = useCallback(async () => {
    if (!authState.user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    // 既にローディング中または初回読み込み完了済みの場合はスキップ
    if (loadingRef.current || initialLoadDone.current) {
      console.log('ローディングをスキップしました（既に実行済み）');
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      
      console.log('初回TODOデータを読み込み中...');

      // Supabase接続テスト
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
        .eq('user_id', authState.user.id)
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
      initialLoadDone.current = true;
      console.log(`初回TODOデータ読み込み完了: ${formattedTodos.length}件`);
    } catch (error) {
      console.error('Error loading todos:', error);
      setTodos([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [authState.user]);

  // 初回読み込みのみ実行
  useEffect(() => {
    if (authState.user && !initialLoadDone.current) {
      console.log('初回TODOデータ読み込みを開始');
      loadTodos();
    } else if (!authState.user) {
      setTodos([]);
      setLoading(false);
      initialLoadDone.current = false;
    }
  }, [authState.user, loadTodos]);

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
    if (!authState.user) return null;

    try {
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
    if (!authState.user) return;

    try {
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
    if (!authState.user) return;

    try {
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
    if (!todo) return;

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
    console.log('強制リロードを実行します');
    initialLoadDone.current = false;
    loadingRef.current = false;
    await loadTodos();
  }, [loadTodos]);

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