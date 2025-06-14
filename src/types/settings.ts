export interface NotificationSettings {
  taskReminders: {
    enabled: boolean;
  };
  dailySummary: {
    enabled: boolean;
    time: string; // HH:mm形式
    includeCompleted: boolean;
    includeIncomplete: boolean;
    includePriority: boolean;
  };
  weeklyReport: {
    enabled: boolean;
    dayOfWeek: number; // 0=日曜日, 1=月曜日...
    time: string; // HH:mm形式
    format: 'detailed' | 'summary';
  };
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
}

export interface LanguageSettings {
  language: 'ja' | 'en';
  timeFormat: '12h' | '24h';
}

export interface UserSettings {
  notifications: NotificationSettings;
  theme: ThemeSettings;
  language: LanguageSettings;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  created_at: string;
  updated_at: string;
  settings: UserSettings;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateData {
  username?: string;
  avatarUrl?: string;
  settings?: Partial<UserSettings>;
}