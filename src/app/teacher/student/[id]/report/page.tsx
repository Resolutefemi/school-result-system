'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import signature pad to avoid SSR issues
const SignaturePad = dynamic(() => import('@/components/SignaturePad'), { ssr: false });

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
  teacherRemark: string | null;
  teacherSignature: string | null;
  principalReport: string | null;
  teacherReport: string | null;
  isPublished: boolean;
}

export default function TeacherStudentReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const termId = searchParams.get('termId') || '';

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [teacherRemark, setTeacherRemark] = useState('');
  const [principalReport, setPrincipalReport] = useState('');
  const [teacherReport, setTeacherReport] = useState('');
  const [teacherSignature, setTeacherSignature] = useState('');

  useEffect(() => {
    if (studentId && termId) fetchData();
  }, [studentId, termId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/teacher/student/${studentId}/report?termId=${termId}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setResult(data.result);

        if (data.result) {
          setTeacherRemark(data.result.teacherRemark || '');
          setPrincipalReport(data.result.principalReport || '');
          setTeacherReport(data.result.teacherReport || '');
          setTeacherSignature(data.result.teacherSignature || '');
        }
      }
    } catch {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save remark
      await fetch('/api/teacher/save-remark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: result?.id, studentId, termId, teacherRemark }),
      });

      // Save principal report
      await fetch('/api/teacher/save-principal-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: result?.id, studentId, termId, principalReport }),
      });

      // Save teacher report
      await fetch('/api/teacher/save-teacher-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: result?.id, studentId, termId, teacherReport }),
      });

      alert('Report saved successfully!');
      fetchData();
    } catch {
      alert('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleSignatureSave = async (signatureDataUrl: string) => {
    try {
      const res = await fetch('/api/teacher/save-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: result?.id, studentId, termId, signature: signatureDataUrl }),
      });

      if (res.ok) {
        setTeacherSignature(signatureDataUrl);
        alert('Signature saved!');
      }
    } catch {
      alert('Failed to save signature');
    }
  };

  const handlePublish = async () => {
    if (!result?.id) {
      // First save, then we need a result ID
      alert('Please save scores first before publishing.');
      return;
    }

    if (!confirm('Publish this result? Students will be able to view it with their PIN.')) return;

    try {
      const res = await fetch('/api/teacher/publish-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: result.id }),
      });

      if (res.ok) {
        alert('Result published!');
        fetchData();
      }
    } catch {
      alert('Failed to publish result');
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
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Link href="/teacher" className="text-green-600 hover:underline">Dashboard</Link>
        <span>/</span>
        <Link href={`/teacher/class/${student?.classId || ''}`} className="text-green-600 hover:underline">
          {student?.className}
        </Link>
        <span>/</span>
        <span className="text-gray-900">Report - {student?.firstName} {student?.lastName}</span>
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
          <div className="flex items-center gap-3">
            {result?.isPublished ? (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                Published
              </span>
            ) : (
              <button onClick={handlePublish} className="btn-success text-sm">
                Publish Result
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Remark */}
      <form onSubmit={handleSaveRemark} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Teacher&apos;s Remark</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
          <textarea
            value={teacherRemark}
            onChange={(e) => setTeacherRemark(e.target.value)}
            className="input-field h-24 resize-none"
            placeholder="Enter teacher's remark..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Principal&apos;s Report</label>
            <textarea
              value={principalReport}
              onChange={(e) => setPrincipalReport(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="Enter principal's report..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher&apos;s Report</label>
            <textarea
              value={teacherReport}
              onChange={(e) => setTeacherReport(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="Enter teacher's report..."
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Report'}
        </button>
      </form>

      {/* Teacher Signature */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Teacher&apos;s Signature</h2>

        {teacherSignature ? (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 mb-2">Signature saved!</p>
            <img src={teacherSignature} alt="Teacher Signature" className="h-16 object-contain mb-3" />
            <button
              onClick={() => setTeacherSignature('')}
              className="text-sm text-red-600 hover:underline"
            >
              Clear and re-sign
            </button>
          </div>
        ) : (
          <SignaturePad onSave={handleSignatureSave} label="Draw your signature" />
        )}
      </div>

      {/* Preview Link */}
      <div className="text-center">
        <Link
          href={`/student/result/${student?.id}`}
          className="text-green-600 hover:underline text-sm"
          target="_blank"
        >
          Preview how the result will look →
        </Link>
      </div>
    </div>
  );
}
