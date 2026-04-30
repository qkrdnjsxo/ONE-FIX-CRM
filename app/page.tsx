'use client';

import { useEffect, useState } from 'react';
import AIAssistant from './components/AIAssistant';

interface NewDBItem {
  id: string;
  company_name: string;
  phone_number: string;
  reception_date: string;
  business_type: string;
  first_call_result: string;
  second_call_result: string;
  next_call_date: string;
  status: string;
  content: string;
  innovation_requirement: string;
  contract_completed: boolean;
  rejected: boolean;
}

export default function Home() {
  const [items, setItems] = useState<NewDBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    phone_number: '',
    reception_date: '',
    business_type: '',
    status: '전자계약서',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch('/api/new-db');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch('/api/new-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setFormData({
        company_name: '',
        phone_number: '',
        reception_date: '',
        business_type: '',
        status: '전자계약서',
      });
      fetchItems();
    } catch (error) {
      console.error('Error inserting:', error);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/new-db?id=${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">원픽스파트너스 CRM</h1>

        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">신규 DB 추가</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="회사명"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
              required
            />
            <input
              type="tel"
              placeholder="전화번호"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
            />
            <input
              type="date"
              value={formData.reception_date}
              onChange={(e) => setFormData({ ...formData, reception_date: e.target.value })}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
            />
            <input
              type="text"
              placeholder="업종"
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 col-span-2"
            >
              <option>전자계약서</option>
              <option>PDF계약서</option>
              <option>사업자대기</option>
              <option>서명완료</option>
              <option>동의문구</option>
              <option>외부미팅</option>
              <option>내방미팅</option>
            </select>
            <button
              type="submit"
              className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            >
              추가하기
            </button>
          </form>
        </div>

        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left">회사명</th>
                  <th className="px-6 py-3 text-left">전화</th>
                  <th className="px-6 py-3 text-left">접수일</th>
                  <th className="px-6 py-3 text-left">업종</th>
                  <th className="px-6 py-3 text-left">상태</th>
                  <th className="px-6 py-3 text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      로딩 중...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      데이터가 없습니다
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4">{item.company_name}</td>
                      <td className="px-6 py-4">{item.phone_number}</td>
                      <td className="px-6 py-4">{item.reception_date}</td>
                      <td className="px-6 py-4">{item.business_type}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded text-sm">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AIAssistant />
    </main>
  );
}
