'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  resultId: string | null;
  hasScore: boolean;
  isPublished: boolean;
}

interface ClassInfo {
  id: string;
  name: string;
  subjects: Array<{ id: string; name: string; code: string | null }>;
}

export default function TeacherClassPage() {
  const params = useParams();
  const classId = params.id as string;

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [terms, setTerms] = useState<Array<{ id: string; name: string; year: number; isActive: boolean }>>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      const res = await fetch(`/api/teacher/class/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassInfo(data.classInfo);
        setStudents(data.students);
        setTerms(data.terms);

        // Set active term by default
        const activeTerm = data.terms.find((t: any) => t.isActive);
        if (activeTerm) setSelectedTerm(activeTerm.id);
        else if (data.terms.length > 0) setSelectedTerm(data.terms[0].id);
      }
    } catch {
      console.error('Failed to fetch class data');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePositions = async () => {
    if (!confirm('Calculate positions for all students in this class? This will recalculate all rankings.')) return;

    try {
      const res = await fetch('/api/teacher/calculate-positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, termId: selectedTerm }),
      });
      if (res.ok) {
        alert('Positions calculated successfully!');
        fetchClassData();
      }
    } catch {
      alert('Failed to calculate positions');
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/teacher" className="text-sm text-green-600 hover:underline flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{classInfo?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{students.length} students</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Term Selector */}
          {terms.length > 0 && (
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="input-field text-sm py-2"
            >
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.year} {t.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
          )}
          <button onClick={handleCalculatePositions} className="btn-secondary text-sm">
            Calculate Positions
          </button>
        </div>
      </div>

      {/* Subjects */}
      {classInfo?.subjects && classInfo.subjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 font-medium">Subjects:</span>
          {classInfo.subjects.map((s) => (
            <span key={s.id} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">S/N</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Admission No</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.admissionNo}</td>
                  <td className="px-4 py-3 text-center">
                    {student.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Published
                      </span>
                    ) : student.hasScore ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        In Progress
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/teacher/student/${student.id}/scores?termId=${selectedTerm}`}
                        className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                      >
                        Scores
                      </Link>
                      <Link
                        href={`/teacher/student/${student.id}/report?termId=${selectedTerm}`}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        Report
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No students in this class
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
