'use client';
import { useState, useEffect } from 'react';

interface Report {
  id: string;
  report_date: string;
  report_type: string; // morning, midday, closing
  content: string;
  author_name: string;
  created_at: string;
}

const REPORT_TYPES = [
  { value: 'morning', label: '오전보고' },
  { value: 'midday', label: '중간보고' },
  { value: 'closing', label: '마감보고' },
];

export default function ReportTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({
    report_type: 'morning',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  async function fetchReports() {
    setLoading(true);
    const res = await fetch(`/api/reports?date=${selectedDate}`);
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchReports(); }, [selectedDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSubmitting(true);
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_date: selectedDate,
        report_type: form.report_type,
        content: form.content,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setReports(prev => [data, ...prev]);
      setForm({ report_type: 'morning', content: '' });
      setSuccess('보고가 제출되었습니다.');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-lg font-bold">업무보고</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 보고 입력 */}
      <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
        <h4 className="font-semibold mb-3">보고 작성</h4>
        {success && <p className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm rounded-lg px-3 py-2 mb-3">{success}</p>}
        <div className="flex gap-3 mb-3">
          {REPORT_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, report_type: t.value }))}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                form.report_type === t.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <textarea
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={5}
          placeholder="보고 내용을 입력하세요..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !form.content.trim()}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {submitting ? '제출 중...' : '보고 제출'}
        </button>
      </form>

      {/* 보고 목록 */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-500 py-8">불러오는 중...</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-slate-500 py-8">해당 날짜의 보고가 없습니다.</p>
        ) : (
          reports.map(r => (
            <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">
                  {REPORT_TYPES.find(t => t.value === r.report_type)?.label || r.report_type}
                </span>
                <span className="text-slate-400 text-xs">{r.author_name}</span>
                <span className="text-slate-500 text-xs ml-auto">{new Date(r.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{r.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
