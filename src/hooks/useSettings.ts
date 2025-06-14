import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types/settings';

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    taskReminders: {
      enabled: true,
    },
    dailySummary: {
      enabled: false,
      time: '18:00',
      includeCompleted: true,
      includeIncomplete: true,
      includePriority: false,
    },
    weeklyReport: {
      enabled: false,
      dayOfWeek: 0,
      time: '09:00',
      format: 'summary',
    },
  },
  theme: {
    mode: 'light',
  },
  language: {
    language: 'ja',
    timeFormat: '24h',
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // 設定をローカルストレージから読み込み
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('voice_todo_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 設定を保存
  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem('voice_todo_settings', JSON.stringify(updatedSettings));
      return { success: true };
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      return { success: false, error: '設定の保存に失敗しました' };
    }
  }, [settings]);

  // 特定の設定セクションを更新
  const updateNotificationSettings = useCallback((newSettings: Partial<UserSettings['notifications']>) => {
    return saveSettings({
      notifications: { ...settings.notifications, ...newSettings }
    });
  }, [settings.notifications, saveSettings]);

  const updateThemeSettings = useCallback((newSettings: Partial<UserSettings['theme']>) => {
    return saveSettings({
      theme: { ...settings.theme, ...newSettings }
    });
  }, [settings.theme, saveSettings]);

  const updateLanguageSettings = useCallback((newSettings: Partial<UserSettings['language']>) => {
    return saveSettings({
      language: { ...settings.language, ...newSettings }
    });
  }, [settings.language, saveSettings]);

  // 設定をリセット
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('voice_todo_settings');
  }, []);

  return {
    settings,
    loading,
    saveSettings,
    updateNotificationSettings,
    updateThemeSettings,
    updateLanguageSettings,
    resetSettings,
  };
}