import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

// 서버 전용 Supabase 클라이언트 (service_role 키 사용 - RLS 완전 우회)
export function getSupabaseServer() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다.');
  }
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
