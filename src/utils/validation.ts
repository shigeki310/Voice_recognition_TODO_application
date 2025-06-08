import { z } from 'zod';

// ユーザー名のバリデーションスキーマ
export const usernameSchema = z
  .string()
  .min(3, 'ユーザー名は3文字以上で入力してください')
  .max(20, 'ユーザー名は20文字以内で入力してください')
  .regex(/^[a-zA-Z0-9_]+$/, 'ユーザー名は半角英数字とアンダースコアのみ使用できます');

// パスワードのバリデーションスキーマ
export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .max(32, 'パスワードは32文字以内で入力してください')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは半角英大文字、小文字、数字を各1文字以上含む必要があります');

// 登録フォームのバリデーションスキーマ
export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
});

// ログインフォームのバリデーションスキーマ
export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'パスワードを入力してください')
});

// 入力値のサニタイズ
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match] || match;
    });
};

// ユーザー名の重複チェック
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const { supabase } = await import('../lib/supabase');
  
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .limit(1);

  if (error) {
    throw error;
  }

  // データが空の配列の場合、ユーザー名は利用可能
  return data.length === 0;
};

// パスワードハッシュ化（簡易版 - 本番環境では適切なライブラリを使用）
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'voice_todo_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// パスワード検証
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
};