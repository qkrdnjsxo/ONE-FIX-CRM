'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-gray-900">원픽스파트너스</span>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#services" className="hover:text-gray-900 transition-colors">서비스</a>
            <a href="#about" className="hover:text-gray-900 transition-colors">회사소개</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">문의하기</a>
            <Link
              href="/login"
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              직원 로그인
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4 text-sm text-gray-700">
            <a href="#services" onClick={() => setMenuOpen(false)}>서비스</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>회사소개</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>문의하기</a>
            <Link href="/login" className="bg-slate-900 text-white text-center px-4 py-2 rounded-lg font-medium">
              직원 로그인
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
            원픽스파트너스
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            비즈니스 성장을<br />
            <span className="text-blue-400">하나의 솔루션</span>으로
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            원픽스파트너스는 기업의 영업·관리 효율화를 통해<br className="hidden md:block" />
            지속적인 성장을 함께 만들어갑니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              무료 상담 신청
            </a>
            <a
              href="#services"
              className="border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              서비스 알아보기
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { num: '500+', label: '파트너사' },
            { num: '98%', label: '고객 만족도' },
            { num: '5년+', label: '업계 경험' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-bold text-blue-400">{s.num}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">제공 서비스</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              고객사의 비즈니스 목표에 맞춰 최적화된 솔루션을 제공합니다.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📊',
                title: '영업 컨설팅',
                desc: '체계적인 영업 프로세스 구축으로 계약률을 높이고 매출 성장을 가속화합니다.',
              },
              {
                icon: '🤝',
                title: '파트너십 관리',
                desc: '기업간 협력 관계를 전략적으로 관리하여 장기적인 비즈니스 관계를 형성합니다.',
              },
              {
                icon: '⚡',
                title: '업무 자동화',
                desc: '반복적인 업무 프로세스를 자동화하여 팀의 핵심 업무 집중도를 높입니다.',
              },
            ].map((s) => (
              <div key={s.title} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-14 items-center">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              왜 원픽스파트너스인가요?
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              원픽스파트너스는 수백 개 기업의 성장을 함께한 전문 파트너입니다.
              영업부터 관리, 자동화까지 비즈니스 전반을 아우르는 통합 솔루션으로
              고객사의 목표 달성을 지원합니다.
            </p>
            <ul className="space-y-3 text-gray-700">
              {[
                '전담 담당자 배정으로 빠른 응대',
                '데이터 기반 전략 수립 및 분석',
                '계약부터 사후 관리까지 원스톱 서비스',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl p-10 text-white text-center">
            <p className="text-5xl font-extrabold text-blue-300 mb-2">ONE FIX</p>
            <p className="text-slate-300 text-lg">하나의 솔루션으로<br />모든 비즈니스 문제를 해결</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">지금 바로 상담 신청하세요</h2>
          <p className="text-slate-400 mb-10">전문 컨설턴트가 24시간 내 연락드립니다.</p>
          <form className="flex flex-col gap-4 text-left">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="회사명"
                className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="담당자명"
                className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <input
              type="tel"
              placeholder="연락처"
              className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <textarea
              rows={4}
              placeholder="문의 내용"
              className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              상담 신청하기
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-8 px-6 text-center text-sm">
        <p className="font-semibold text-white mb-1">원픽스파트너스</p>
        <p>© 2025 One Fix Partners. All rights reserved.</p>
      </footer>
    </div>
  );
}
