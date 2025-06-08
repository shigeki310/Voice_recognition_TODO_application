import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  CameraIcon,
  KeyIcon,
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { UserSettings as UserSettingsType, PasswordChangeData } from '../../types/settings';
import { ProfileSection } from './ProfileSection';
import { AccountSection } from './AccountSection';
import { AppSettingsSection } from './AppSettingsSection';
import { PrivacySection } from './PrivacySection';
import { LoadingSpinner } from '../ui/LoadingSpinner';
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
    theme: 'light',
    notifications: {
      taskReminders: true,
      dailySummary: false,
      weeklyReport: false,
    },
    privacy: {
      dataSharing: false,
      analytics: true,
    },
    language: 'ja',
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
      setHasChanges(false);
      // 成功メッセージの表示
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: Partial<UserSettingsType>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasChanges(true);
  };

  const handleProfileChange = (newProfile: Partial<typeof profileData>) => {
    setProfileData(prev => ({ ...prev, ...newProfile }));
    setHasChanges(true);
  };

  const sections = [
    { id: 'profile', label: 'プロフィール', icon: UserCircleIcon },
    { id: 'account', label: 'アカウント', icon: KeyIcon },
    { id: 'app', label: 'アプリ設定', icon: BellIcon },
    { id: 'privacy', label: 'プライバシー', icon: ShieldCheckIcon },
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
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
            <h1 className="text-xl font-semibold text-slate-900">ユーザー設定</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full"
              >
                未保存の変更があります
              </motion.div>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200',
                hasChanges && !loading
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              保存
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* サイドバー */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4">
            <nav className="space-y-2">
              {sections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-200',
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-medium'
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
                
                {activeSection === 'app' && (
                  <AppSettingsSection
                    key="app"
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                  />
                )}
                
                {activeSection === 'privacy' && (
                  <PrivacySection
                    key="privacy"
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
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