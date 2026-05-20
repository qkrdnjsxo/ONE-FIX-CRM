import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { getSupabaseServer } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

// 심사요청 / A/S요청 통합 API
// request_type: 'review' (심사요청) | 'as' (A/S요청)
// request_status: 'pending' | 'approved' | 'rejected' | 'done'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const supabase = getSupabaseServer();
  const { searchParams } = new URL(request.url);
  const request_type = searchParams.get('type');
  const request_status = searchParams.get('status');

  let query = supabase.from('requests').select('*').order('created_at', { ascending: false });

  if (request_type) query = query.eq('request_type', request_type);
  if (request_status) query = query.eq('request_status', request_status);

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

  const { data, error } = await supabase
    .from('requests')
    .insert([{
      ...body,
      requester_id: userId,
      requester_name: session.user?.name,
      request_status: 'pending',
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
