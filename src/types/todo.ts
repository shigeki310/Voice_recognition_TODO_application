export type Priority = 'low' | 'medium' | 'high';
export type ViewMode = 'day' | 'week' | 'month' | 'future';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: Date;
  priority: Priority;
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