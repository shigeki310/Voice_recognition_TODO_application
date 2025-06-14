export interface NotificationSettings {
  taskReminders: {
    enabled: boolean;
    timing: number; // 何分前に通知するか
    sound: string; // 通知音の種類
    pushNotifications: boolean;
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
  colorPalette: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  fontSize: 'small' | 'medium' | 'large';
}

export interface LanguageSettings {
  language: 'ja' | 'en' | 'ko' | 'zh';
  dateFormat: 'jp' | 'us' | 'eu' | 'iso';
  timeFormat: '12h' | '24h';
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  exportFormat: 'csv' | 'json';
  exportPeriod: 'all' | 'last30days' | 'last90days' | 'lastyear';
  downloadFormat: 'zip' | 'individual';
}

export interface UserSettings {
  notifications: NotificationSettings;
  theme: ThemeSettings;
  language: LanguageSettings;
  privacy: PrivacySettings;
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