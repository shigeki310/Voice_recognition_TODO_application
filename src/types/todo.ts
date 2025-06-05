export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
  priority: Priority;
  notes: string;
}