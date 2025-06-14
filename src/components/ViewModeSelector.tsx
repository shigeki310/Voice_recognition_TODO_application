import { motion } from 'framer-motion';
import { ViewMode } from '../types/todo';
import { CalendarDaysIcon, CalendarIcon, Squares2X2Icon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { t } from '../utils/i18n';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const modes = [
  { key: 'day' as ViewMode, icon: CalendarDaysIcon },
  { key: 'week' as ViewMode, icon: CalendarIcon },
  { key: 'month' as ViewMode, icon: Squares2X2Icon },
  { key: 'future' as ViewMode, icon: ArrowRightIcon },
];

export function ViewModeSelector({ currentMode, onModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex bg-slate-100 rounded-xl p-1 overflow-x-auto">
      {modes.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          className="relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0"
        >
          {currentMode === key && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Icon className="w-3 sm:w-4 h-3 sm:h-4 relative z-10" />
          <span className="relative z-10">{t(`view.${key}`)}</span>
        </button>
      ))}
    </div>
  );
}