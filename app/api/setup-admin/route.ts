import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

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
      user_id: data.user.id,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
