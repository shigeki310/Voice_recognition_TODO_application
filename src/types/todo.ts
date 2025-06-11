export type Priority = 'low' | 'medium' | 'high';
export type ViewMode = 'day' | 'week' | 'month' | 'future';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: Date;
  dueTime?: string; // 新規追加: 時刻指定 (HH:mm形式)
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  // リマインダー機能
  reminderEnabled?: boolean;
  reminderTime?: number; // 何分前に通知するか
  repeatType?: RepeatType;
  repeatInterval?: number; // 繰り返し間隔
  repeatEndDate?: Date; // 繰り返し終了日
}

export interface ReminderSettings {
  enabled: boolean;
  defaultReminderTime: number; // デフォルトのリマインダー時間（分）
  notificationPermission: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}