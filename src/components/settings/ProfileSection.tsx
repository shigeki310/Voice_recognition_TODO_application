import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types/auth';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { t, getCurrentLanguage } from '../../utils/i18n';
import clsx from 'clsx';

interface ProfileSectionProps {
  profileData: {
    username: string;
    avatarUrl: string;
  };
  onProfileChange: (data: Partial<{ username: string; avatarUrl: string }>) => void;
  user: User | null;
}

export function ProfileSection({ profileData, onProfileChange, user }: ProfileSectionProps) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(profileData.username);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const language = getCurrentLanguage();

  const handleUsernameEdit = () => {
    setTempUsername(profileData.username);
    setIsEditingUsername(true);
  };

  const handleUsernameSave = () => {
    if (tempUsername.trim() && tempUsername !== profileData.username) {
      onProfileChange({ username: tempUsername.trim() });
    }
    setIsEditingUsername(false);
  };

  const handleUsernameCancel = () => {
    setTempUsername(profileData.username);
    setIsEditingUsername(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ファイルサイズチェック (2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert(t('profile.fileSizeError'));
        return;
      }

      // ファイル形式チェック
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        alert(t('profile.fileTypeError'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        onProfileChange({ avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatRegistrationDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'en') {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return format(date, 'yyyy年M月d日', { locale: ja });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('profile.title')}</h2>
        
        {/* アバター画像 */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {avatarPreview || profileData.avatarUrl ? (
                <img
                  src={avatarPreview || profileData.avatarUrl}
                  alt={t('profile.avatar')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            
            <button
              onClick={triggerFileInput}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t('profile.profileImage')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('profile.imageRequirements')}
            </p>
          </div>
        </div>

        {/* ユーザー名 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('profile.username')}
            </label>
            
            {isEditingUsername ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder={t('profile.usernamePlaceholder')}
                  autoFocus
                />
                <button
                  onClick={handleUsernameSave}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-200"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleUsernameCancel}
                  className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100">
                  {profileData.username}
                </span>
                <button
                  onClick={handleUsernameEdit}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('profile.usernameRequirements')}
            </p>
          </div>

          {/* 登録日 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('profile.registrationDate')}
            </label>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400">
              {user?.created_at ? formatRegistrationDate(user.created_at) : t('profile.unknown')}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}