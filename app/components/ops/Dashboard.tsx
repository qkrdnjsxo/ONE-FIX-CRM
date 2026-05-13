'use client';
import { signOut } from 'next-auth/react';
import AIAssistant from '../AIAssistant';

export default function OpsDashboard({ session }: { session: any }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">원픽스파트너스 CRM</span>
          <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/30">관리팀</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">{session.user.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded-lg transition-colors">
            로그아웃
          </button>
        </div>
      </nav>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-2">안녕하세요, {session.user.name}님 👋</h2>
        <p className="text-slate-400 mb-8">관리팀 대시보드 — 기능 추가 중</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['신규건', '진행현황', 'A/S 요청'].map((tab) => (
            <div key={tab} className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:bg-slate-700 cursor-pointer transition-colors">
              <p className="font-semibold">{tab}</p>
              <p className="text-slate-500 text-xs mt-1">준비 중</p>
            </div>
          ))}
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}
