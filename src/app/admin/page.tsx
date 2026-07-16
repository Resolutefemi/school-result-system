'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  classCount: number;
  subjectCount: number;
  teacherCount: number;
  pendingTeacherCount: number;
  studentCount: number;
  resultCount: number;
  activeTerm: string | null;
  recentStudents: Array<{
    id: string;
    name: string;
    admissionNo: string;
    className: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [showTermForm, setShowTermForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTerm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/admin/create-term', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          year: parseInt(formData.get('year') as string),
          isActive: formData.get('isActive') === 'on',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setShowTermForm(false);
        fetchDashboardData();
      }
    } catch {
      alert('Failed to create term');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Classes', value: data?.classCount || 0, href: '/admin/classes', color: 'bg-blue-500' },
    { label: 'Subjects', value: data?.subjectCount || 0, href: '/admin/subjects', color: 'bg-green-500' },
    { label: 'Teachers', value: data?.teacherCount || 0, href: '/admin/teachers', color: 'bg-purple-500' },
    { label: 'Students', value: data?.studentCount || 0, href: '/admin/students', color: 'bg-orange-500' },
    { label: 'Results', value: data?.resultCount || 0, href: '#', color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.activeTerm ? `Active Term: ${data.activeTerm}` : 'No active term set'}
          </p>
        </div>
        <button
          onClick={() => setShowTermForm(true)}
          className="btn-primary text-sm"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Term
          </span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white font-bold text-lg">{stat.value}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
          </Link>
        ))}
      </div>

      {/* Pending Approvals Alert */}
      {data && data.pendingTeacherCount > 0 && (
        <Link
          href="/admin/teachers"
          className="block bg-amber-50 border-2 border-amber-200 rounded-xl p-5 hover:bg-amber-100 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              <div>
                <p className="font-bold text-amber-900">
                  {data.pendingTeacherCount} Teacher{data.pendingTeacherCount > 1 ? 's' : ''} Pending Approval
                </p>
                <p className="text-sm text-amber-700">
                  Click here to review and approve teacher registrations
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/classes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Classes</p>
                <p className="text-sm text-gray-500">Add or edit classes and assign subjects</p>
              </div>
            </Link>
            <Link href="/admin/subjects" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Subjects</p>
                <p className="text-sm text-gray-500">Add default subjects for the school</p>
              </div>
            </Link>
            <Link href="/admin/teachers" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Teachers</p>
                <p className="text-sm text-gray-500">Add teachers and assign to subjects</p>
              </div>
            </Link>
            <Link href="/admin/students" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Students</p>
                <p className="text-sm text-gray-500">Register students and generate PINs</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Students</h2>
          {data?.recentStudents && data.recentStudents.length > 0 ? (
            <div className="space-y-2">
              {data.recentStudents.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.admissionNo} - {student.className}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
              <p>No students registered yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Term Modal */}
      {showTermForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Term</h3>
            <form onSubmit={handleCreateTerm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term Name</label>
                <select name="name" className="input-field" required>
                  <option value="">Select term</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input type="number" name="year" defaultValue={new Date().getFullYear()} className="input-field" required />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="isActive" id="isActive" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Set as active term</label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowTermForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
