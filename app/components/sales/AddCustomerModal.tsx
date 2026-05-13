'use client';
import { useState } from 'react';

interface Props {
  defaultSubStatus?: string;
  onClose: () => void;
  onAdd: (customer: any) => void;
}

export default function AddCustomerModal({ defaultSubStatus = 'lead', onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    company_name: '',
    ceo_name: '',
    phone: '',
    business_address: '',
    business_type: '',
    consultation_date: new Date().toISOString().split('T')[0],
    next_call_date: '',
    consultation_notes: '',
    reaction: '',
    result: '',
    sub_status: defaultSubStatus,
    memo: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim()) {
      setError('업체명을 입력해주세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name,
          ceo_name: form.ceo_name,
          phone: form.phone,
          status: 'active',
          details: {
            business_address: form.business_address,
            business_type: form.business_type,
            consultation_date: form.consultation_date,
            next_call_date: form.next_call_date,
            consultation_notes: form.consultation_notes,
            reaction: form.reaction,
            result: form.result,
            sub_status: form.sub_status,
            memo: form.memo,
          },
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || '저장 실패');
        setSaving(false);
        return;
      }
      const data = await res.json();
      onAdd(data);
      onClose();
    } catch {
      setError('네트워크 오류');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold">신규 고객 등록</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-slate-400 text-xs block mb-1">업체명 *</label>
              <input
                type="text"
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="업체명 입력"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">대표자</label>
              <input
                type="text"
                value={form.ceo_name}
                onChange={e => setForm(f => ({ ...f, ceo_name: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">연락처</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="010-0000-0000"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">사업주소</label>
              <input
                type="text"
                value={form.business_address}
                onChange={e => setForm(f => ({ ...f, business_address: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">사업종류</label>
              <input
                type="text"
                value={form.business_type}
                onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">상담일</label>
              <input
                type="date"
                value={form.consultation_date}
                onChange={e => setForm(f => ({ ...f, consultation_date: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">재통화일정</label>
              <input
                type="date"
                value={form.next_call_date}
                onChange={e => setForm(f => ({ ...f, next_call_date: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">반응</label>
              <select
                value={form.reaction}
                onChange={e => setForm(f => ({ ...f, reaction: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">선택</option>
                <option>긍정</option>
                <option>중립</option>
                <option>부정</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">결과</label>
              <select
                value={form.result}
                onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">선택</option>
                <option>보류</option>
                <option>계약</option>
                <option>거절</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">DB 상태</label>
              <select
                value={form.sub_status}
                onChange={e => setForm(f => ({ ...f, sub_status: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="lead">신규DB</option>
                <option value="db010">010DB</option>
                <option value="emotional">감성톡</option>
                <option value="trash">거절</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs block mb-1">상담내용</label>
            <textarea
              value={form.consultation_notes}
              onChange={e => setForm(f => ({ ...f, consultation_notes: e.target.value }))}
              rows={4}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="상담 내용을 입력하세요..."
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs block mb-1">메모</label>
            <textarea
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
              rows={2}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {saving ? '저장 중...' : '등록'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
