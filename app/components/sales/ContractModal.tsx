'use client';
import { useState } from 'react';

interface Props {
  customer: any;
  onClose: () => void;
  onContracted: (updated: any) => void;
}

export default function ContractModal({ customer, onClose, onContracted }: Props) {
  const [form, setForm] = useState({
    contract_date: new Date().toISOString().split('T')[0],
    payment_amount: '',
    payment_method: '',
    supplier: '',
    supply_start_date: '',
    contract_memo: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const paymentAmount = parseInt(form.payment_amount) || 0;
  const weight = paymentAmount <= 330000 ? 0.5 : 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.payment_amount) { setError('계약금액을 입력해주세요.'); return; }
    setSaving(true);
    setError('');

    const res = await fetch(`/api/customers/${customer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'contracted',
        details: {
          ...customer.details,
          contract_date: form.contract_date,
          payment_amount: paymentAmount,
          payment_method: form.payment_method,
          supplier: form.supplier,
          supply_start_date: form.supply_start_date,
          contract_memo: form.contract_memo,
        },
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      onContracted(updated);
      onClose();
    } else {
      const d = await res.json();
      setError(d.error || '저장 실패');
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-emerald-700/50 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-emerald-400">✅ 계약 처리</h2>
            <p className="text-slate-400 text-sm mt-0.5">{customer.company_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs block mb-1">계약일 *</label>
              <input type="date" value={form.contract_date} onChange={e => setForm(f => ({ ...f, contract_date: e.target.value }))} required
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">계약금액 *</label>
              <input type="number" value={form.payment_amount} onChange={e => setForm(f => ({ ...f, payment_amount: e.target.value }))} required placeholder="330000"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">결제수단</label>
              <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                <option value="">선택</option>
                <option>카드</option>
                <option>계좌이체</option>
                <option>현금</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">공급업체</label>
              <input type="text" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">공급시작일</label>
              <input type="date" value={form.supply_start_date} onChange={e => setForm(f => ({ ...f, supply_start_date: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs block mb-1">계약 메모</label>
            <textarea value={form.contract_memo} onChange={e => setForm(f => ({ ...f, contract_memo: e.target.value }))} rows={2}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" />
          </div>

          {/* 가중치 미리보기 */}
          {paymentAmount > 0 && (
            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-4 py-3 text-sm">
              <span className="text-emerald-400 font-semibold">{paymentAmount.toLocaleString()}원</span>
              <span className="text-slate-400 mx-2">→ 계약 가중치</span>
              <span className="text-white font-bold">{weight}개</span>
              <span className="text-slate-500 text-xs ml-2">(33만원 이하 = 0.5개, 초과 = 1개)</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors">
              {saving ? '처리 중...' : '계약 처리 완료'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition-colors">
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
