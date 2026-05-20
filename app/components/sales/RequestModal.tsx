'use client';
import { useState } from 'react';

interface Props {
  type: 'review' | 'as';
  customer?: any;
  onClose: () => void;
}

const TITLES = { review: '심사요청', as: 'A/S요청' };

export default function RequestModal({ type, customer, onClose }: Props) {
  const [form, setForm] = useState({
    company_name: customer?.company_name || '',
    content: '',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_type: type,
        company_name: form.company_name,
        content: form.content,
        customer_id: customer?.id,
      }),
    });
    if (res.ok) { setDone(true); setTimeout(onClose, 1500); }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold">{TITLES[type]}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {done && <p className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm rounded-lg px-4 py-2">요청이 접수되었습니다.</p>}
          <div>
            <label className="text-slate-400 text-xs block mb-1">업체명</label>
            <input type="text" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">요청 내용</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} required
              placeholder={type === 'review' ? '심사 요청 사항을 입력하세요...' : 'A/S 요청 내용을 입력하세요...'}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving || done}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl">
              {saving ? '전송 중...' : '요청 전송'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl">취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}
