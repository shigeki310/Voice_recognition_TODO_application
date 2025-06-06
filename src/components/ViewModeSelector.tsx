import React from 'react';
import { motion } from 'framer-motion';
import { ViewMode } from '../types/todo';
import { CalendarDaysIcon, CalendarIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const modes = [
  { key: 'day' as ViewMode, label: '日', icon: CalendarDaysIcon },
  { key: 'week' as ViewMode, label: '週', icon: CalendarIcon },
  { key: 'month' as ViewMode, label: '月', icon: Squares2X2Icon },
];

export function ViewModeSelector({ currentMode, onModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex bg-slate-100 rounded-xl p-1">
      {modes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          {currentMode === key && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Icon className="w-4 h-4 relative z-10" />
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}