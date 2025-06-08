export type Priority = 'low' | 'medium' | 'high';
export type ViewMode = 'day' | 'week' | 'month';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: Date;
  startTime?: Date;
  endTime?: Date;
  priority: Priority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}