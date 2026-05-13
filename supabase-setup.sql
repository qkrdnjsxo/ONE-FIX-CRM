-- 원픽스파트너스 CRM - Supabase 테이블 설정
-- Supabase SQL Editor에서 실행하세요

-- ① customers 테이블
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  ceo_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',  -- active | contracted
  owner_id UUID,                  -- users.id 참조 (담당 영업사원)
  details JSONB DEFAULT '{}',     -- sub_status, 상담내용 등 모든 부가 필드
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ② ops_cases 테이블 (관리팀용)
CREATE TABLE IF NOT EXISTS ops_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact TEXT,
  case_status TEXT DEFAULT 'new',  -- new | ongoing | as_request | closed
  description TEXT,
  notes TEXT,
  handler_name TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ③ notices 테이블 (공지사항)
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID,
  author_name TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ④ reports 테이블 (업무보고)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL,
  report_type TEXT DEFAULT 'morning',  -- morning | midday | closing | ops
  content TEXT NOT NULL,
  author_id UUID,
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ⑤ updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- customers updated_at 트리거
DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ops_cases updated_at 트리거
DROP TRIGGER IF EXISTS ops_cases_updated_at ON ops_cases;
CREATE TRIGGER ops_cases_updated_at
  BEFORE UPDATE ON ops_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ⑥ RLS 비활성화 (service_role 키로 우회하므로)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE ops_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
