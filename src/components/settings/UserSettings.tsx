import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  PaintBrushIcon,
  LanguageIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { UserSettings as UserSettingsType } from '../../types/settings';
import { ProfileSection } from './ProfileSection';
import { AccountSection } from './AccountSection';
import { NotificationSettingsSection } from './NotificationSettingsSection';
import { ThemeSettingsSection } from './ThemeSettingsSection';
import { LanguageSettingsSection } from './LanguageSettingsSection';
import { t } from '../../utils/i18n';
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
    },
    language: {
      language: 'ja',
      timeFormat: '24h',
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
      successMessage.textContent = t('settings.saved');
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      
      // エラーメッセージの表示
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = t('settings.saveError');
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
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
    
    // 言語設定を即座に適用
    applyLanguageSettings({ ...settings.language, ...newSettings });
  };

  const handleProfileChange = (newProfile: Partial<typeof profileData>) => {
    setProfileData(prev => ({ ...prev, ...newProfile }));
    setHasChanges(true);
  };

  // テーマ設定を適用する関数
  const applyThemeSettings = (themeSettings: UserSettingsType['theme']) => {
    const root = document.documentElement;
    
    // ダークモードの適用
    if (themeSettings.mode === 'dark') {
      root.classList.add('dark');
      document.body.className = 'bg-slate-900 text-slate-100';
    } else if (themeSettings.mode === 'light') {
      root.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900';
    } else {
      // システム設定に従う
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        document.body.className = 'bg-slate-900 text-slate-100';
      } else {
        root.classList.remove('dark');
        document.body.className = 'bg-slate-50 text-slate-900';
      }
    }
    
    // 設定をローカルストレージに即座に保存
    const currentSettings = JSON.parse(localStorage.getItem('voice_todo_settings') || '{}');
    currentSettings.theme = themeSettings;
    localStorage.setItem('voice_todo_settings', JSON.stringify(currentSettings));
  };

  // 言語設定を適用する関数
  const applyLanguageSettings = (languageSettings: UserSettingsType['language']) => {
    // 言語設定をHTMLのlang属性に反映
    document.documentElement.lang = languageSettings.language;
    
    // 設定をローカルストレージに即座に保存
    const currentSettings = JSON.parse(localStorage.getItem('voice_todo_settings') || '{}');
    currentSettings.language = languageSettings;
    localStorage.setItem('voice_todo_settings', JSON.stringify(currentSettings));
    
    // 言語変更の通知イベントを発火
    const event = new CustomEvent('languageChanged', { 
      detail: { 
        language: languageSettings.language,
        timeFormat: languageSettings.timeFormat 
      } 
    });
    window.dispatchEvent(event);
    
    // ページを強制的に再レンダリング
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // 設定をローカルストレージから読み込み
  useEffect(() => {
    const savedSettings = localStorage.getItem('voice_todo_settings');
    const savedProfile = localStorage.getItem('voice_todo_profile');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        // 読み込み時にテーマと言語を適用
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

  // システムのダークモード設定変更を監視
  useEffect(() => {
    if (settings.theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyThemeSettings(settings.theme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme.mode]);

  const sections = [
    { id: 'profile', label: t('settings.profile'), icon: UserCircleIcon },
    { id: 'account', label: t('settings.account'), icon: KeyIcon },
    { id: 'notifications', label: t('settings.notifications'), icon: BellIcon },
    { id: 'theme', label: t('settings.theme'), icon: PaintBrushIcon },
    { id: 'language', label: t('settings.language'), icon: LanguageIcon },
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
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('settings.title')}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700"
              >
                {t('settings.unsavedChanges')}
              </motion.div>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                hasChanges && !loading
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              {loading ? t('settings.saving') : t('settings.save')}
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* サイドバー */}
          <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
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
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
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
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800">
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
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}