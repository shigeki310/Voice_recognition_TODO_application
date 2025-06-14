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
  'settings.saving': {
    ja: '保存中...',
    en: 'Saving...'
  },
  'settings.saved': {
    ja: '設定が保存されました',
    en: 'Settings saved successfully'
  },
  'settings.saveError': {
    ja: '設定の保存に失敗しました',
    en: 'Failed to save settings'
  },
  'settings.unsavedChanges': {
    ja: '未保存の変更があります',
    en: 'Unsaved changes'
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
  
  // テーマ設定
  'theme.title': {
    ja: 'テーマ設定',
    en: 'Theme Settings'
  },
  'theme.displayMode': {
    ja: '表示モード',
    en: 'Display Mode'
  },
  'theme.light': {
    ja: 'ライト',
    en: 'Light'
  },
  'theme.dark': {
    ja: 'ダーク',
    en: 'Dark'
  },
  'theme.system': {
    ja: 'システム',
    en: 'System'
  },
  'theme.lightDesc': {
    ja: '明るいテーマ',
    en: 'Light theme'
  },
  'theme.darkDesc': {
    ja: '暗いテーマ',
    en: 'Dark theme'
  },
  'theme.systemDesc': {
    ja: 'システム設定に従う',
    en: 'Follow system setting'
  },
  'theme.currentSetting': {
    ja: '現在の設定',
    en: 'Current setting'
  },
  'theme.systemNote': {
    ja: 'システムの設定に応じて自動的に切り替わります',
    en: 'Automatically switches based on system settings'
  },
  
  // 言語設定
  'language.title': {
    ja: '言語・地域設定',
    en: 'Language & Region Settings'
  },
  'language.displayLanguage': {
    ja: '表示言語',
    en: 'Display Language'
  },
  'language.japanese': {
    ja: '日本語',
    en: 'Japanese'
  },
  'language.english': {
    ja: 'English',
    en: 'English'
  },
  'language.timeFormat': {
    ja: '時刻形式',
    en: 'Time Format'
  },
  'language.12hour': {
    ja: '12時間形式',
    en: '12-hour format'
  },
  'language.24hour': {
    ja: '24時間形式',
    en: '24-hour format'
  },
  'language.12hourDesc': {
    ja: 'AM/PM表示',
    en: 'AM/PM display'
  },
  'language.24hourDesc': {
    ja: '24時間表示',
    en: '24-hour display'
  },
  'language.currentSetting': {
    ja: '現在の設定',
    en: 'Current setting'
  },
  'language.note': {
    ja: '注意',
    en: 'Note'
  },
  'language.reloadNote': {
    ja: '言語を変更すると、アプリケーションが再読み込みされます。',
    en: 'Changing the language will reload the application.'
  },
  
  // 通知設定
  'notifications.title': {
    ja: '通知設定',
    en: 'Notification Settings'
  },
  'notifications.taskReminders': {
    ja: 'タスクリマインダー',
    en: 'Task Reminders'
  },
  'notifications.reminderFunction': {
    ja: 'リマインダー機能',
    en: 'Reminder Function'
  },
  'notifications.reminderDesc': {
    ja: 'タスクの期限前に通知を送信',
    en: 'Send notifications before task deadlines'
  },
  'notifications.dailySummary': {
    ja: '日次サマリー',
    en: 'Daily Summary'
  },
  'notifications.dailySummaryEnabled': {
    ja: '日次サマリー送信',
    en: 'Send Daily Summary'
  },
  'notifications.dailySummaryDesc': {
    ja: '毎日の終わりにタスクの進捗を通知',
    en: 'Notify task progress at the end of each day'
  },
  'notifications.sendTime': {
    ja: '送信時刻',
    en: 'Send Time'
  },
  'notifications.includeInfo': {
    ja: '含める情報',
    en: 'Include Information'
  },
  'notifications.completedTasks': {
    ja: '完了したタスク',
    en: 'Completed tasks'
  },
  'notifications.incompleteTasks': {
    ja: '未完了のタスク',
    en: 'Incomplete tasks'
  },
  'notifications.priorityInfo': {
    ja: '優先度情報',
    en: 'Priority information'
  },
  'notifications.weeklyReport': {
    ja: '週次レポート',
    en: 'Weekly Report'
  },
  'notifications.weeklyReportEnabled': {
    ja: '週次レポート送信',
    en: 'Send Weekly Report'
  },
  'notifications.weeklyReportDesc': {
    ja: '週の終わりに完了したタスクのレポートを送信',
    en: 'Send report of completed tasks at the end of the week'
  },
  'notifications.deliveryDay': {
    ja: '配信曜日',
    en: 'Delivery Day'
  },
  'notifications.deliveryTime': {
    ja: '配信時間',
    en: 'Delivery Time'
  },
  'notifications.reportFormat': {
    ja: 'レポート形式',
    en: 'Report Format'
  },
  'notifications.summary': {
    ja: 'サマリー',
    en: 'Summary'
  },
  'notifications.detailed': {
    ja: '詳細',
    en: 'Detailed'
  },
  'notifications.summaryDesc': {
    ja: '簡潔な概要',
    en: 'Brief overview'
  },
  'notifications.detailedDesc': {
    ja: '完全なレポート',
    en: 'Complete report'
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
  'day.sunday': {
    ja: '日曜日',
    en: 'Sunday'
  },
  'day.monday': {
    ja: '月曜日',
    en: 'Monday'
  },
  'day.tuesday': {
    ja: '火曜日',
    en: 'Tuesday'
  },
  'day.wednesday': {
    ja: '水曜日',
    en: 'Wednesday'
  },
  'day.thursday': {
    ja: '木曜日',
    en: 'Thursday'
  },
  'day.friday': {
    ja: '金曜日',
    en: 'Friday'
  },
  'day.saturday': {
    ja: '土曜日',
    en: 'Saturday'
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