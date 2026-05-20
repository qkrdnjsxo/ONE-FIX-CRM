'use client';
import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import AIAssistant from '../AIAssistant';
import CustomerCard from '../sales/CustomerCard';
import AddCustomerModal from '../sales/AddCustomerModal';
import ReportTab from '../sales/ReportTab';
import NoticeBoard from '../shared/NoticeBoard';

const TABS = [
  { id: 'home', label: '홈보드', icon: '🏠' },
  { id: 'customer', label: '고객관리', icon: '👥' },
  { id: 'supply', label: '공급현황', icon: '📦' },
  { id: 'move_db', label: 'DB이동', icon: '🔄' },
  { id: 'assign_db', label: '한경연DB배정', icon: '🎯' },
  { id: 'review', label: '심사요청', icon: '📋' },
  { id: 'as_request', label: 'A/S요청', icon: '🔧' },
  { id: 'revenue', label: '매출통계', icon: '📊' },
  { id: 'briefing', label: 'AI브리핑', icon: '🤖' },
  { id: 'notice', label: '공지사항', icon: '📢' },
  { id: 'sheets', label: '결제율', icon: '📊' },
  { id: 'report', label: '업무보고', icon: '📝' },
  { id: 'users', label: '직원관리', icon: '⚙️' },
];

export default function CeoDashboard({ session }: { session: any }) {
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function load() {
      setLoadingStats(true);
      try {
        const [custRes, revenueRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/customers?contracted=true'),
        ]);
        const customers: any[] = custRes.ok ? await custRes.json() : [];
        const contracted: any[] = revenueRes.ok ? await revenueRes.json() : [];

        const counts = { lead: 0, db010: 0, emotional: 0, trash: 0 };
        for (const c of customers) {
          const s = c.details?.sub_status;
          if (s && s in counts) (counts as any)[s]++;
        }

        const totalRevenue = contracted.reduce((s: number, c: any) => s + (c.details?.payment_amount || 0), 0);
        const totalWeight = contracted.reduce((s: number, c: any) => {
          const a = c.details?.payment_amount || 0;
          return s + (a <= 330000 ? 0.5 : 1);
        }, 0);

        setStats({ ...counts, contracted: contracted.length, totalRevenue, totalWeight, total: customers.length });
      } finally {
        setLoadingStats(false);
      }
    }
    load();
  }, []);

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold">원픽스파트너스 CRM</span>
          <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">대표</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm hidden sm:block">{session.user.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded-lg transition-colors">
            로그아웃
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <aside className="hidden md:flex flex-col w-48 bg-slate-800 border-r border-slate-700 shrink-0">
          <div className="p-4 border-b border-slate-700">
            <p className="text-xs text-slate-500">대표</p>
            <p className="font-semibold">{session.user.name}</p>
          </div>
          <nav className="flex-1 py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-yellow-600/20 text-yellow-300 border-r-2 border-yellow-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* 모바일 하단 탭 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex overflow-x-auto z-40">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 text-xs shrink-0 transition-colors ${activeTab === tab.id ? 'text-yellow-400' : 'text-slate-500'}`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {/* 홈 */}
          {activeTab === 'home' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">안녕하세요, {session.user.name} 대표님 👋</h2>
                <p className="text-slate-400 text-sm">{today}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: '공급DB', value: stats?.lead, color: 'bg-blue-600', tab: 'customer' },
                  { label: '직접DB', value: stats?.db010, color: 'bg-purple-600', tab: 'customer' },
                  { label: '지속관리', value: stats?.emotional, color: 'bg-pink-600', tab: 'customer' },
                  { label: '계약완료', value: stats?.contracted, color: 'bg-emerald-600', tab: 'customer' },
                  { label: '총 고객수', value: stats?.total, color: 'bg-slate-600', tab: 'customer' },
                  { label: '계약 개수', value: stats?.totalWeight != null ? `${stats.totalWeight}개` : '-', color: 'bg-amber-600', tab: 'revenue' },
                  { label: '총 매출액', value: stats?.totalRevenue != null ? `${(stats.totalRevenue / 10000).toFixed(0)}만원` : '-', color: 'bg-green-700', tab: 'revenue' },
                  { label: '업무보고', value: '확인', color: 'bg-indigo-600', tab: 'report' },
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(s.tab)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:border-slate-500 transition-colors"
                  >
                    <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2`}>
                      {loadingStats ? '...' : (s.value ?? '-')}
                    </div>
                    <p className="text-slate-400 text-xs">{s.label}</p>
                  </button>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-slate-400 mb-3">메뉴</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TABS.filter(t => t.id !== 'home').map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:border-slate-600 transition-colors"
                  >
                    <span className="text-2xl block mb-2">{tab.icon}</span>
                    <p className="font-medium text-sm">{tab.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 고객관리 */}
          {activeTab === 'customer' && <CeoCustomerTab />}

          {/* 공급현황 */}
          {activeTab === 'supply' && <SupplyTab />}

          {/* DB이동 */}
          {activeTab === 'move_db' && <MoveDbTab />}

          {/* 한경연DB배정 */}
          {activeTab === 'assign_db' && <AssignDbTab />}

          {/* 심사요청 */}
          {activeTab === 'review' && <RequestsTab type="review" title="심사요청" />}

          {/* A/S요청 */}
          {activeTab === 'as_request' && <RequestsTab type="as" title="A/S요청" />}

          {/* 매출통계 */}
          {activeTab === 'revenue' && <CeoRevenueTab />}

          {/* AI 브리핑 */}
          {activeTab === 'briefing' && <BriefingTab />}

          {/* 공지사항 */}
          {activeTab === 'notice' && <NoticeBoard role="ceo" />}

          {/* 결제율 (구글시트) */}
          {activeTab === 'sheets' && <SheetsTab />}

          {/* 업무보고 */}
          {activeTab === 'report' && <ReportTab />}

          {/* 직원관리 */}
          {activeTab === 'users' && <UsersTab />}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}

/* ─── 고객관리 탭 ─── */
function CeoCustomerTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, lead, db010, emotional, trash, contracted
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === 'contracted') params.set('contracted', 'true');
    else if (filter !== 'all') params.set('sub_status', filter);
    const res = await fetch(`/api/customers?${params.toString()}`);
    if (res.ok) setCustomers(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function handleUpdate(id: string, updates: any) {
    const res = await fetch(`/api/customers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (res.ok) { const u = await res.json(); setCustomers(p => p.map(c => c.id === id ? u : c)); }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (res.ok) setCustomers(p => p.filter(c => c.id !== id));
  }

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return c.company_name?.toLowerCase().includes(q) || c.ceo_name?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-bold">고객관리</h3>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: 'all', label: '전체' },
            { value: 'lead', label: '공급DB' },
            { value: 'db010', label: '직접DB' },
            { value: 'emotional', label: '지속관리' },
            { value: 'trash', label: '자체거절' },
            { value: 'contracted', label: '계약완료' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${filter === f.value ? 'bg-yellow-500 text-black font-semibold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative min-w-[180px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="검색..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-500 pl-8"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors shrink-0">
          + 등록
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-12">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-500 py-12">데이터가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <CustomerCard key={c.id} customer={c} onUpdate={handleUpdate} onDelete={handleDelete} role="ceo" />
          ))}
        </div>
      )}

      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} onAdd={c => setCustomers(p => [c, ...p])} />}
    </div>
  );
}

/* ─── 공급현황 탭 ─── */
function SupplyTab() {
  const [contracted, setContracted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/customers?contracted=true');
      if (res.ok) setContracted(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  // 공급업체별 그룹
  const bySupplier = contracted.reduce((acc: Record<string, any[]>, c) => {
    const key = c.details?.supplier || '미정';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const totalWeight = contracted.reduce((s, c) => {
    const a = c.details?.payment_amount || 0;
    return s + (a <= 330000 ? 0.5 : 1);
  }, 0);

  // 결제율 기반 권장 공급 수 (예: 총 계약 가중치 기준)
  const recommended = Math.floor(totalWeight * 0.8);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">공급현황</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">총 계약 건수</p>
          <p className="text-2xl font-bold">{contracted.length}건</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">계약 총 개수 (가중치)</p>
          <p className="text-2xl font-bold text-blue-400">{totalWeight}개</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">권장 공급 수</p>
          <p className="text-2xl font-bold text-amber-400">{recommended}개</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-8">불러오는 중...</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(bySupplier).map(([supplier, items]) => {
            const w = items.reduce((s, c) => {
              const a = c.details?.payment_amount || 0;
              return s + (a <= 330000 ? 0.5 : 1);
            }, 0);
            return (
              <div key={supplier} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{supplier}</h4>
                  <span className="text-slate-400 text-sm">{items.length}건 ({w}개)</span>
                </div>
                <div className="space-y-2">
                  {items.map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm bg-slate-900 rounded-lg px-3 py-2">
                      <span>{c.company_name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{c.details?.supply_start_date || '-'}</span>
                        <span className="text-emerald-400 font-medium">{(c.details?.payment_amount || 0).toLocaleString()}원</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── DB이동 탭 ─── */
function MoveDbTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetUser, setTargetUser] = useState('');
  const [moving, setMoving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [custRes, usersRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/admin/users'),
      ]);
      if (custRes.ok) setCustomers(await custRes.json());
      if (usersRes.ok) setUsers((await usersRes.json()).filter((u: any) => u.role === 'sales'));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return c.company_name?.toLowerCase().includes(q) || c.ceo_name?.toLowerCase().includes(q);
  });

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleMove() {
    if (!targetUser || selectedIds.size === 0) return;
    setMoving(true);
    let ok = 0;
    for (const id of Array.from(selectedIds)) {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: targetUser }),
      });
      if (res.ok) ok++;
    }
    setMsg(`${ok}건 이동 완료`);
    setSelectedIds(new Set());
    const custRes = await fetch('/api/customers');
    if (custRes.ok) setCustomers(await custRes.json());
    setMoving(false);
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-bold">DB이동</h3>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <span className="text-sm text-slate-400">{selectedIds.size}건 선택</span>
            <select
              value={targetUser}
              onChange={e => setTargetUser(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="">담당자 선택</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button
              onClick={handleMove}
              disabled={!targetUser || moving}
              className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold text-sm px-4 py-1.5 rounded-lg"
            >
              {moving ? '이동 중...' : '이동'}
            </button>
          </div>
        )}
      </div>
      {msg && <p className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm rounded-lg px-3 py-2 mb-3">{msg}</p>}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="업체명, 대표자 검색..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 pl-8"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-8">불러오는 중...</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => toggleSelect(c.id)}
              className={`flex items-center gap-3 bg-slate-800 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                selectedIds.has(c.id) ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selectedIds.has(c.id) ? 'bg-yellow-500 border-yellow-500' : 'border-slate-600'}`}>
                {selectedIds.has(c.id) && <span className="text-black text-xs">✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.company_name}</p>
                <p className="text-slate-400 text-xs">{c.details?.sales_user_name || '미배정'} | {c.details?.sub_status || c.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 매출통계 탭 ─── */
function CeoRevenueTab() {
  const [contracted, setContracted] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [cRes, uRes] = await Promise.all([
        fetch('/api/customers?contracted=true'),
        fetch('/api/admin/users'),
      ]);
      if (cRes.ok) setContracted(await cRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      setLoading(false);
    }
    load();
  }, []);

  const totalRevenue = contracted.reduce((s, c) => s + (c.details?.payment_amount || 0), 0);
  const totalWeight = contracted.reduce((s, c) => {
    const a = c.details?.payment_amount || 0;
    return s + (a <= 330000 ? 0.5 : 1);
  }, 0);

  // 담당자별 통계
  const byOwner = contracted.reduce((acc: Record<string, { name: string; count: number; revenue: number; weight: number }>, c) => {
    const oid = c.owner_id || 'unknown';
    const u = users.find((u: any) => u.id === oid);
    const name = c.details?.sales_user_name || u?.name || oid;
    if (!acc[oid]) acc[oid] = { name, count: 0, revenue: 0, weight: 0 };
    acc[oid].count++;
    acc[oid].revenue += c.details?.payment_amount || 0;
    const a = c.details?.payment_amount || 0;
    acc[oid].weight += a <= 330000 ? 0.5 : 1;
    return acc;
  }, {});

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">매출통계</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">총 매출액</p>
          <p className="text-2xl font-bold text-emerald-400">{totalRevenue.toLocaleString()}원</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">계약 건수</p>
          <p className="text-2xl font-bold">{contracted.length}건</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">계약 개수 (가중치)</p>
          <p className="text-2xl font-bold text-blue-400">{totalWeight}개</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-8">불러오는 중...</p>
      ) : (
        <>
          <h4 className="text-sm font-semibold text-slate-400 mb-3">담당자별 실적</h4>
          <div className="space-y-3 mb-6">
            {Object.entries(byOwner).sort((a, b) => b[1].revenue - a[1].revenue).map(([id, d]) => (
              <div key={id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-slate-400 text-xs">{d.count}건 · 가중치 {d.weight}개</p>
                </div>
                <p className="text-emerald-400 font-bold">{d.revenue.toLocaleString()}원</p>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-slate-400 mb-3">전체 계약 목록</h4>
          <div className="space-y-2">
            {contracted.map(c => {
              const amt = c.details?.payment_amount || 0;
              const weight = amt <= 330000 ? 0.5 : 1;
              return (
                <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{c.company_name}</p>
                    <p className="text-slate-400 text-xs">{c.details?.sales_user_name} | {c.details?.contract_date || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{amt.toLocaleString()}원</p>
                    <p className="text-xs text-slate-400">가중치: {weight}개</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── 직원관리 탭 ─── */
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', name: '', password: '', user_role: 'sales' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const u = await res.json();
      setUsers(p => [...p, u]);
      setForm({ username: '', name: '', password: '', user_role: 'sales' });
      setShowForm(false);
      setMsg('직원이 등록되었습니다.');
      setTimeout(() => setMsg(''), 3000);
    } else {
      const d = await res.json();
      setMsg(d.error || '등록 실패');
    }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${name} 직원을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    if (res.ok) setUsers(p => p.filter(u => u.id !== id));
  }

  const ROLE_LABELS: Record<string, string> = { ceo: '대표', sales: '영업', ops: '관리팀' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">직원관리</h3>
        <button onClick={() => setShowForm(!showForm)} className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold text-sm px-4 py-1.5 rounded-lg">
          {showForm ? '취소' : '+ 직원 추가'}
        </button>
      </div>

      {msg && <p className="bg-blue-900/40 border border-blue-700 text-blue-300 text-sm rounded-lg px-3 py-2 mb-3">{msg}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-5 space-y-3">
          <h4 className="font-semibold">신규 직원 등록</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs block mb-1">아이디 *</label>
              <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">이름 *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">비밀번호 *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">역할 *</label>
              <select value={form.user_role} onChange={e => setForm(f => ({ ...f, user_role: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500">
                <option value="sales">영업</option>
                <option value="ops">관리팀</option>
                <option value="ceo">대표</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold py-2 rounded-lg">
            {saving ? '등록 중...' : '등록'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-slate-500 py-8">불러오는 중...</p>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{u.name}</p>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{ROLE_LABELS[u.role] || u.role}</span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">@{u.username}</p>
              </div>
              <button onClick={() => handleDelete(u.id, u.name)}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-900/20 transition-colors">
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 한경연 DB배정 탭 ─── */
function AssignDbTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetUser, setTargetUser] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState('');
  const [filterOwner, setFilterOwner] = useState('unassigned');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [custRes, usersRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/admin/users'),
      ]);
      if (custRes.ok) setCustomers(await custRes.json());
      if (usersRes.ok) setUsers((await usersRes.json()).filter((u: any) => u.role === 'sales'));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.company_name?.toLowerCase().includes(q) || c.ceo_name?.toLowerCase().includes(q);
    const matchOwner = filterOwner === 'all' ? true : filterOwner === 'unassigned' ? !c.owner_id : c.owner_id === filterOwner;
    return matchSearch && matchOwner;
  });

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  async function handleAssign() {
    if (!targetUser || selectedIds.size === 0) return;
    setAssigning(true);
    let ok = 0;
    const targetUserObj = users.find(u => u.id === targetUser);
    for (const id of Array.from(selectedIds)) {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: targetUser,
          details: { sales_user_name: targetUserObj?.name },
        }),
      });
      if (res.ok) ok++;
    }
    setMsg(`${ok}건 배정 완료 → ${targetUserObj?.name}`);
    setSelectedIds(new Set());
    const res = await fetch('/api/customers');
    if (res.ok) setCustomers(await res.json());
    setAssigning(false);
    setTimeout(() => setMsg(''), 4000);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-bold">한경연 DB배정</h3>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: 'unassigned', label: '미배정' },
            { value: 'all', label: '전체' },
            ...users.map(u => ({ value: u.id, label: u.name })),
          ].map(f => (
            <button key={f.value} onClick={() => setFilterOwner(f.value)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${filterOwner === f.value ? 'bg-yellow-500 text-black font-semibold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-slate-800 border border-yellow-600/40 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-yellow-400 font-semibold">{selectedIds.size}건 선택됨</span>
          <select value={targetUser} onChange={e => setTargetUser(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
            <option value="">담당자 선택</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <button onClick={handleAssign} disabled={!targetUser || assigning}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold text-sm px-4 py-1.5 rounded-lg">
            {assigning ? '배정 중...' : '배정'}
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-slate-400 text-sm">취소</button>
        </div>
      )}

      {msg && <p className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm rounded-lg px-3 py-2 mb-3">{msg}</p>}

      <div className="relative mb-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="업체명, 대표자 검색..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 pl-8" />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
      </div>

      {loading ? <p className="text-center text-slate-500 py-8">불러오는 중...</p> : (
        <div className="space-y-2">
          {filtered.map(c => {
            const ownerName = c.details?.sales_user_name || users.find((u: any) => u.id === c.owner_id)?.name || '미배정';
            return (
              <div key={c.id} onClick={() => toggleSelect(c.id)}
                className={`flex items-center gap-3 bg-slate-800 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${selectedIds.has(c.id) ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-700 hover:border-slate-500'}`}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selectedIds.has(c.id) ? 'bg-yellow-500 border-yellow-500' : 'border-slate-600'}`}>
                  {selectedIds.has(c.id) && <span className="text-black text-xs">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{c.company_name}</p>
                  <p className="text-xs text-slate-400">{c.details?.sub_status || c.status} | {c.details?.business_type || '-'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.owner_id ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-600/50 text-slate-400'}`}>
                  {ownerName}
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-slate-500 py-8">해당 조건의 데이터가 없습니다.</p>}
        </div>
      )}
    </div>
  );
}

/* ─── 요청 탭 (심사요청 / A/S요청) ─── */
const REQ_STATUS_LABELS: Record<string, string> = { pending: '대기', approved: '승인', rejected: '반려', done: '완료' };
const REQ_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  done: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function RequestsTab({ type, title }: { type: string; title: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ type });
    if (filter !== 'all') params.set('status', filter);
    const res = await fetch(`/api/requests?${params.toString()}`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, [type, filter]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_status: status }),
    });
    if (res.ok) {
      if (filter !== 'all') setItems(p => p.filter(r => r.id !== id));
      else { const u = await res.json(); setItems(p => p.map(r => r.id === id ? u : r)); }
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex gap-1.5">
          {[{ value: 'pending', label: '대기' }, { value: 'all', label: '전체' }, { value: 'approved', label: '승인' }, { value: 'done', label: '완료' }].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${filter === f.value ? 'bg-yellow-500 text-black font-semibold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-center text-slate-500 py-8">불러오는 중...</p> : items.length === 0 ? (
        <div className="text-center text-slate-500 py-16">
          <p className="text-4xl mb-3">{type === 'review' ? '📋' : '🔧'}</p>
          <p>해당 {title}이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(r => (
            <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${REQ_STATUS_COLORS[r.request_status]}`}>
                    {REQ_STATUS_LABELS[r.request_status]}
                  </span>
                  <span className="font-semibold">{r.company_name || r.title}</span>
                  <span className="text-slate-400 text-sm">{r.requester_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString('ko-KR')}</span>
                  <span className="text-slate-500 text-sm">{expandedId === r.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedId === r.id && (
                <div className="border-t border-slate-700 px-4 py-4 space-y-3">
                  {r.content && <p className="text-sm text-slate-200 bg-slate-900 rounded-lg p-3 whitespace-pre-wrap">{r.content}</p>}
                  {r.request_status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusChange(r.id, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-lg">승인</button>
                      <button onClick={() => handleStatusChange(r.id, 'rejected')}
                        className="bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg">반려</button>
                    </div>
                  )}
                  {r.request_status === 'approved' && (
                    <button onClick={() => handleStatusChange(r.id, 'done')}
                      className="bg-slate-600 hover:bg-slate-500 text-white text-sm px-4 py-1.5 rounded-lg">완료 처리</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── AI 브리핑 탭 ─── */
function BriefingTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/briefing');
      if (res.ok) setData(await res.json());
      else { const d = await res.json(); setError(d.error || '생성 실패'); }
    } catch { setError('네트워크 오류'); }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">🤖 AI 일일 브리핑</h3>
        <button onClick={generate} disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold px-5 py-2 rounded-xl transition-colors">
          {loading ? '생성 중...' : '브리핑 생성'}
        </button>
      </div>

      {error && <p className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>}

      {!data && !loading && (
        <div className="text-center text-slate-500 py-20">
          <p className="text-5xl mb-4">🤖</p>
          <p className="text-lg mb-2">AI 브리핑</p>
          <p className="text-sm">버튼을 클릭하면 오늘의 업무보고와 통계를 AI가 분석해<br/>대표님을 위한 브리핑을 생성합니다.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 animate-pulse">🤖</div>
          <p className="text-slate-400">AI가 분석 중입니다...</p>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          {/* 현황 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '신규DB', value: data.stats.lead },
              { label: '계약업체', value: data.stats.contracted },
              { label: '총 고객수', value: data.stats.total },
              { label: '총 매출', value: `${Math.round(data.stats.totalRevenue / 10000)}만원` },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* AI 브리핑 텍스트 */}
          <div className="bg-slate-800 border border-yellow-600/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400 font-semibold text-sm">AI 분석 결과</span>
              <span className="text-slate-500 text-xs">{data.date}</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{data.briefing}</p>
          </div>

          {/* 오늘 보고 목록 */}
          {data.reports?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">오늘 제출된 보고 ({data.reports.length}건)</h4>
              <div className="space-y-2">
                {data.reports.map((r: any) => (
                  <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{r.report_type}</span>
                      <span className="text-slate-400 text-xs">{r.author_name}</span>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── 구글시트 결제율 탭 ─── */
function SheetsTab() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [range, setRange] = useState('Sheet1!A1:Z50');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/sheets?range=${encodeURIComponent(range)}`);
      const d = await res.json();
      if (res.ok) setData(d.data || []);
      else setError(d.error || '불러오기 실패');
    } catch { setError('네트워크 오류'); }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-bold">📊 결제율 (구글시트)</h3>
        <input type="text" value={range} onChange={e => setRange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-500 w-48"
          placeholder="범위 (예: Sheet1!A1:Z50)" />
        <button onClick={load} disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold text-sm px-4 py-1.5 rounded-lg">
          {loading ? '불러오는 중...' : '불러오기'}
        </button>
      </div>

      {error && <p className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>}

      {data.length === 0 && !loading ? (
        <div className="text-center text-slate-500 py-20">
          <p className="text-4xl mb-3">📊</p>
          <p>불러오기 버튼을 클릭하세요</p>
          <p className="text-xs mt-2">연결된 구글 스프레드시트: {process.env.NEXT_PUBLIC_SHEETS_ID || '설정됨'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className={i === 0 ? 'bg-slate-700' : i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-850'}>
                  {row.map((cell, j) => (
                    <td key={j} className={`px-3 py-2 border border-slate-700 ${i === 0 ? 'font-semibold text-white' : 'text-slate-300'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
