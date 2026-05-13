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
  const case_status = searchParams.get('case_status'); // new, ongoing, as_request, closed

  let query = supabase.from('ops_cases').select('*').order('created_at', { ascending: false });

  if (case_status) {
    query = query.eq('case_status', case_status);
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

  const { data, error } = await supabase
    .from('ops_cases')
    .insert([{ ...body, case_status: body.case_status || 'new' }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
