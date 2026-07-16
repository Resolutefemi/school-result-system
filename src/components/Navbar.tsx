'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  userType: 'admin' | 'teacher' | null;
  userName?: string;
  schoolName?: string;
}

export default function Navbar({ userType, userName, schoolName }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and School Name */}
          <Link href={userType === 'admin' ? '/admin' : userType === 'teacher' ? '/teacher' : '/'} 
                className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <span className="font-bold text-blue-900 text-lg">School Result</span>
              {schoolName && <p className="text-xs text-gray-500 -mt-1">{schoolName}</p>}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {userType === 'admin' && (
              <>
                <NavLink href="/admin" label="Dashboard" />
                <NavLink href="/admin/classes" label="Classes" />
                <NavLink href="/admin/subjects" label="Subjects" />
                <NavLink href="/admin/teachers" label="Teachers" />
                <NavLink href="/admin/students" label="Students" />
                <NavLink href="/admin/school-settings" label="Settings" />
              </>
            )}
            {userType === 'teacher' && (
              <>
                <NavLink href="/teacher" label="Dashboard" />
              </>
            )}
            
            {/* User info and logout */}
            {userType && (
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userType}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-2">
            {userType === 'admin' && (
              <MobileNavLink href="/admin" label="Dashboard" onClick={() => setIsMenuOpen(false)} />
            )}
            {userType === 'admin' && (
              <>
                <MobileNavLink href="/admin/classes" label="Classes" onClick={() => setIsMenuOpen(false)} />
                <MobileNavLink href="/admin/subjects" label="Subjects" onClick={() => setIsMenuOpen(false)} />
                <MobileNavLink href="/admin/teachers" label="Teachers" onClick={() => setIsMenuOpen(false)} />
                <MobileNavLink href="/admin/students" label="Students" onClick={() => setIsMenuOpen(false)} />
                <MobileNavLink href="/admin/school-settings" label="Settings" onClick={() => setIsMenuOpen(false)} />
              </>
            )}
            {userType === 'teacher' && (
              <MobileNavLink href="/teacher" label="Dashboard" onClick={() => setIsMenuOpen(false)} />
            )}
            {userType && (
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Logout ({userName})
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-gray-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-all"
    >
      {label}
    </Link>
  );
}
