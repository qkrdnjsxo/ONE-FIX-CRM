'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      parts: [{ text: input.trim() }],
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.parts[0].text,
          history: messages,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([
          ...newMessages,
          { role: 'model', parts: [{ text: data.message }] },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'model', parts: [{ text: '오류가 발생했습니다. 다시 시도해주세요.' }] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[560px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AI 비서</p>
                <p className="text-blue-200 text-xs">원픽스파트너스 전용</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-xs">온라인</span>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-2 text-white/70 hover:text-white transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="text-4xl">🤖</div>
                <p className="text-slate-300 font-medium">안녕하세요!</p>
                <p className="text-slate-500 text-sm">
                  원픽스파트너스 AI 비서입니다.<br />
                  CRM 관련 질문을 해주세요.
                </p>
                <div className="flex flex-col gap-2 w-full mt-2">
                  {['오늘 신규 DB 현황 알려줘', '계약률 분석해줘', '보고서 작성 도와줘'].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => setInput(hint)}
                      className="text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2 transition-colors text-left"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs shrink-0 mr-2 mt-1">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {msg.parts[0].text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs shrink-0 mr-2 mt-1">
                  🤖
                </div>
                <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 shrink-0">
            <div className="flex gap-2 items-center bg-slate-700 rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-400 outline-none"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-slate-600 text-xs text-center mt-1.5">Enter로 전송 · Powered by Gemini</p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen
            ? 'bg-slate-700 hover:bg-slate-600 rotate-12'
            : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 hover:scale-110'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl">🤖</span>
          </div>
        )}
        {!isOpen && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-600 opacity-0 group-hover:opacity-100 pointer-events-none">
            AI 비서
          </span>
        )}
      </button>

      {/* Tooltip label */}
      {!isOpen && (
        <div className="fixed bottom-[88px] right-6 z-50 pointer-events-none">
          <div className="bg-slate-800 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-600 whitespace-nowrap shadow-lg">
            AI 비서
          </div>
        </div>
      )}
    </>
  );
}
