'use client';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import AIAssistant from '../AIAssistant';
import CustomerBoard from './CustomerBoard';
import ReportTab from './ReportTab';
import RequestModal from './RequestModal';

const TABS = [
  { id: 'home', label: '홈보드', icon: '🏠' },
  { id: 'lead', label: '고객DB', icon: '📋' },
  { id: 'db010', label: '010DB', icon: '📱' },
  { id: 'contracted', label: '계약업체', icon: '✅' },
  { id: 'emotional', label: '감성톡', icon: '💬' },
  { id: 'trash', label: '거절', icon: '🗑️' },
  { id: 'revenue', label: '매출현황', icon: '💰' },
  { id: 'review', label: '심사요청', icon: '📋' },
  { id: 'as', label: 'A/S요청', icon: '🔧' },
  { id: 'report', label: '업무보고', icon: '📝' },
];

interface Stats {
  lead: number;
  db010: number;
  emotional: number;
  trash: number;
  contracted: number;
  total: number;
}

export default function SalesDashboard({ session }: { session: any }) {
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState<Stats>({ lead: 0, db010: 0, emotional: 0, trash: 0, contracted: 0, total: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/customers');
        if (res.ok) {
          const data: any[] = await res.json();
          const s: Stats = { lead: 0, db010: 0, emotional: 0, trash: 0, contracted: 0, total: data.length };
          for (const c of data) {
            if (c.status === 'contracted') s.contracted++;
            else if (c.details?.sub_status === 'lead') s.lead++;
            else if (c.details?.sub_status === 'db010') s.db010++;
            else if (c.details?.sub_status === 'emotional') s.emotional++;
            else if (c.details?.sub_status === 'trash') s.trash++;
          }
          setStats(s);
        }
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* 네비게이션 */}
      <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold">원픽스파트너스 CRM</span>
          <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">영업팀</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm hidden sm:block">{session.user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 (데스크톱) */}
        <aside className="hidden md:flex flex-col w-48 bg-slate-800 border-r border-slate-700 shrink-0">
          <div className="p-4 border-b border-slate-700">
            <p className="text-xs text-slate-500">담당자</p>
            <p className="font-semibold">{session.user.name}</p>
          </div>
          <nav className="flex-1 py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-blue-600/20 text-blue-300 border-r-2 border-blue-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* 모바일 탭 바 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex overflow-x-auto z-40">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 text-xs shrink-0 transition-colors ${
                activeTab === tab.id ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {/* 홈보드 */}
          {activeTab === 'home' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">안녕하세요, {session.user.name}님 👋</h2>
                <p className="text-slate-400 text-sm">{today}</p>
              </div>

              {/* 통계 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                {[
                  { label: '신규DB', value: stats.lead, color: 'bg-blue-600', tab: 'lead' },
                  { label: '010DB', value: stats.db010, color: 'bg-purple-600', tab: 'db010' },
                  { label: '감성톡', value: stats.emotional, color: 'bg-pink-600', tab: 'emotional' },
                  { label: '거절', value: stats.trash, color: 'bg-red-600', tab: 'trash' },
                  { label: '계약업체', value: stats.contracted, color: 'bg-emerald-600', tab: 'contracted' },
                ].map(s => (
                  <button
                    key={s.tab}
                    onClick={() => setActiveTab(s.tab)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:border-slate-500 transition-colors"
                  >
                    <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2`}>
                      {loadingStats ? '-' : s.value}
                    </div>
                    <p className="text-slate-400 text-xs">{s.label}</p>
                  </button>
                ))}
              </div>

              {/* 빠른 바로가기 */}
              <h3 className="text-sm font-semibold text-slate-400 mb-3">바로가기</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TABS.filter(t => t.id !== 'home').map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-750 hover:border-slate-600 transition-colors"
                  >
                    <span className="text-2xl block mb-2">{tab.icon}</span>
                    <p className="font-medium text-sm">{tab.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 고객DB */}
          {activeTab === 'lead' && (
            <CustomerBoard
              subStatus="lead"
              title="고객DB (신규)"
              emptyMsg="등록된 신규 고객이 없습니다."
              defaultSubStatus="lead"
              role={session.user.role}
            />
          )}

          {/* 010DB */}
          {activeTab === 'db010' && (
            <CustomerBoard
              subStatus="db010"
              title="010DB"
              emptyMsg="등록된 010DB가 없습니다."
              defaultSubStatus="db010"
              role={session.user.role}
            />
          )}

          {/* 계약업체 */}
          {activeTab === 'contracted' && (
            <CustomerBoard
              contracted
              title="계약업체"
              emptyMsg="등록된 계약업체가 없습니다."
              role={session.user.role}
            />
          )}

          {/* 감성톡 */}
          {activeTab === 'emotional' && (
            <CustomerBoard
              subStatus="emotional"
              title="감성톡"
              emptyMsg="등록된 감성톡 고객이 없습니다."
              defaultSubStatus="emotional"
              role={session.user.role}
            />
          )}

          {/* 거절 */}
          {activeTab === 'trash' && (
            <CustomerBoard
              subStatus="trash"
              title="거절 DB"
              emptyMsg="거절 고객이 없습니다."
              defaultSubStatus="trash"
              role={session.user.role}
            />
          )}

          {/* 매출현황 */}
          {activeTab === 'revenue' && <RevenueTab />}

          {/* 심사요청 */}
          {activeTab === 'review' && <SalesRequestTab type="review" />}

          {/* A/S요청 */}
          {activeTab === 'as' && <SalesRequestTab type="as" />}

          {/* 업무보고 */}
          {activeTab === 'report' && <ReportTab />}
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}

function RevenueTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/customers?contracted=true');
      if (res.ok) setCustomers(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  const totalAmount = customers.reduce((sum, c) => sum + (c.details?.payment_amount || 0), 0);
  const totalWeight = customers.reduce((sum, c) => {
    const amt = c.details?.payment_amount || 0;
    return sum + (amt <= 330000 ? 0.5 : 1);
  }, 0);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">매출현황</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">계약 총액</p>
          <p className="text-2xl font-bold text-emerald-400">{totalAmount.toLocaleString()}원</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">계약 건수</p>
          <p className="text-2xl font-bold">{customers.length}건</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">계약 개수 (가중치)</p>
          <p className="text-2xl font-bold text-blue-400">{totalWeight}개</p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-8">불러오는 중...</p>
      ) : customers.length === 0 ? (
        <p className="text-slate-500 text-center py-8">계약 내역이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {customers.map(c => {
            const amt = c.details?.payment_amount || 0;
            const weight = amt <= 330000 ? 0.5 : 1;
            return (
              <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.company_name}</p>
                  <p className="text-slate-400 text-xs">{c.details?.contract_date || '-'} | {c.details?.supplier || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{amt.toLocaleString()}원</p>
                  <p className="text-xs text-slate-400">가중치: {weight}개</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── 영업팀 요청 탭 ─── */
const REQ_STATUS_LABELS: Record<string, string> = { pending: '대기', approved: '승인', rejected: '반려', done: '완료' };
const REQ_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  done: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function SalesRequestTab({ type }: { type: 'review' | 'as' }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/requests?type=${type}`);
      if (res.ok) setItems(await res.json());
      setLoading(false);
    }
    load();
  }, [type]);

  const title = type === 'review' ? '심사요청' : 'A/S요청';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg">
          + 요청 등록
        </button>
      </div>

      {loading ? <p className="text-center text-slate-500 py-8">불러오는 중...</p> :
        items.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            <p className="text-4xl mb-3">{type === 'review' ? '📋' : '🔧'}</p>
            <p>등록된 {title}이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(r => (
              <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${REQ_STATUS_COLORS[r.request_status]}`}>
                    {REQ_STATUS_LABELS[r.request_status]}
                  </span>
                  <span className="font-semibold">{r.company_name}</span>
                  <span className="text-slate-500 text-xs ml-auto">{new Date(r.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                {r.content && <p className="text-sm text-slate-300 mt-1">{r.content}</p>}
              </div>
            ))}
          </div>
        )
      }

      {showModal && (
        <RequestModal type={type} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
