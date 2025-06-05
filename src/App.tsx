import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarHeader } from './components/Calendar/CalendarHeader';
import { MonthView } from './components/Calendar/MonthView';
import { TodoForm } from './components/Todo/TodoForm';
import { TodoList } from './components/Todo/TodoList';
import { Todo } from './types/todo';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const handleAddTodo = (newTodo: Omit<Todo, 'id'>) => {
    const todo: Todo = {
      ...newTodo,
      id: crypto.randomUUID(),
    };
    setTodos([...todos, todo]);
    setSelectedTodo(null);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  const handleUpdateTodo = (updatedTodo: Omit<Todo, 'id'>) => {
    if (!selectedTodo) return;
    setTodos(
      todos.map((todo) =>
        todo.id === selectedTodo.id ? { ...updatedTodo, id: todo.id } : todo
      )
    );
    setSelectedTodo(null);
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <CalendarHeader
            currentDate={currentDate}
            onPrevMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            onNextMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            view={view}
            onViewChange={setView}
          />
          <MonthView
            currentDate={currentDate}
            todos={todos}
            onDateClick={(date) => setCurrentDate(date)}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedTodo ? 'Edit Todo' : 'Add New Todo'}
            </h2>
            <div className="mt-4">
              <TodoForm
                onSubmit={selectedTodo ? handleUpdateTodo : handleAddTodo}
                initialTodo={selectedTodo || undefined}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Todos for {format(currentDate, 'MMMM d, yyyy')}
            </h2>
            <div className="mt-4">
              <TodoList
                todos={todos.filter(
                  (todo) =>
                    format(todo.dueDate, 'yyyy-MM-dd') ===
                    format(currentDate, 'yyyy-MM-dd')
                )}
                onToggle={handleToggleTodo}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}