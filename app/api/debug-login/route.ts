import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../lib/supabase-server';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseServer();

    // 1. users 테이블 조회
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, name, role, password_hash')
      .limit(5);

    if (error) {
      return NextResponse.json({ step: 'DB 조회 실패', error: error.message });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ step: 'users 테이블 비어있음', users: [] });
    }

    // 2. admin 계정 비밀번호 검증
    const admin = users.find(u => u.username === 'admin');
    if (!admin) {
      return NextResponse.json({ step: 'admin 계정 없음', users: users.map(u => u.username) });
    }

    const isValid = await bcrypt.compare('1234', admin.password_hash);

    return NextResponse.json({
      step: '완료',
      users: users.map(u => ({ username: u.username, role: u.role })),
      admin_hash_prefix: admin.password_hash.substring(0, 10),
      password_1234_valid: isValid,
    });
  } catch (err) {
    return NextResponse.json({ step: '예외 발생', error: String(err) });
  }
}
