import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getSupabaseServer } from '../../../../lib/supabase-server';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ceo') return NextResponse.json({ error: '권한 없음' }, { status: 403 });

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('users')
    .select('id, username, name, role, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ceo') return NextResponse.json({ error: '권한 없음' }, { status: 403 });

  const supabase = getSupabaseServer();
  const { username, name, password, user_role } = await request.json();

  if (!username || !name || !password || !user_role) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, name, role: user_role, password_hash }])
    .select('id, username, name, role')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ceo') return NextResponse.json({ error: '권한 없음' }, { status: 403 });

  const supabase = getSupabaseServer();
  const { id, name, password, user_role } = await request.json();

  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });

  const updates: any = {};
  if (name) updates.name = name;
  if (user_role) updates.role = user_role;
  if (password) updates.password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, username, name, role')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ceo') return NextResponse.json({ error: '권한 없음' }, { status: 403 });

  const supabase = getSupabaseServer();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });

  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
