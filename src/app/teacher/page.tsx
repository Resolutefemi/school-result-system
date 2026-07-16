'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClassInfo {
  id: string;
  name: string;
  studentCount: number;
  subjects: string[];
}

interface StudentResult {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  hasResult: boolean;
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [recentStudents, setRecentStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/teacher/dashboard');
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes);
        setRecentStudents(data.recentStudents || []);
      }
    } catch {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your classes and student results</p>
      </div>

      {/* Classes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length > 0 ? (
          classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/teacher/class/${cls.id}`}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-700 font-bold text-lg">{cls.name.charAt(0)}</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{cls.studentCount}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{cls.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{cls.studentCount} students</p>
              <div className="flex flex-wrap gap-1">
                {cls.subjects.slice(0, 4).map((subj, i) => (
                  <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {subj}
                  </span>
                ))}
                {cls.subjects.length > 4 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    +{cls.subjects.length - 4} more
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center text-green-600 text-sm font-medium group-hover:underline">
                View Class
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-lg">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500">No classes assigned to you yet</p>
            <p className="text-sm text-gray-400 mt-1">Contact the admin to get classes assigned</p>
          </div>
        )}
      </div>

      {/* Quick Instructions */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-gray-900 mb-3">Quick Guide</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 font-bold">1</span>
            </div>
            <p className="text-gray-600">Click on a class to view students and input their scores</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 font-bold">2</span>
            </div>
            <p className="text-gray-600">Enter scores for each subject - grades are calculated automatically</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 font-bold">3</span>
            </div>
            <p className="text-gray-600">Add teacher remark, signature, and publish the result</p>
          </div>
        </div>
      </div>
    </div>
  );
}
