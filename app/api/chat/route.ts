import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      systemInstruction: '당신은 원픽스파트너스의 AI 비서입니다. 영업 CRM 시스템을 도와주는 역할을 합니다. 친절하고 전문적으로 답변해주세요. 한국어로 답변해주세요.',
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return NextResponse.json({ success: true, message: text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
