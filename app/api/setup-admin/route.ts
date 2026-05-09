import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '../../../lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'SUPABASE_SECRET_KEY 환경변수가 없습니다.' });
    }

    const supabase = createClient(SUPABASE_URL, secretKey);

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@onefix.com',
      password: 'OneFixAdmin2025!',
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      message: '계정 생성 완료!',
      email: 'admin@onefix.com',
      password: 'OneFixAdmin2025!',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
