// 国際化対応のユーティリティ関数

export interface Translations {
  [key: string]: {
    ja: string;
    en: string;
  };
}

export const translations: Translations = {
  // ヘッダー
  'app.title': {
    ja: 'Voice TODO',
    en: 'Voice TODO'
  },
  'header.welcome': {
    ja: 'ようこそ、{username}さん',
    en: 'Welcome, {username}'
  },
  'header.logout': {
    ja: 'ログアウト',
    en: 'Logout'
  },
  'header.add': {
    ja: '追加',
    en: 'Add'
  },
  
  // ビューモード
  'view.day': {
    ja: '本日',
    en: 'Today'
  },
  'view.week': {
    ja: '週',
    en: 'Week'
  },
  'view.month': {
    ja: '月',
    en: 'Month'
  },
  'view.future': {
    ja: '次月以降',
    en: 'Future'
  },
  
  // タスク
  'task.priority.high': {
    ja: '高',
    en: 'High'
  },
  'task.priority.medium': {
    ja: '中',
    en: 'Medium'
  },
  'task.priority.low': {
    ja: '低',
    en: 'Low'
  },
  'task.count': {
    ja: '{count}件のタスク',
    en: '{count} tasks'
  },
  'task.noTasks.today': {
    ja: '本日はタスクがありません',
    en: 'No tasks for today'
  },
  'task.noTasks.future': {
    ja: '次月以降のタスクがありません',
    en: 'No future tasks'
  },
  'task.noTasks.month': {
    ja: '今月はタスクがありません',
    en: 'No tasks this month'
  },
  'task.addNew': {
    ja: '新しいタスクを追加してみましょう',
    en: 'Try adding a new task'
  },
  
  // フォーム
  'form.title': {
    ja: 'タイトル',
    en: 'Title'
  },
  'form.description': {
    ja: '説明（任意）',
    en: 'Description (optional)'
  },
  'form.priority': {
    ja: '優先度',
    en: 'Priority'
  },
  'form.dueDate': {
    ja: 'タスク期限日',
    en: 'Due Date'
  },
  'form.time': {
    ja: '時刻',
    en: 'Time'
  },
  'form.reminder': {
    ja: 'リマインダー',
    en: 'Reminder'
  },
  'form.repeat': {
    ja: '繰り返し',
    en: 'Repeat'
  },
  'form.cancel': {
    ja: 'キャンセル',
    en: 'Cancel'
  },
  'form.create': {
    ja: '作成',
    en: 'Create'
  },
  'form.update': {
    ja: '更新',
    en: 'Update'
  },
  
  // 設定
  'settings.title': {
    ja: '設定',
    en: 'Settings'
  },
  'settings.save': {
    ja: '保存',
    en: 'Save'
  },
  'settings.profile': {
    ja: 'プロフィール',
    en: 'Profile'
  },
  'settings.account': {
    ja: 'アカウント',
    en: 'Account'
  },
  'settings.notifications': {
    ja: '通知設定',
    en: 'Notifications'
  },
  'settings.theme': {
    ja: 'テーマ',
    en: 'Theme'
  },
  'settings.language': {
    ja: '言語・地域',
    en: 'Language & Region'
  },
  
  // 認証
  'auth.login': {
    ja: 'ログイン',
    en: 'Login'
  },
  'auth.register': {
    ja: '新規登録',
    en: 'Register'
  },
  'auth.username': {
    ja: 'ユーザー名',
    en: 'Username'
  },
  'auth.password': {
    ja: 'パスワード',
    en: 'Password'
  },
  
  // 時刻表示
  'time.am': {
    ja: '午前',
    en: 'AM'
  },
  'time.pm': {
    ja: '午後',
    en: 'PM'
  },
  
  // 曜日
  'day.sun': {
    ja: '日',
    en: 'Sun'
  },
  'day.mon': {
    ja: '月',
    en: 'Mon'
  },
  'day.tue': {
    ja: '火',
    en: 'Tue'
  },
  'day.wed': {
    ja: '水',
    en: 'Wed'
  },
  'day.thu': {
    ja: '木',
    en: 'Thu'
  },
  'day.fri': {
    ja: '金',
    en: 'Fri'
  },
  'day.sat': {
    ja: '土',
    en: 'Sat'
  },
  
  // 月
  'month.1': {
    ja: '1月',
    en: 'January'
  },
  'month.2': {
    ja: '2月',
    en: 'February'
  },
  'month.3': {
    ja: '3月',
    en: 'March'
  },
  'month.4': {
    ja: '4月',
    en: 'April'
  },
  'month.5': {
    ja: '5月',
    en: 'May'
  },
  'month.6': {
    ja: '6月',
    en: 'June'
  },
  'month.7': {
    ja: '7月',
    en: 'July'
  },
  'month.8': {
    ja: '8月',
    en: 'August'
  },
  'month.9': {
    ja: '9月',
    en: 'September'
  },
  'month.10': {
    ja: '10月',
    en: 'October'
  },
  'month.11': {
    ja: '11月',
    en: 'November'
  },
  'month.12': {
    ja: '12月',
    en: 'December'
  }
};

// 現在の言語を取得
export function getCurrentLanguage(): 'ja' | 'en' {
  try {
    const settings = localStorage.getItem('voice_todo_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.language?.language || 'ja';
    }
  } catch (error) {
    console.error('言語設定の取得に失敗しました:', error);
  }
  return 'ja';
}

// 現在の時刻形式を取得
export function getCurrentTimeFormat(): '12h' | '24h' {
  try {
    const settings = localStorage.getItem('voice_todo_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.language?.timeFormat || '24h';
    }
  } catch (error) {
    console.error('時刻形式設定の取得に失敗しました:', error);
  }
  return '24h';
}

// 翻訳関数
export function t(key: string, params?: Record<string, string | number>): string {
  const language = getCurrentLanguage();
  const translation = translations[key];
  
  if (!translation) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  let text = translation[language] || translation.ja || key;
  
  // パラメータの置換
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, String(value));
    });
  }
  
  return text;
}

// 時刻のフォーマット
export function formatTime(time: string): string {
  if (!time) return '';
  
  const timeFormat = getCurrentTimeFormat();
  
  if (timeFormat === '12h') {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? t('time.pm') : t('time.am');
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  return time;
}

// 日付のフォーマット
export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  const language = getCurrentLanguage();
  
  if (language === 'en') {
    if (format === 'long') {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // 日本語
  if (format === 'long') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 曜日の取得
export function getDayName(dayIndex: number, short: boolean = true): string {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return t(`day.${days[dayIndex]}`);
}

// 月名の取得
export function getMonthName(monthIndex: number): string {
  return t(`month.${monthIndex + 1}`);
}