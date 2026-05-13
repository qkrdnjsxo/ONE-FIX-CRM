import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { getSupabaseServer } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ceo') return NextResponse.json({ error: '권한 없음' }, { status: 403 });

  const supabase = getSupabaseServer();
  const body = await request.json();
  const userId = (session.user as any).id;

  const { data, error } = await supabase
    .from('notices')
    .insert([{ ...body, author_id: userId, author_name: session.user?.name }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
