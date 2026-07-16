'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(data.type === 'admin' ? '/admin' : '/teacher');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slide-up"
           onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Login</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in as admin or teacher</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                   className="input-field" placeholder="Enter your email" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                   className="input-field" placeholder="Enter your password" required />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}
          <button type="submit" disabled={loading}
                  className="btn-primary w-full text-base">
            {loading ? (
              <><div className="spinner" /> Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>
        <button onClick={onClose}
                className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [clickCount, setClickCount] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const teacherCardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  useEffect(() => { checkSession(); }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/session');
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          router.push(data.session.type === 'admin' ? '/admin' : '/teacher');
        }
      }
    } catch {}
  };

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setShowLogin(true);
      setClickCount(0);
    }
    if (newCount === 1 || newCount === 2) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">S</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-blue-900 truncate">School Result</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Management System</p>
              </div>
            </Link>
            <Link href="/student"
                  className="touch-btn px-4 sm:px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition-all border border-blue-100">
              Check Result
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-20 page-enter">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-green-600">
              School Result
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 leading-relaxed">
            Manage student results, generate report sheets, and access academic performance — all in one place.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 max-w-3xl mx-auto mb-12 sm:mb-20">
          {/* Student Card */}
          <Link href="/student"
                className="card-hover card group block">
            <div className="flex items-center gap-4 sm:flex-col sm:text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="sm:mt-3 flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Check Your Result</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">View and download your report sheet using admission number and PIN.</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 sm:hidden shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Teacher Card - Secret Click */}
          <div ref={teacherCardRef}
               onClick={handleSecretClick}
               className="card-hover card group relative overflow-hidden cursor-pointer select-none">
            <div className="flex items-center gap-4 sm:flex-col sm:text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="sm:mt-3 flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Teacher Portal</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">Manage scores, write reports, and generate results.</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 sm:hidden shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Secret tap hint overlay */}
            {showHint && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/5 backdrop-blur-[2px] rounded-2xl transition-all z-10">
                <div className="bg-white/90 backdrop-blur px-5 py-3 rounded-xl shadow-lg animate-fade-in">
                  <span className="text-sm font-bold text-green-700">
                    {3 - clickCount} tap{3 - clickCount !== 1 ? 's' : ''} to reveal login
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <FeatureCard icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          } color="purple" title="Automatic Grading" desc="Grades and positions calculated automatically from scores." />
          <FeatureCard icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          } color="green" title="PDF Downloads" desc="Download or print professional report sheets instantly." />
          <FeatureCard icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          } color="blue" title="Secure Access" desc="Students use unique PINs. Teachers have private login credentials." />
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            &copy; {new Date().getFullYear()} School Result Management System
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
    green: { bg: 'bg-green-100', text: 'text-green-700' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-50">
      <div className={`w-11 h-11 sm:w-12 sm:h-12 ${c.bg} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
        <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
      </div>
      <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1.5">{title}</h4>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
