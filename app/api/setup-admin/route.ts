import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '../../../lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'SUPABASE_SECRET_KEY 없음' });
    }

    const supabase = createClient(SUPABASE_URL, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 기존 유저 이메일 인증 처리
    const userId = '27ea628f-7dd5-4c71-ac07-67419db6f7d';
    const { data, error } = await supabase.auth.admin.updateUser(userId, {
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      message: '이메일 인증 완료! 이제 로그인 하세요.',
      email: 'admin@onefix.com',
      password: 'OneFixAdmin2025!',
      confirmed: data.user.email_confirmed_at ? true : false,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}
