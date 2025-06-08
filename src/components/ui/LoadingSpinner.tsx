import React from 'react';
import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-600 font-medium">読み込み中...</p>
      </motion.div>
    </div>
  );
}