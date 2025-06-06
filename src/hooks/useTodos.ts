import { useState, useCallback } from 'react';
import { Todo, Priority } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = useCallback((title: string, description?: string, priority: Priority = 'medium', dueDate?: Date) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      priority,
      dueDate: dueDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTodos(prev => [newTodo, ...prev]);
    return newTodo;
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, ...updates, updatedAt: new Date() }
        : todo
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    ));
  }, []);

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
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    reorderTodos,
  };
}