import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { Todo } from '../../types/todo';
import clsx from 'clsx';

interface MonthViewProps {
  currentDate: Date;
  todos: Todo[];
  onDateClick: (date: Date) => void;
}

export function MonthView({ currentDate, todos, onDateClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700"
        >
          {day}
        </div>
      ))}
      {days.map((day, dayIdx) => {
        const dayTodos = todos.filter(
          (todo) => format(todo.dueDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );

        return (
          <div
            key={day.toString()}
            className={clsx(
              'relative bg-white py-2 px-3 h-24 cursor-pointer',
              !isSameMonth(day, currentDate) && 'bg-gray-50 text-gray-500'
            )}
            onClick={() => onDateClick(day)}
          >
            <time
              dateTime={format(day, 'yyyy-MM-dd')}
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full',
                isToday(day) && 'bg-indigo-600 font-semibold text-white'
              )}
            >
              {format(day, 'd')}
            </time>
            <div className="mt-2">
              {dayTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={clsx(
                    'text-xs mb-1 truncate rounded px-1',
                    todo.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  )}
                >
                  {todo.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}