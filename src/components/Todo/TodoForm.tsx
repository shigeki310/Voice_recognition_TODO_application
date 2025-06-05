import { useState } from 'react';
import { Todo, Priority } from '../../types/todo';
import { format } from 'date-fns';

interface TodoFormProps {
  onSubmit: (todo: Omit<Todo, 'id'>) => void;
  initialTodo?: Todo;
}

export function TodoForm({ onSubmit, initialTodo }: TodoFormProps) {
  const [title, setTitle] = useState(initialTodo?.title || '');
  const [dueDate, setDueDate] = useState(
    initialTodo?.dueDate
      ? format(initialTodo.dueDate, 'yyyy-MM-dd\'T\'HH:mm')
      : format(new Date(), 'yyyy-MM-dd\'T\'HH:mm')
  );
  const [priority, setPriority] = useState<Priority>(initialTodo?.priority || 'medium');
  const [notes, setNotes] = useState(initialTodo?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      dueDate: new Date(dueDate),
      priority,
      notes,
      completed: initialTodo?.completed || false,
    });
    
    if (!initialTodo) {
      setTitle('');
      setNotes('');
      setPriority('medium');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {initialTodo ? 'Update Todo' : 'Add Todo'}
      </button>
    </form>
  );
}