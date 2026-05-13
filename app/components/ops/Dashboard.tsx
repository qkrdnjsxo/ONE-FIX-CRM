'use client';
import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import AIAssistant from '../AIAssistant';
import ReportTab from '../sales/ReportTab';

const TABS = [
  { id: 'home', label: '홈보드', icon: '🏠' },
  { id: 'new', label: '신규건', icon: '🆕' },
  { id: 'ongoing', label: '진행현황', icon: '📊' },
  { id: 'as', label: 'A/S 요청', icon: '🔧' },
  { id: 'report', label: '업무보고', icon: '📝' },
];

interface OpsCase {
  id: string;
  company_name: string;
  contact?: string;
  case_status: string;
  description?: string;
  notes?: string;
  handler_name?: string;
  created_at: string;
  details?: any;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  ongoing: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  as_request: 'bg-red-500/20 text-red-300 border-red-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};
const STATUS_LABELS: Record<string, string> = {
  new: '신규', ongoing: '진행중', as_request: 'A/S 요청', closed: '완료',
};

export default function OpsDashboard({ session }: { session: any }) {
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState({ new: 0, ongoing: 0, as_request: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function load() {
      setLoadingStats(true);
      const res = await fetch('/api/ops-cases');
      if (res.ok) {
        const data: OpsCase[] = await res.json();
        const s = { new: 0, ongoing: 0, as_request: 0 };
        for (const c of data) {
          if (c.case_status === 'new') s.new++;
          else if (c.case_status === 'ongoing') s.ongoing++;
          else if (c.case_status === 'as_request') s.as_request++;
        }
        setStats(s);
      }
      setLoadingStats(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold">원픽스파트너스 CRM</span>
          <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/30">관리팀</span>
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
            <p className="text-xs text-slate-500">관리팀</p>
            <p className="font-semibold">{session.user.name}</p>
          </div>
          <nav className="flex-1 py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-green-600/20 text-green-300 border-r-2 border-green-500'
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
              className={`flex flex-col items-center py-2 px-4 text-xs shrink-0 transition-colors ${activeTab === tab.id ? 'text-green-400' : 'text-slate-500'}`}
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
                <h2 className="text-xl font-bold mb-1">안녕하세요, {session.user.name}님 👋</h2>
                <p className="text-slate-400 text-sm">관리팀 대시보드</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: '신규건', value: stats.new, color: 'bg-blue-600', tab: 'new' },
                  { label: '진행현황', value: stats.ongoing, color: 'bg-amber-600', tab: 'ongoing' },
                  { label: 'A/S 요청', value: stats.as_request, color: 'bg-red-600', tab: 'as' },
                ].map(s => (
                  <button key={s.tab} onClick={() => setActiveTab(s.tab)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-left hover:border-slate-500 transition-colors">
                    <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white font-bold mb-2`}>
                      {loadingStats ? '-' : s.value}
                    </div>
                    <p className="text-slate-400 text-xs">{s.label}</p>
                  </button>
                ))}
              </div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3">바로가기</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TABS.filter(t => t.id !== 'home').map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:border-slate-600 transition-colors">
                    <span className="text-2xl block mb-2">{tab.icon}</span>
                    <p className="font-medium text-sm">{tab.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'new' && <OpsCaseBoard status="new" title="신규건" />}
          {activeTab === 'ongoing' && <OpsCaseBoard status="ongoing" title="진행현황" />}
          {activeTab === 'as' && <OpsCaseBoard status="as_request" title="A/S 요청" />}
          {activeTab === 'report' && <ReportTab />}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}

/* ─── Ops Case Board ─── */
function OpsCaseBoard({ status, title }: { status: string; title: string }) {
  const [cases, setCases] = useState<OpsCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact: '',
    description: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/ops-cases?case_status=${status}`);
    if (res.ok) setCases(await res.json());
    setLoading(false);
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/ops-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, case_status: status }),
    });
    if (res.ok) {
      const d = await res.json();
      setCases(p => [d, ...p]);
      setForm({ company_name: '', contact: '', description: '', notes: '' });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await fetch(`/api/ops-cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_status: newStatus }),
    });
    if (res.ok) {
      if (newStatus !== status) setCases(p => p.filter(c => c.id !== id));
      else { const u = await res.json(); setCases(p => p.map(c => c.id === id ? u : c)); }
    }
  }

  async function handleEditSave(id: string) {
    const res = await fetch(`/api/ops-cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const u = await res.json();
      setCases(p => p.map(c => c.id === id ? u : c));
      setEditId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    const res = await fetch(`/api/ops-cases/${id}`, { method: 'DELETE' });
    if (res.ok) setCases(p => p.filter(c => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">{title}</h3>
          <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{cases.length}건</span>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
          {showForm ? '취소' : '+ 등록'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs block mb-1">업체명 *</label>
              <input type="text" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} required
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">연락처</label>
              <input type="text" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">내용</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 resize-none" />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">메모</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 resize-none" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg">
            {saving ? '저장 중...' : '등록'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-slate-500 py-8">불러오는 중...</p>
      ) : cases.length === 0 ? (
        <div className="text-center text-slate-500 py-16">
          <p className="text-4xl mb-3">📋</p>
          <p>등록된 케이스가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map(c => (
            <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-750"
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[c.case_status]}`}>
                    {STATUS_LABELS[c.case_status]}
                  </span>
                  <span className="font-semibold">{c.company_name}</span>
                  {c.contact && <span className="text-slate-400 text-sm hidden sm:block">{c.contact}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                  <span className="text-slate-500 text-sm">{expandedId === c.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedId === c.id && (
                <div className="border-t border-slate-700 px-4 py-4">
                  {editId !== c.id ? (
                    <div className="space-y-3">
                      {c.description && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1">내용</p>
                          <p className="text-sm text-slate-200 whitespace-pre-wrap bg-slate-900 rounded-lg p-3">{c.description}</p>
                        </div>
                      )}
                      {c.notes && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1">메모</p>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-900 rounded-lg p-3">{c.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {/* 상태 변경 */}
                        {Object.entries(STATUS_LABELS).filter(([k]) => k !== c.case_status && k !== 'closed').map(([k, v]) => (
                          <button key={k} onClick={() => handleStatusChange(c.id, k)}
                            className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                            → {v}
                          </button>
                        ))}
                        <button onClick={() => handleStatusChange(c.id, 'closed')}
                          className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-lg">
                          완료 처리
                        </button>
                        <button onClick={() => { setEditId(c.id); setEditForm({ company_name: c.company_name, contact: c.contact || '', description: c.description || '', notes: c.notes || '' }); }}
                          className="text-xs px-3 py-1 bg-blue-700 hover:bg-blue-600 text-blue-200 rounded-lg">
                          수정
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="text-xs px-3 py-1 bg-red-800 hover:bg-red-700 text-red-300 rounded-lg">
                          삭제
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs block mb-1">업체명</label>
                          <input type="text" value={editForm.company_name} onChange={e => setEditForm((f: any) => ({ ...f, company_name: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs block mb-1">연락처</label>
                          <input type="text" value={editForm.contact} onChange={e => setEditForm((f: any) => ({ ...f, contact: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs block mb-1">내용</label>
                        <textarea value={editForm.description} onChange={e => setEditForm((f: any) => ({ ...f, description: e.target.value }))} rows={3}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs block mb-1">메모</label>
                        <textarea value={editForm.notes} onChange={e => setEditForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditSave(c.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-lg">저장</button>
                        <button onClick={() => setEditId(null)} className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-1.5 rounded-lg">취소</button>
                      </div>
                    </div>
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
