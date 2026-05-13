'use client';
import { useState, useEffect, useCallback } from 'react';
import CustomerCard from './CustomerCard';
import AddCustomerModal from './AddCustomerModal';

interface Props {
  subStatus?: string;   // 'lead'|'db010'|'emotional'|'trash'|undefined(all)
  contracted?: boolean; // true for 계약업체
  title: string;
  emptyMsg?: string;
  defaultSubStatus?: string;
  role?: string;
  ownerId?: string;
}

export default function CustomerBoard({ subStatus, contracted, title, emptyMsg, defaultSubStatus, role, ownerId }: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (contracted) params.set('contracted', 'true');
    else if (subStatus) params.set('sub_status', subStatus);
    if (ownerId) params.set('owner_id', ownerId);

    const res = await fetch(`/api/customers?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setCustomers(data);
    }
    setLoading(false);
  }, [subStatus, contracted, ownerId]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  async function handleUpdate(id: string, updates: any) {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setCustomers(prev => prev.map(c => c.id === id ? updated : c));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  }

  function handleAdd(newCustomer: any) {
    setCustomers(prev => [newCustomer, ...prev]);
  }

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      c.company_name?.toLowerCase().includes(q) ||
      c.ceo_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* 툴바 */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-bold shrink-0">{title}</h3>
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{customers.length}건</span>
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="업체명, 대표자, 연락처 검색..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 pl-8"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        </div>
        {!contracted && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors shrink-0"
          >
            + 등록
          </button>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20">
          <p className="text-4xl mb-3">📋</p>
          <p>{search ? '검색 결과가 없습니다.' : (emptyMsg || '등록된 데이터가 없습니다.')}</p>
          {!contracted && !search && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2 rounded-lg transition-colors"
            >
              첫 번째 고객 등록하기
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map(c => (
            <CustomerCard
              key={c.id}
              customer={c}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              role={role}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddCustomerModal
          defaultSubStatus={defaultSubStatus || subStatus || 'lead'}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
