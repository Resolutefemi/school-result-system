'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SubjectScore {
  subjectId: string;
  subjectName: string;
  subjectCode: string | null;
  score: number;
  grade: string | null;
}

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  className: string;
  classId?: string;
}

interface ResultInfo {
  id: string | null;
  totalScore: number | null;
  averageScore: number | null;
  position: number | null;
  isPublished: boolean;
}

export default function TeacherStudentScoresPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const termId = searchParams.get('termId') || '';

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [subjects, setSubjects] = useState<SubjectScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (studentId && termId) fetchData();
  }, [studentId, termId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/teacher/student/${studentId}/scores?termId=${termId}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setResult(data.result);
        setSubjects(data.subjects);
      }
    } catch {
      console.error('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (subjectId: string, value: string) => {
    const score = parseInt(value) || 0;
    const clampedScore = Math.min(100, Math.max(0, score));

    setSubjects(prev =>
      prev.map(s =>
        s.subjectId === subjectId
          ? { ...s, score: clampedScore, grade: getGrade(clampedScore) }
          : s
      )
    );
  };

  const getGrade = (score: number): string => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    if (score >= 40) return 'E';
    return 'F';
  };

  const getGradeColor = (grade: string | null): string => {
    const colors: Record<string, string> = {
      'A': 'text-green-600 bg-green-50',
      'B': 'text-blue-600 bg-blue-50',
      'C': 'text-yellow-600 bg-yellow-50',
      'D': 'text-orange-600 bg-orange-50',
      'E': 'text-red-600 bg-red-50',
      'F': 'text-red-700 bg-red-100',
    };
    return grade ? colors[grade] || '' : '';
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/teacher/save-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          termId,
          scores: subjects.map(s => ({ subjectId: s.subjectId, score: s.score })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaveMessage('Scores saved successfully!');
        setResult(prev => prev ? { ...prev, totalScore: data.total, averageScore: data.average } : null);
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save scores');
      }
    } catch {
      setSaveMessage('Error saving scores');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalScore = subjects.reduce((sum, s) => sum + s.score, 0);
  const average = subjects.length > 0 ? (totalScore / subjects.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 page-enter">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Link href="/teacher" className="text-green-600 hover:underline">Dashboard</Link>
        <span>/</span>
        <Link href={`/teacher/class/${student?.classId || ''}`} className="text-green-600 hover:underline">
          {student?.className}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{student?.firstName} {student?.lastName}</span>
      </div>

      {/* Student Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student?.firstName} {student?.lastName}
            </h1>
            <p className="text-sm text-gray-500">{student?.className} | {student?.admissionNo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total: <span className="font-bold text-gray-900">{totalScore}</span></p>
            <p className="text-sm text-gray-500">Average: <span className="font-bold text-gray-900">{average}%</span></p>
            {result?.position && (
              <p className="text-sm text-gray-500">Position: <span className="font-bold text-green-600">{result.position}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Score Input Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Subject Scores</h2>
          <p className="text-sm text-gray-500">Enter scores (0-100) for each subject</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">S/N</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Subject</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Score</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject.subjectId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{subject.subjectName}</span>
                    {subject.subjectCode && (
                      <span className="text-xs text-gray-400 ml-2">({subject.subjectCode})</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={subject.score || ''}
                      onChange={(e) => handleScoreChange(subject.subjectId, e.target.value)}
                      className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-bold"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {subject.grade && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(subject.grade)}`}>
                        {subject.grade}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No subjects assigned to this class. Contact the admin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving || subjects.length === 0}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save Scores'}
              </button>
              {saveMessage && (
                <span className={`text-sm font-medium ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="text-gray-500">Total: </span>
                <span className="font-bold text-lg text-gray-900">{totalScore}</span>
                <span className="text-gray-400 mx-1">|</span>
                <span className="text-gray-500">Avg: </span>
                <span className="font-bold text-lg text-gray-900">{average}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Grade Guide</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">A: 80-100</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">B: 70-79</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">C: 60-69</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">D: 50-59</span>
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded">E: 40-49</span>
          <span className="px-2 py-1 bg-red-200 text-red-800 rounded">F: 0-39</span>
        </div>
      </div>
    </div>
  );
}
