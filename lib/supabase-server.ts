import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// 서버 전용 Supabase 클라이언트 (RLS 비활성화 전제)
export function getSupabaseServer() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
