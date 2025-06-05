import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  view,
  onViewChange,
}: CalendarHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <h1 className="text-lg font-semibold text-gray-900">
        {format(currentDate, 'MMMM yyyy')}
      </h1>
      <div className="flex items-center">
        <div className="relative mr-6">
          <select
            value={view}
            onChange={(e) => onViewChange(e.target.value as 'month' | 'week' | 'day')}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>
        <div className="flex items-center rounded-md shadow-sm">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}