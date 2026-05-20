'use client';
import { useState } from 'react';
import ContractModal from './ContractModal';

const STATUS_LABELS: Record<string, string> = {
  lead: '공급DB',
  db010: '직접DB',
  emotional: '지속관리',
  trash: '자체거절',
  contracted: '계약완료',
};

const STATUS_COLORS: Record<string, string> = {
  lead: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  db010: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  emotional: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  trash: 'bg-red-500/20 text-red-300 border-red-500/30',
  contracted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

interface Customer {
  id: string;
  company_name: string;
  ceo_name?: string;
  phone?: string;
  status: string;
  details: {
    sub_status?: string;
    business_address?: string;
    business_type?: string;
    consultation_date?: string;
    next_call_date?: string;
    consultation_notes?: string;
    reaction?: string;
    result?: string;
    sales_user_name?: string;
    original_source?: string;
    contract_date?: string;
    payment_amount?: number;
    payment_method?: string;
    supplier?: string;
    supply_start_date?: string;
    memo?: string;
  };
  created_at: string;
}

interface Props {
  customer: Customer;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  role?: string;
}

const REACTION_OPTIONS = ['긍정', '중립', '부정'];
const RESULT_OPTIONS = ['보류', '계약', '거절'];
const STATUS_OPTIONS = [
  { value: 'lead', label: '공급DB' },
  { value: 'db010', label: '직접DB' },
  { value: 'emotional', label: '지속관리' },
  { value: 'trash', label: '자체거절' },
];

export default function CustomerCard({ customer, onUpdate, onDelete, role }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    company_name: customer.company_name || '',
    ceo_name: customer.ceo_name || '',
    phone: customer.phone || '',
    business_address: customer.details?.business_address || '',
    business_type: customer.details?.business_type || '',
    consultation_date: customer.details?.consultation_date || '',
    next_call_date: customer.details?.next_call_date || '',
    consultation_notes: customer.details?.consultation_notes || '',
    reaction: customer.details?.reaction || '',
    result: customer.details?.result || '',
    sub_status: customer.details?.sub_status || 'lead',
    memo: customer.details?.memo || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showContract, setShowContract] = useState(false);

  const sub = customer.status === 'contracted' ? 'contracted' : (customer.details?.sub_status || 'lead');
  const statusLabel = STATUS_LABELS[sub] || sub;
  const statusColor = STATUS_COLORS[sub] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

  async function handleSave() {
    setSaving(true);
    const updates = {
      company_name: form.company_name,
      ceo_name: form.ceo_name,
      phone: form.phone,
      details: {
        ...customer.details,
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
    };
    await onUpdate(customer.id, updates);
    setEditing(false);
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm('삭제하시겠습니까?')) return;
    setDeleting(true);
    await onDelete(customer.id);
    setDeleting(false);
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden transition-all">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-750"
        onClick={() => !editing && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${statusColor}`}>
            {statusLabel}
          </span>
          {customer.details?.original_source && sub !== 'lead' && sub !== 'db010' && (
            <span className="text-xs px-1.5 py-0.5 rounded border border-slate-600 text-slate-400 shrink-0">
              {customer.details.original_source === 'db010' ? '직접DB출신' : '공급DB출신'}
            </span>
          )}
          <span className="font-semibold truncate">{customer.company_name}</span>
          {customer.ceo_name && <span className="text-slate-400 text-sm hidden sm:block">{customer.ceo_name}</span>}
          {customer.phone && <span className="text-slate-500 text-sm hidden md:block">{customer.phone}</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {customer.details?.next_call_date && (
            <span className="text-xs text-amber-400 hidden sm:block">
              재통화: {customer.details.next_call_date}
            </span>
          )}
          <span className="text-slate-500 text-xs hidden md:block">
            {new Date(customer.created_at).toLocaleDateString('ko-KR')}
          </span>
          <span className="text-slate-500 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* 상세 */}
      {expanded && (
        <div className="border-t border-slate-700 px-4 py-4">
          {!editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <Field label="업체명" value={customer.company_name} />
                <Field label="대표자" value={customer.ceo_name} />
                <Field label="연락처" value={customer.phone} />
                <Field label="사업주소" value={customer.details?.business_address} />
                <Field label="사업종류" value={customer.details?.business_type} />
                <Field label="담당자" value={customer.details?.sales_user_name} />
                <Field label="유입경로" value={customer.details?.original_source === 'db010' ? '직접DB' : customer.details?.original_source === 'lead' ? '공급DB' : customer.details?.original_source} />
                <Field label="상담일" value={customer.details?.consultation_date} />
                <Field label="재통화일정" value={customer.details?.next_call_date} />
                <Field label="반응" value={customer.details?.reaction} />
                <Field label="결과" value={customer.details?.result} />
              </div>
              {customer.details?.consultation_notes && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">상담내용</p>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap bg-slate-900 rounded-lg p-3">
                    {customer.details.consultation_notes}
                  </p>
                </div>
              )}
              {customer.details?.memo && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">메모</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-900 rounded-lg p-3">
                    {customer.details.memo}
                  </p>
                </div>
              )}
              {/* 계약 정보 */}
              {customer.status === 'contracted' && (
                <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3">
                  <p className="text-emerald-400 text-xs font-semibold mb-2">계약 정보</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <Field label="계약일" value={customer.details?.contract_date} />
                    <Field label="계약금액" value={customer.details?.payment_amount ? `${customer.details.payment_amount.toLocaleString()}원` : undefined} />
                    <Field label="결제수단" value={customer.details?.payment_method} />
                    <Field label="공급업체" value={customer.details?.supplier} />
                    <Field label="공급시작일" value={customer.details?.supply_start_date} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1 flex-wrap">
                {customer.status !== 'contracted' && (
                  <button
                    onClick={() => setShowContract(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
                  >
                    계약 처리
                  </button>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>

              {showContract && (
                <ContractModal
                  customer={customer}
                  onClose={() => setShowContract(false)}
                  onContracted={(updated) => { onUpdate(customer.id, updated); setShowContract(false); }}
                />
              )}
            </div>
          ) : (
            /* 수정 폼 */
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <EditField label="업체명" value={form.company_name} onChange={v => setForm(f => ({ ...f, company_name: v }))} />
                <EditField label="대표자" value={form.ceo_name} onChange={v => setForm(f => ({ ...f, ceo_name: v }))} />
                <EditField label="연락처" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
                <EditField label="사업주소" value={form.business_address} onChange={v => setForm(f => ({ ...f, business_address: v }))} />
                <EditField label="사업종류" value={form.business_type} onChange={v => setForm(f => ({ ...f, business_type: v }))} />
                <EditField label="상담일" value={form.consultation_date} type="date" onChange={v => setForm(f => ({ ...f, consultation_date: v }))} />
                <EditField label="재통화일정" value={form.next_call_date} type="date" onChange={v => setForm(f => ({ ...f, next_call_date: v }))} />
                <div>
                  <label className="text-slate-400 text-xs block mb-1">반응</label>
                  <select
                    value={form.reaction}
                    onChange={e => setForm(f => ({ ...f, reaction: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">선택</option>
                    {REACTION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">결과</label>
                  <select
                    value={form.result}
                    onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">선택</option>
                    {RESULT_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">DB 상태</label>
                  <select
                    value={form.sub_status}
                    onChange={e => setForm(f => ({ ...f, sub_status: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">상담내용</label>
                <textarea
                  value={form.consultation_notes}
                  onChange={e => setForm(f => ({ ...f, consultation_notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
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
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-slate-200 font-medium">{value}</p>
    </div>
  );
}

function EditField({
  label, value, onChange, type = 'text'
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-slate-400 text-xs block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
