import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  PaintBrushIcon,
  LanguageIcon,
  DocumentArrowDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { UserSettings as UserSettingsType } from '../../types/settings';
import { ProfileSection } from './ProfileSection';
import { AccountSection } from './AccountSection';
import { NotificationSettingsSection } from './NotificationSettingsSection';
import { ThemeSettingsSection } from './ThemeSettingsSection';
import { LanguageSettingsSection } from './LanguageSettingsSection';
import { PrivacySettingsSection } from './PrivacySettingsSection';
import clsx from 'clsx';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettings({ isOpen, onClose }: UserSettingsProps) {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('profile');
  
  const [settings, setSettings] = useState<UserSettingsType>({
    notifications: {
      taskReminders: {
        enabled: true,
        timing: 10,
        sound: 'default',
        pushNotifications: true,
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
        dayOfWeek: 0, // 日曜日
        time: '09:00',
        format: 'summary',
      },
    },
    theme: {
      mode: 'light',
      colorPalette: 'blue',
      fontSize: 'medium',
    },
    language: {
      language: 'ja',
      timeFormat: '24h',
    },
    privacy: {
      exportFormat: 'json',
      exportPeriod: 'all',
      downloadFormat: 'zip',
    },
  });

  const [profileData, setProfileData] = useState({
    username: authState.user?.username || '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (authState.user) {
      setProfileData({
        username: authState.user.username,
        avatarUrl: '',
      });
    }
  }, [authState.user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // 設定の保存処理
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬API呼び出し
      
      // ローカルストレージに設定を保存
      localStorage.setItem('voice_todo_settings', JSON.stringify(settings));
      localStorage.setItem('voice_todo_profile', JSON.stringify(profileData));
      
      setHasChanges(false);
      
      // 成功メッセージの表示
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = '設定が保存されました';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      
      // エラーメッセージの表示
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = '設定の保存に失敗しました';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsChange = (newSettings: Partial<UserSettingsType['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...newSettings }
    }));
    setHasChanges(true);
  };

  const handleThemeSettingsChange = (newSettings: Partial<UserSettingsType['theme']>) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, ...newSettings }
    }));
    setHasChanges(true);
    
    // テーマ変更を即座に適用
    applyThemeSettings({ ...settings.theme, ...newSettings });
  };

  const handleLanguageSettingsChange = (newSettings: Partial<UserSettingsType['language']>) => {
    setSettings(prev => ({
      ...prev,
      language: { ...prev.language, ...newSettings }
    }));
    setHasChanges(true);
  };

  const handlePrivacySettingsChange = (newSettings: Partial<UserSettingsType['privacy']>) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, ...newSettings }
    }));
    setHasChanges(true);
  };

  const handleProfileChange = (newProfile: Partial<typeof profileData>) => {
    setProfileData(prev => ({ ...prev, ...newProfile }));
    setHasChanges(true);
  };

  // テーマ設定を適用する関数
  const applyThemeSettings = (themeSettings: UserSettingsType['theme']) => {
    const root = document.documentElement;
    
    // フォントサイズの適用
    switch (themeSettings.fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      default:
        root.style.fontSize = '16px';
        break;
    }
    
    // カラーパレットの適用
    const colorPalettes = {
      blue: { primary: '#0284c7', secondary: '#0ea5e9' },
      purple: { primary: '#7c3aed', secondary: '#8b5cf6' },
      green: { primary: '#059669', secondary: '#10b981' },
      orange: { primary: '#ea580c', secondary: '#f97316' },
      pink: { primary: '#db2777', secondary: '#ec4899' },
    };
    
    const palette = colorPalettes[themeSettings.colorPalette];
    root.style.setProperty('--color-primary-600', palette.primary);
    root.style.setProperty('--color-primary-500', palette.secondary);
    
    // ダークモードの適用
    if (themeSettings.mode === 'dark') {
      root.classList.add('dark');
    } else if (themeSettings.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // システム設定に従う
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // 設定をローカルストレージから読み込み
  useEffect(() => {
    const savedSettings = localStorage.getItem('voice_todo_settings');
    const savedProfile = localStorage.getItem('voice_todo_profile');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        // 読み込み時にテーマを適用
        applyThemeSettings(parsedSettings.theme || settings.theme);
      } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
      }
    }
    
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(prev => ({ ...prev, ...parsedProfile }));
      } catch (error) {
        console.error('プロフィールの読み込みに失敗しました:', error);
      }
    }
  }, []);

  const sections = [
    { id: 'profile', label: 'プロフィール', icon: UserCircleIcon },
    { id: 'account', label: 'アカウント', icon: KeyIcon },
    { id: 'notifications', label: '通知設定', icon: BellIcon },
    { id: 'theme', label: 'テーマ', icon: PaintBrushIcon },
    { id: 'language', label: '言語・地域', icon: LanguageIcon },
    { id: 'privacy', label: 'データエクスポート', icon: DocumentArrowDownIcon },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900">設定</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200"
              >
                未保存の変更があります
              </motion.div>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                hasChanges && !loading
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* サイドバー */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {sections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200',
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-medium shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeSection === 'profile' && (
                  <ProfileSection
                    key="profile"
                    profileData={profileData}
                    onProfileChange={handleProfileChange}
                    user={authState.user}
                  />
                )}
                
                {activeSection === 'account' && (
                  <AccountSection
                    key="account"
                    user={authState.user}
                  />
                )}
                
                {activeSection === 'notifications' && (
                  <NotificationSettingsSection
                    key="notifications"
                    settings={settings.notifications}
                    onSettingsChange={handleNotificationSettingsChange}
                  />
                )}
                
                {activeSection === 'theme' && (
                  <ThemeSettingsSection
                    key="theme"
                    settings={settings.theme}
                    onSettingsChange={handleThemeSettingsChange}
                  />
                )}
                
                {activeSection === 'language' && (
                  <LanguageSettingsSection
                    key="language"
                    settings={settings.language}
                    onSettingsChange={handleLanguageSettingsChange}
                  />
                )}
                
                {activeSection === 'privacy' && (
                  <PrivacySettingsSection
                    key="privacy"
                    settings={settings.privacy}
                    onSettingsChange={handlePrivacySettingsChange}
                    user={authState.user}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}