import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ViewMode } from '../types/todo';
import { useTodos } from '../hooks/useTodos';
import { Header } from './Header';
import { TodoList } from './TodoList';
import { TodoForm } from './TodoForm';
import { VoiceButton } from './VoiceButton';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function TodoApp() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [formSelectedDate, setFormSelectedDate] = useState<Date | undefined>(undefined);

  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos();

  if (loading) {
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

  const handleFormSubmit = (title, description, priority, dueDate, startTime, endTime, status) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, {
        title,
        description,
        priority,
        dueDate,
        startTime,
        endTime,
        status,
      });
    } else {
      addTodo(title, description, priority, dueDate, startTime, endTime, status);
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
        onAddTodo={handleAddTodo}
        todoCount={todos.length}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <TodoList
          todos={todos}
          viewMode={viewMode}
          selectedDate={selectedDate}
          onToggle={toggleTodo}
          onEdit={handleEditTodo}
          onDelete={deleteTodo}
          onDateClick={handleDateClick}
        />
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
    </div>
  );
}