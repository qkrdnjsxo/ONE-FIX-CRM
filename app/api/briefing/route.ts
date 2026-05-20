import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { getSupabaseServer } from '../../../lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ceo') return NextResponse.json({ error: '권한 없음' }, { status: 403 });

  try {
    const supabase = getSupabaseServer();
    const today = new Date().toISOString().split('T')[0];

    // 오늘 보고 수집
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .eq('report_date', today)
      .order('created_at', { ascending: true });

    // 전체 고객 통계
    const { data: customers } = await supabase.from('customers').select('*');
    const contracted = customers?.filter(c => c.status === 'contracted') || [];
    const active = customers?.filter(c => c.status === 'active') || [];

    const stats = {
      total: customers?.length || 0,
      contracted: contracted.length,
      lead: active.filter(c => c.details?.sub_status === 'lead').length,
      db010: active.filter(c => c.details?.sub_status === 'db010').length,
      emotional: active.filter(c => c.details?.sub_status === 'emotional').length,
      trash: active.filter(c => c.details?.sub_status === 'trash').length,
      totalRevenue: contracted.reduce((s, c) => s + (c.details?.payment_amount || 0), 0),
    };

    // Gemini AI 브리핑 생성
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ briefing: '(AI 키 없음)', stats, reports: reports || [] });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

    const reportText = reports && reports.length > 0
      ? reports.map(r => `[${r.author_name} - ${r.report_type}] ${r.content}`).join('\n')
      : '오늘 제출된 보고 없음';

    const prompt = `
당신은 영업팀 CRM 비서입니다. 아래 데이터를 바탕으로 대표님을 위한 오늘의 브리핑을 작성해주세요.

📊 현재 고객 현황:
- 총 고객수: ${stats.total}명
- 신규DB: ${stats.lead}건
- 010DB: ${stats.db010}건
- 감성톡: ${stats.emotional}건
- 거절: ${stats.trash}건
- 계약업체: ${stats.contracted}건
- 총 매출액: ${stats.totalRevenue.toLocaleString()}원

📝 오늘 업무보고 (${today}):
${reportText}

위 내용을 바탕으로:
1. 오늘의 핵심 현황 요약
2. 주요 수치 분석
3. 대표님께 드리는 한마디

형식으로 간결하게 작성해주세요. 이모지를 적절히 사용해주세요.
`;

    const result = await model.generateContent(prompt);
    const briefing = result.response.text();

    return NextResponse.json({ briefing, stats, reports: reports || [], date: today });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
