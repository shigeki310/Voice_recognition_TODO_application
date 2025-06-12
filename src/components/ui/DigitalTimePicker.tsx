import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DigitalTimePickerProps {
  value: string; // HH:mm format
  onChange: (time: string) => void;
  onClose?: () => void;
  className?: string;
}

export function DigitalTimePicker({ value, onChange, onClose, className = '' }: DigitalTimePickerProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [activeField, setActiveField] = useState<'hour' | 'minute' | null>(null);

  // 初期値の設定
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      const hour24 = h || 0;
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      setHours(hour12);
      setMinutes(m || 0);
      setIsAM(hour24 < 12);
    } else {
      const now = new Date();
      const hour24 = now.getHours();
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      setHours(hour12);
      setMinutes(now.getMinutes());
      setIsAM(hour24 < 12);
    }
  }, [value]);

  // 時刻変更時のコールバック
  const handleTimeChange = useCallback((newHours: number, newMinutes: number, newIsAM: boolean) => {
    let hour24 = newHours;
    if (newHours === 12) {
      hour24 = newIsAM ? 0 : 12;
    } else {
      hour24 = newIsAM ? newHours : newHours + 12;
    }
    
    const formattedTime = `${hour24.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    onChange(formattedTime);
  }, [onChange]);

  // 時間の増減
  const adjustHours = (delta: number) => {
    let newHours = hours + delta;
    if (newHours > 12) newHours = 1;
    if (newHours < 1) newHours = 12;
    setHours(newHours);
    handleTimeChange(newHours, minutes, isAM);
  };

  // 分の増減
  const adjustMinutes = (delta: number) => {
    let newMinutes = minutes + delta;
    if (newMinutes >= 60) newMinutes = 0;
    if (newMinutes < 0) newMinutes = 59;
    setMinutes(newMinutes);
    handleTimeChange(hours, newMinutes, isAM);
  };

  // AM/PM切り替え
  const toggleAmPm = () => {
    const newIsAM = !isAM;
    setIsAM(newIsAM);
    handleTimeChange(hours, minutes, newIsAM);
  };

  // プリセット時間
  const presetTimes = [
    { label: '朝', time: '09:00', icon: '🌅' },
    { label: '昼', time: '12:00', icon: '☀️' },
    { label: '夕', time: '18:00', icon: '🌆' },
    { label: '夜', time: '21:00', icon: '🌙' }
  ];

  const setPresetTime = (timeString: string) => {
    const [h, m] = timeString.split(':').map(Number);
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const newIsAM = h < 12;
    
    setHours(hour12);
    setMinutes(m);
    setIsAM(newIsAM);
    handleTimeChange(hour12, m, newIsAM);
  };

  const setCurrentTime = () => {
    const now = new Date();
    const hour24 = now.getHours();
    const minute = now.getMinutes();
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const newIsAM = hour24 < 12;
    
    setHours(hour12);
    setMinutes(minute);
    setIsAM(newIsAM);
    handleTimeChange(hour12, minute, newIsAM);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'
      }}
    >
      {/* ヘッダー */}
      <div className="relative px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">時刻選択</h3>
              <p className="text-sm text-slate-500 font-medium">お好みの時刻を設定してください</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-xl transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* メインタイムディスプレイ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl px-8 py-6 shadow-xl">
            <div className="flex items-center gap-2">
              {/* 時間 */}
              <div className="relative">
                <div 
                  className={`text-5xl font-mono font-bold text-white transition-all duration-300 ${
                    activeField === 'hour' ? 'scale-110 text-primary-300' : ''
                  }`}
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  {hours.toString().padStart(2, '0')}
                </div>
                {activeField === 'hour' && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -inset-2 bg-primary-500/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              
              {/* セパレーター */}
              <div className="text-5xl font-mono font-bold text-white/60 mx-2">:</div>
              
              {/* 分 */}
              <div className="relative">
                <div 
                  className={`text-5xl font-mono font-bold text-white transition-all duration-300 ${
                    activeField === 'minute' ? 'scale-110 text-primary-300' : ''
                  }`}
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  {minutes.toString().padStart(2, '0')}
                </div>
                {activeField === 'minute' && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -inset-2 bg-primary-500/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              
              {/* AM/PM */}
              <div className="ml-4">
                <button
                  onClick={toggleAmPm}
                  className={`px-4 py-2 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isAM 
                      ? 'bg-amber-400 text-amber-900 shadow-lg' 
                      : 'bg-indigo-400 text-indigo-900 shadow-lg'
                  }`}
                >
                  {isAM ? 'AM' : 'PM'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* 時間コントロール */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">時間</label>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => adjustHours(1)}
                  onMouseEnter={() => setActiveField('hour')}
                  onMouseLeave={() => setActiveField(null)}
                  className="w-12 h-12 bg-white hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ChevronUpIcon className="w-5 h-5 text-slate-600 hover:text-primary-600" />
                </button>
                
                <div className="w-16 h-16 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-mono font-bold text-slate-900" style={{ fontFeatureSettings: '"tnum"' }}>
                    {hours.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <button
                  onClick={() => adjustHours(-1)}
                  onMouseEnter={() => setActiveField('hour')}
                  onMouseLeave={() => setActiveField(null)}
                  className="w-12 h-12 bg-white hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ChevronDownIcon className="w-5 h-5 text-slate-600 hover:text-primary-600" />
                </button>
              </div>
            </div>
          </div>

          {/* 分コントロール */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">分</label>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => adjustMinutes(1)}
                  onMouseEnter={() => setActiveField('minute')}
                  onMouseLeave={() => setActiveField(null)}
                  className="w-12 h-12 bg-white hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ChevronUpIcon className="w-5 h-5 text-slate-600 hover:text-primary-600" />
                </button>
                
                <div className="w-16 h-16 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-mono font-bold text-slate-900" style={{ fontFeatureSettings: '"tnum"' }}>
                    {minutes.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <button
                  onClick={() => adjustMinutes(-1)}
                  onMouseEnter={() => setActiveField('minute')}
                  onMouseLeave={() => setActiveField(null)}
                  className="w-12 h-12 bg-white hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ChevronDownIcon className="w-5 h-5 text-slate-600 hover:text-primary-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* プリセット時間 */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-4">クイック選択</label>
          <div className="grid grid-cols-4 gap-3">
            {presetTimes.map(({ label, time, icon }) => (
              <motion.button
                key={time}
                onClick={() => setPresetTime(time)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-white to-slate-50 hover:from-primary-50 hover:to-primary-100 border border-slate-200 hover:border-primary-300 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{icon}</span>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-primary-700">{label}</span>
                <span className="text-sm font-mono font-bold text-slate-800 group-hover:text-primary-800" style={{ fontFeatureSettings: '"tnum"' }}>
                  {time}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <motion.button
            onClick={setCurrentTime}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-2">
              <ClockIcon className="w-5 h-5" />
              現在時刻を設定
            </div>
          </motion.button>
          
          {onClose && (
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-all duration-200"
            >
              完了
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}