import { Todo } from '../../types/todo';
import clsx from 'clsx';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onEdit, onDelete }: TodoListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center py-4">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="ml-3 flex-1">
            <p
              className={clsx(
                'text-sm font-medium',
                todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'
              )}
            >
              {todo.title}
            </p>
            <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
              <span>Due: {format(todo.dueDate, 'PPp')}</span>
              <span>•</span>
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full text-xs',
                  {
                    'bg-red-100 text-red-800': todo.priority === 'high',
                    'bg-yellow-100 text-yellow-800': todo.priority === 'medium',
                    'bg-green-100 text-green-800': todo.priority === 'low',
                  }
                )}
              >
                {todo.priority}
              </span>
            </div>
            {todo.notes && (
              <p className="mt-1 text-sm text-gray-500">{todo.notes}</p>
            )}
          </div>
          <div className="ml-4 flex space-x-2">
            <button
              onClick={() => onEdit(todo)}
              className="rounded bg-white py-1 px-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="rounded bg-red-600 py-1 px-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}