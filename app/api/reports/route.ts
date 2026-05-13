import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { getSupabaseServer } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const supabase = getSupabaseServer();
  const { searchParams } = new URL(request.url);
  const report_date = searchParams.get('date'); // YYYY-MM-DD
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let query = supabase.from('reports').select('*').order('created_at', { ascending: false });

  // sales는 본인 보고만 조회
  if (role === 'sales') {
    query = query.eq('author_id', userId);
  }

  if (report_date) {
    query = query.eq('report_date', report_date);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const supabase = getSupabaseServer();
  const body = await request.json();
  const userId = (session.user as any).id;

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('reports')
    .insert([{
      ...body,
      author_id: userId,
      author_name: session.user?.name,
      report_date: body.report_date || today,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
