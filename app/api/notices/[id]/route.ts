import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getSupabaseServer } from '../../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ceo') return NextResponse.json({ error: '권한 없음' }, { status: 403 });

  const { id } = await params;
  const supabase = getSupabaseServer();
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
