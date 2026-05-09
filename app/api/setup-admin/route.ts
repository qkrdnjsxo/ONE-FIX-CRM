import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase.auth.signUp({
      email: 'admin@onefix.com',
      password: 'OneFixAdmin2025!',
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      message: '계정 생성 완료! 이메일 인증 확인 필요할 수 있음',
      email: 'admin@onefix.com',
      password: 'OneFixAdmin2025!',
      user_id: data.user?.id,
      confirmed: data.user?.email_confirmed_at ? true : false,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}
