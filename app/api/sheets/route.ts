import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const sheetId = process.env.GOOGLE_SHEETS_ID;

    if (!privateKey || !clientEmail || !sheetId) {
      return NextResponse.json({ error: 'Google Sheets 환경변수 없음' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'Sheet1!A1:Z100';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    return NextResponse.json({ data: response.data.values || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
