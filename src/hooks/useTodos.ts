import { useState, useCallback, useEffect } from 'react';
import { Todo, Priority, TaskStatus } from '../types/todo';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();

  // TODOの読み込み
  const loadTodos = useCallback(async () => {
    if (!authState.user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTodos: Todo[] = data.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description || undefined,
        completed: todo.completed,
        priority: todo.priority as Priority,
        status: (todo.status as TaskStatus) || 'not_started',
        dueDate: new Date(todo.due_date),
        startTime: todo.start_time ? new Date(todo.start_time) : undefined,
        endTime: todo.end_time ? new Date(todo.end_time) : undefined,
        createdAt: new Date(todo.created_at),
        updatedAt: new Date(todo.updated_at)
      }));

      setTodos(formattedTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const addTodo = useCallback(async (
    title: string, 
    description?: string, 
    priority: Priority = 'medium', 
    dueDate?: Date,
    startTime?: Date,
    endTime?: Date,
    status: TaskStatus = 'not_started'
  ) => {
    if (!authState.user) return null;

    try {
      const newTodo = {
        user_id: authState.user.id,
        title,
        description: description || null,
        completed: status === 'completed',
        priority,
        status,
        due_date: (dueDate || new Date()).toISOString(),
        start_time: startTime ? startTime.toISOString() : null,
        end_time: endTime ? endTime.toISOString() : null
      };

      const { data, error } = await supabase
        .from('todos')
        .insert(newTodo)
        .select()
        .single();

      if (error) throw error;

      const formattedTodo: Todo = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        completed: data.completed,
        priority: data.priority as Priority,
        status: (data.status as TaskStatus) || 'not_started',
        dueDate: new Date(data.due_date),
        startTime: data.start_time ? new Date(data.start_time) : undefined,
        endTime: data.end_time ? new Date(data.end_time) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setTodos(prev => [formattedTodo, ...prev]);
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
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString();
      if (updates.startTime !== undefined) updateData.start_time = updates.startTime ? updates.startTime.toISOString() : null;
      if (updates.endTime !== undefined) updateData.end_time = updates.endTime ? updates.endTime.toISOString() : null;

      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', authState.user.id);

      if (error) throw error;

      setTodos(prev => prev.map(todo => 
        todo.id === id 
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      ));
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

      if (error) throw error;

      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }, [authState.user]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;
    const newStatus = newCompleted ? 'completed' : 'not_started';

    await updateTodo(id, { 
      completed: newCompleted,
      status: newStatus
    });
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

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    reorderTodos,
  };
}