'use client';
import { useState, useEffect } from 'react';

interface Notice {
  id: string;
  title: string;
  content: string;
  author_name: string;
  is_pinned: boolean;
  created_at: string;
}

interface Props {
  role: string;
}

export default function NoticeBoard({ role }: Props) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/notices');
    if (res.ok) setNotices(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      setNotices(p => [d, ...p]);
      setForm({ title: '', content: '', is_pinned: false });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
    if (res.ok) setNotices(p => p.filter(n => n.id !== id));
  }

  const pinned = notices.filter(n => n.is_pinned);
  const normal = notices.filter(n => !n.is_pinned);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">📢 공지사항</h3>
        {role === 'ceo' && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold text-sm px-4 py-1.5 rounded-lg">
            {showForm ? '취소' : '+ 공지 작성'}
          </button>
        )}
      </div>

      {showForm && role === 'ceo' && (
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-5 space-y-3">
          <div>
            <label className="text-slate-400 text-xs block mb-1">제목 *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">내용</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))}
              className="w-4 h-4 accent-yellow-500" />
            <span className="text-sm text-slate-300">상단 고정</span>
          </label>
          <button type="submit" disabled={saving}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold py-2 rounded-lg">
            {saving ? '저장 중...' : '공지 등록'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-slate-500 py-8">불러오는 중...</p>
      ) : notices.length === 0 ? (
        <div className="text-center text-slate-500 py-16">
          <p className="text-4xl mb-3">📢</p>
          <p>등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* 고정 공지 */}
          {pinned.map(n => (
            <NoticeItem key={n.id} notice={n} expanded={expandedId === n.id}
              onToggle={() => setExpandedId(expandedId === n.id ? null : n.id)}
              onDelete={role === 'ceo' ? () => handleDelete(n.id) : undefined}
              pinned />
          ))}
          {/* 일반 공지 */}
          {normal.map(n => (
            <NoticeItem key={n.id} notice={n} expanded={expandedId === n.id}
              onToggle={() => setExpandedId(expandedId === n.id ? null : n.id)}
              onDelete={role === 'ceo' ? () => handleDelete(n.id) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoticeItem({ notice, expanded, onToggle, onDelete, pinned }: {
  notice: Notice; expanded: boolean; onToggle: () => void;
  onDelete?: () => void; pinned?: boolean;
}) {
  return (
    <div className={`bg-slate-800 border rounded-xl overflow-hidden ${pinned ? 'border-yellow-600/50' : 'border-slate-700'}`}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {pinned && <span className="text-yellow-400 text-xs shrink-0">📌</span>}
          <span className="font-semibold truncate">{notice.title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-500 text-xs">{notice.author_name} · {new Date(notice.created_at).toLocaleDateString('ko-KR')}</span>
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              className="text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded hover:bg-red-900/20">삭제</button>
          )}
          <span className="text-slate-500 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && notice.content && (
        <div className="border-t border-slate-700 px-4 py-3">
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{notice.content}</p>
        </div>
      )}
    </div>
  );
}
