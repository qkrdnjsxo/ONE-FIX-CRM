import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getSupabaseServer } from '../../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServer();
  const body = await request.json();
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  // sales는 본인 고객만 수정 가능
  if (role === 'sales') {
    const { data: existing } = await supabase.from('customers').select('owner_id').eq('id', id).single();
    if (!existing || existing.owner_id !== userId) {
      return NextResponse.json({ error: '권한 없음' }, { status: 403 });
    }
  }

  const { data, error } = await supabase
    .from('customers')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServer();
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  // sales는 본인 고객만 삭제 가능
  if (role === 'sales') {
    const { data: existing } = await supabase.from('customers').select('owner_id').eq('id', id).single();
    if (!existing || existing.owner_id !== userId) {
      return NextResponse.json({ error: '권한 없음' }, { status: 403 });
    }
  }

  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
