'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ResultTemplate from '@/components/ResultTemplate';

interface SubjectScore {
  name: string;
  code: string | null;
  score: number;
  grade: string | null;
}

interface ResultData {
  id: string;
  term: string;
  totalScore: number | null;
  averageScore: number | null;
  position: number | null;
  teacherRemark: string | null;
  teacherSignature: string | null;
  principalReport: string | null;
  teacherReport: string | null;
  subjects: SubjectScore[];
}

interface StudentInfo {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  schoolName: string;
  schoolLogo: string | null;
  principalName: string | null;
  principalSigUrl: string | null;
}

export default function StudentResultPreviewPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) fetchResult();
  }, [studentId]);

  const fetchResult = async () => {
    try {
      // Try to fetch the student's latest published result
      const res = await fetch(`/api/student/result/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStudent(data.student);
          setResults(data.results);
        } else {
          setError(data.error || 'Result not found');
        }
      } else {
        setError('Result not found');
      }
    } catch {
      setError('Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = async () => {
    const result = results[0];
    if (!result || !student) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const element = document.getElementById('result-print-area');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${student.name.replace(/\s+/g, '_')}_Result.pdf`);
    } catch {
      alert('Failed to generate PDF. Please try printing instead.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading result...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.068 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Result Not Available</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/student" className="btn-primary text-sm inline-block">
            Check Another Result
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Result */}
        <div id="result-print-area">
          {student && results[0] && (
            <ResultTemplate
              student={student}
              result={results[0]}
              onDownload={downloadResult}
              showActions={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
