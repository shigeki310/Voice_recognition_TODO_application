import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ViewMode, RepeatType } from '../types/todo';
import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../hooks/useAuth';
import { Header } from './Header';
import { TodoList } from './TodoList';
import { TodoForm } from './TodoForm';
import { VoiceButton } from './VoiceButton';
import { ReminderManager } from './ReminderManager';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function TodoApp() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [formSelectedDate, setFormSelectedDate] = useState<Date | undefined>(undefined);

  const { authState } = useAuth();
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos();

  // 認証状態が読み込み中の場合のみローディングを表示
  if (authState.loading) {
    console.log('認証状態が読み込み中のため、ローディングを表示');
    return <LoadingSpinner />;
  }

  const handleAddTodo = () => {
    setEditingTodo(null);
    setFormSelectedDate(undefined);
    setIsFormOpen(true);
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setFormSelectedDate(undefined);
    setIsFormOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setEditingTodo(null);
    setFormSelectedDate(date);
    setIsFormOpen(true);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleFormSubmit = (
    title: string, 
    description?: string, 
    priority?: any, 
    dueDate?: Date,
    dueTime?: string,
    reminderEnabled?: boolean,
    reminderTime?: number,
    repeatType?: RepeatType
  ) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, {
        title,
        description,
        priority,
        dueDate,
        dueTime,
        reminderEnabled,
        reminderTime,
        repeatType,
      });
    } else {
      addTodo(
        title, 
        description, 
        priority, 
        dueDate,
        dueTime,
        reminderEnabled,
        reminderTime,
        repeatType
      );
    }
  };

  const handleVoiceTranscript = (transcript) => {
    if (transcript.trim()) {
      setVoiceTranscript(transcript);
      setEditingTodo(null);
      setFormSelectedDate(undefined);
      setIsFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
    setVoiceTranscript('');
    setFormSelectedDate(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onAddTodo={handleAddTodo}
        todos={todos}
      />

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6">
        {loading && todos.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-slate-600">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              TODOを読み込み中...
            </div>
          </div>
        ) : (
          <TodoList
            todos={todos}
            viewMode={viewMode}
            selectedDate={selectedDate}
            onToggle={toggleTodo}
            onEdit={handleEditTodo}
            onDelete={deleteTodo}
            onDateClick={handleDateClick}
          />
        )}
      </main>

      <AnimatePresence>
        <TodoForm
          todo={editingTodo}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialTitle={voiceTranscript}
          selectedDate={formSelectedDate}
        />
      </AnimatePresence>

      <VoiceButton onTranscript={handleVoiceTranscript} />
      
      <ReminderManager todos={todos} />
    </div>
  );
}