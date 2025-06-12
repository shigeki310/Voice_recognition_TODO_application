import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AnalogTimePickerProps {
  value: string; // HH:mm format
  onChange: (time: string) => void;
  onClose?: () => void;
  className?: string;
}

export function AnalogTimePicker({ value, onChange, onClose, className = '' }: AnalogTimePickerProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);
  const clockRef = useRef<HTMLDivElement>(null);

  // 初期値の設定
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setHours(h || 0);
      setMinutes(m || 0);
    }
  }, [value]);

  // 時刻変更時のコールバック
  const handleTimeChange = useCallback((newHours: number, newMinutes: number) => {
    const formattedTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    onChange(formattedTime);
  }, [onChange]);

  // 角度から時間を計算
  const angleToHour = (angle: number): number => {
    const hour = Math.round(angle / 30) % 12;
    return hour === 0 ? 12 : hour;
  };

  const angleToMinute = (angle: number): number => {
    return Math.round(angle / 6) % 60;
  };

  // 時間から角度を計算
  const hourToAngle = (hour: number): number => {
    return ((hour % 12) * 30) - 90;
  };

  const minuteToAngle = (minute: number): number => {
    return (minute * 6) - 90;
  };

  // マウス位置から角度を計算
  const getAngleFromMouse = (event: MouseEvent | React.MouseEvent): number => {
    if (!clockRef.current) return 0;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    return angle;
  };

  // マウスイベントハンドラー
  const handleMouseDown = (type: 'hour' | 'minute') => (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const angle = getAngleFromMouse(event);
    
    if (isDragging === 'hour') {
      const newHour = angleToHour(angle);
      const adjustedHour = hours >= 12 ? (newHour === 12 ? 12 : newHour + 12) : (newHour === 12 ? 0 : newHour);
      setHours(adjustedHour);
      handleTimeChange(adjustedHour, minutes);
    } else if (isDragging === 'minute') {
      const newMinute = angleToMinute(angle);
      setMinutes(newMinute);
      handleTimeChange(hours, newMinute);
    }
  }, [isDragging, hours, minutes, handleTimeChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // グローバルマウスイベントの設定
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 時刻表示の切り替え（AM/PM）
  const toggleAmPm = () => {
    const newHours = hours >= 12 ? hours - 12 : hours + 12;
    setHours(newHours);
    handleTimeChange(newHours, minutes);
  };

  // 数字の位置を計算
  const getNumberPosition = (number: number, radius: number) => {
    const angle = (number * 30 - 90) * (Math.PI / 180);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white rounded-2xl shadow-xl border border-slate-200 p-6 ${className}`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">時刻を選択</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* デジタル時刻表示 */}
      <div className="text-center mb-6">
        <div className="text-3xl font-mono font-bold text-slate-900 mb-2">
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
        </div>
        <button
          onClick={toggleAmPm}
          className="px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          {hours >= 12 ? 'PM' : 'AM'}
        </button>
      </div>

      {/* アナログ時計 */}
      <div className="flex justify-center mb-6">
        <div
          ref={clockRef}
          className="relative w-64 h-64 bg-slate-50 rounded-full border-4 border-slate-200 select-none"
        >
          {/* 時間の数字 */}
          {[...Array(12)].map((_, i) => {
            const number = i === 0 ? 12 : i;
            const pos = getNumberPosition(i, 100);
            return (
              <div
                key={i}
                className="absolute w-8 h-8 flex items-center justify-center text-sm font-semibold text-slate-700 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`
                }}
              >
                {number}
              </div>
            );
          })}

          {/* 分の目盛り */}
          {[...Array(60)].map((_, i) => {
            if (i % 5 !== 0) {
              const angle = (i * 6 - 90) * (Math.PI / 180);
              const x = Math.cos(angle) * 110;
              const y = Math.sin(angle) * 110;
              return (
                <div
                  key={i}
                  className="absolute w-0.5 h-2 bg-slate-300 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) rotate(${i * 6}deg)`
                  }}
                />
              );
            }
            return null;
          })}

          {/* 時間の目盛り */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = Math.cos(angle) * 110;
            const y = Math.sin(angle) * 110;
            return (
              <div
                key={i}
                className="absolute w-1 h-4 bg-slate-400 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`
                }}
              />
            );
          })}

          {/* 中心点 */}
          <div className="absolute w-3 h-3 bg-slate-800 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30" />

          {/* 時針 */}
          <motion.div
            className="absolute w-1 bg-slate-800 rounded-full origin-bottom z-20 cursor-pointer"
            style={{
              height: '60px',
              left: '50%',
              top: 'calc(50% - 60px)',
              transform: `translateX(-50%) rotate(${hourToAngle(hours % 12) + (minutes / 60) * 30}deg)`
            }}
            onMouseDown={handleMouseDown('hour')}
            whileHover={{ scale: 1.1 }}
          >
            <div className="absolute w-4 h-4 bg-slate-800 rounded-full -top-2 left-1/2 transform -translate-x-1/2" />
          </motion.div>

          {/* 分針 */}
          <motion.div
            className="absolute w-0.5 bg-primary-600 rounded-full origin-bottom z-10 cursor-pointer"
            style={{
              height: '80px',
              left: '50%',
              top: 'calc(50% - 80px)',
              transform: `translateX(-50%) rotate(${minuteToAngle(minutes)}deg)`
            }}
            onMouseDown={handleMouseDown('minute')}
            whileHover={{ scale: 1.1 }}
          >
            <div className="absolute w-3 h-3 bg-primary-600 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2" />
          </motion.div>
        </div>
      </div>

      {/* クイック選択ボタン */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: '9:00', value: '09:00' },
          { label: '12:00', value: '12:00' },
          { label: '15:00', value: '15:00' },
          { label: '18:00', value: '18:00' }
        ].map(({ label, value: quickValue }) => (
          <button
            key={label}
            onClick={() => {
              const [h, m] = quickValue.split(':').map(Number);
              setHours(h);
              setMinutes(m);
              handleTimeChange(h, m);
            }}
            className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
          >
            {label}
          </button>
        ))}
      </div>

      {/* 現在時刻ボタン */}
      <button
        onClick={() => {
          const now = new Date();
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          setHours(currentHours);
          setMinutes(currentMinutes);
          handleTimeChange(currentHours, currentMinutes);
        }}
        className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
      >
        現在時刻を設定
      </button>
    </motion.div>
  );
}