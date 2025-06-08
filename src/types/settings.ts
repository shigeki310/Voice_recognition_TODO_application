export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    taskReminders: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
  language: 'ja' | 'en';
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