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
  const sub_status = searchParams.get('sub_status'); // lead, db010, emotional, trash
  const contracted = searchParams.get('contracted'); // true
  const owner_id = searchParams.get('owner_id');
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

  // 권한별 필터
  if (role === 'sales') {
    query = query.eq('owner_id', userId);
  } else if (owner_id) {
    query = query.eq('owner_id', owner_id);
  }

  if (contracted === 'true') {
    query = query.eq('status', 'contracted');
  } else if (sub_status) {
    query = query.eq('status', 'active').filter('details->>sub_status', 'eq', sub_status);
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
  const userName = session.user?.name;

  const { data, error } = await supabase
    .from('customers')
    .insert([{
      ...body,
      owner_id: body.owner_id || userId,
      details: {
        ...body.details,
        sales_user_name: userName,
        sub_status: body.details?.sub_status || 'lead',
      },
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
