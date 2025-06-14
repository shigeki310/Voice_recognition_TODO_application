import { motion, AnimatePresence } from 'framer-motion';
import { Todo, ViewMode } from '../types/todo';
import { TodoCard } from './TodoCard';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, eachWeekOfInterval, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PlusIcon } from '@heroicons/react/24/outline';

interface TodoListProps {
  todos: Todo[];
  viewMode: ViewMode;
  selectedDate: Date;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onDateClick?: (date: Date) => void;
}

export function TodoList({ todos, viewMode, selectedDate, onToggle, onEdit, onDelete, onDateClick }: TodoListProps) {
  // 基準日: 2025/06/08
  const baseDate = new Date('2025-06-08');
  
  const getFilteredTodos = () => {
    switch (viewMode) {
      case 'day':
        return todos.filter(todo => isSameDay(todo.dueDate, selectedDate));
      
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return todos.filter(todo => 
          todo.dueDate >= weekStart && todo.dueDate <= weekEnd
        );
      
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return todos.filter(todo => 
          todo.dueDate >= monthStart && todo.dueDate <= monthEnd
        );
      
      case 'future':
        // 基準日の翌月以降のTODOを取得
        const nextMonthStart = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
        return todos.filter(todo => todo.dueDate >= nextMonthStart);
      
      default:
        return todos;
    }
  };

  const getGroupedTodos = () => {
    const filtered = getFilteredTodos();
    
    if (viewMode === 'day') {
      return { [format(selectedDate, 'yyyy-MM-dd')]: filtered };
    }
    
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const grouped: Record<string, Todo[]> = {};
      days.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        grouped[dayKey] = filtered.filter(todo => isSameDay(todo.dueDate, day));
      });
      
      return grouped;
    }
    
    if (viewMode === 'month') {
      // Month view - group by week
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
      
      const grouped: Record<string, Record<string, Todo[]>> = {};
      weeks.forEach((weekStart, weekIndex) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
        const weekKey = `week-${weekIndex}`;
        grouped[weekKey] = {};
        
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        days.forEach(day => {
          const dayKey = format(day, 'yyyy-MM-dd');
          grouped[weekKey][dayKey] = filtered.filter(todo => isSameDay(todo.dueDate, day));
        });
      });
      
      return grouped;
    }
    
    if (viewMode === 'future') {
      // 月単位でグルーピング
      const monthGroups: Record<string, Todo[]> = {};
      
      filtered.forEach(todo => {
        const monthKey = format(todo.dueDate, 'yyyy-MM');
        if (!monthGroups[monthKey]) {
          monthGroups[monthKey] = [];
        }
        monthGroups[monthKey].push(todo);
      });
      
      // 月をソート（時系列順）
      const sortedMonths = Object.keys(monthGroups).sort();
      const sortedGroups: Record<string, Todo[]> = {};
      sortedMonths.forEach(month => {
        sortedGroups[month] = monthGroups[month].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      });
      
      return sortedGroups;
    }
    
    return {};
  };

  const groupedTodos = getGroupedTodos();
  const hasAnyTodos = viewMode === 'month' 
    ? Object.values(groupedTodos).some(week => Object.values(week as Record<string, Todo[]>).some(todos => todos.length > 0))
    : Object.values(groupedTodos).some(todos => (todos as Todo[]).length > 0);

  if (!hasAnyTodos && viewMode === 'day') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400\" fill="none\" stroke="currentColor\" viewBox="0 0 24 24">
            <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">本日はタスクがありません</h3>
        <p className="text-slate-500">新しいタスクを追加してみましょう</p>
      </div>
    );
  }

  if (!hasAnyTodos && viewMode === 'future') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">次月以降のタスクがありません</h3>
        <p className="text-slate-500">将来のタスクを追加してみましょう</p>
      </div>
    );
  }

  // Day view - 縦方向表示
  if (viewMode === 'day') {
    const dayTodos = groupedTodos[format(selectedDate, 'yyyy-MM-dd')] as Todo[];
    
    return (
      <div className="space-y-2 sm:space-y-3">
        <AnimatePresence mode="popLayout">
          {dayTodos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Future view - 月単位でグルーピング表示
  if (viewMode === 'future') {
    const monthGroups = groupedTodos as Record<string, Todo[]>;
    
    return (
      <div className="space-y-6 sm:space-y-8">
        <AnimatePresence mode="popLayout">
          {Object.entries(monthGroups).map(([monthKey, monthTodos]) => {
            const monthDate = new Date(monthKey + '-01');
            const monthLabel = format(monthDate, 'yyyy年M月', { locale: ja });
            
            return (
              <motion.div
                key={monthKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* 月のヘッダー */}
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">{monthLabel}</h2>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {monthTodos.length}件のタスク
                  </span>
                </div>

                {/* タスクリスト */}
                <div className="space-y-2 sm:space-y-3">
                  <AnimatePresence mode="popLayout">
                    {monthTodos.map(todo => (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="ml-2 sm:ml-4"
                      >
                        <TodoCard
                          todo={todo}
                          onToggle={onToggle}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  // Week view - 横方向表示（日付クリック可能）
  if (viewMode === 'week') {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map(day => {
            const isToday = isSameDay(day, new Date());
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTodos = (groupedTodos[dayKey] as Todo[]) || [];
            
            return (
              <div key={dayKey} className="min-h-0">
                <button
                  onClick={() => onDateClick?.(day)}
                  className={`w-full text-center p-1 sm:p-2 rounded-lg mb-2 transition-all duration-200 hover:scale-105 ${
                    isToday 
                      ? 'bg-primary-100 text-primary-700 font-medium hover:bg-primary-200' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-medium">
                    {format(day, 'E', { locale: ja })}
                  </div>
                  <div className="text-sm">
                    {format(day, 'd')}
                  </div>
                  {dayTodos.length > 0 && (
                    <div className="text-xs mt-1 bg-white/50 rounded px-1">
                      {dayTodos.length}件
                    </div>
                  )}
                  <div className="mt-1">
                    <PlusIcon className="w-2 sm:w-3 h-2 sm:h-3 mx-auto opacity-50" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* タスクカード - 横並び表示 */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-h-[300px] sm:min-h-[400px]">
          {days.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTodos = (groupedTodos[dayKey] as Todo[]) || [];
            
            return (
              <div key={dayKey} className="space-y-1 min-h-0">
                {/* タスクタイトルを横並びで表示 */}
                <div className="flex flex-wrap gap-1">
                  <AnimatePresence mode="popLayout">
                    {dayTodos.map(todo => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        compact={true}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Month view - 週ごとの横方向表示（全ての週を表示、日付クリック可能）
  if (viewMode === 'month') {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });

    return (
      <div className="space-y-4 sm:space-y-6">
        {weeks.map((weekStart, weekIndex) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
          const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
          const weekKey = `week-${weekIndex}`;
          const weekData = groupedTodos[weekKey] as Record<string, Todo[]>;

          // この週にタスクがあるかチェック
          const hasTasksThisWeek = days.some(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            return weekData[dayKey] && weekData[dayKey].length > 0;
          });

          return (
            <motion.div
              key={weekKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* 週のヘッダー */}
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-slate-700">
                  {format(weekStart, 'M月d日', { locale: ja })} - {format(weekEnd, 'M月d日', { locale: ja })}
                </h3>
                <div className="flex-1 h-px bg-slate-200" />
                {hasTasksThisWeek && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    タスクあり
                  </span>
                )}
              </div>

              {/* 曜日ヘッダー（クリック可能） */}
              <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayTodos = weekData[dayKey] || [];
                  
                  return (
                    <div key={dayKey} className="min-h-0">
                      <button
                        onClick={() => onDateClick?.(day)}
                        className={`w-full text-center p-1 rounded mb-1 text-xs transition-all duration-200 hover:scale-105 ${
                          isToday 
                            ? 'bg-primary-100 text-primary-700 font-medium hover:bg-primary-200' 
                            : isCurrentMonth
                            ? 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            : 'bg-slate-25 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <div>{format(day, 'E', { locale: ja })}</div>
                        <div>{format(day, 'd')}</div>
                        {dayTodos.length > 0 && (
                          <div className="text-xs mt-1 bg-white/50 rounded px-1">
                            {dayTodos.length}
                          </div>
                        )}
                        <div className="mt-1">
                          <PlusIcon className="w-2 h-2 mx-auto opacity-50" />
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* タスクカード - 横並び表示 */}
              <div className="grid grid-cols-7 gap-1 min-h-[120px] sm:min-h-[150px]">
                {days.map(day => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayTodos = weekData[dayKey] || [];
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  
                  return (
                    <div key={dayKey} className={`space-y-1 min-h-0 ${!isCurrentMonth ? 'opacity-50' : ''}`}>
                      {/* タスクタイトルを横並びで表示 */}
                      <div className="flex flex-col gap-1">
                        <AnimatePresence mode="popLayout">
                          {dayTodos.map(todo => (
                            <TodoCard
                              key={todo.id}
                              todo={todo}
                              onToggle={onToggle}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              compact={true}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* タスクがない場合のメッセージ（月ビュー用） */}
        {!hasAnyTodos && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">今月はタスクがありません</h3>
            <p className="text-slate-500">新しいタスクを追加してみましょう</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}