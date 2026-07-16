'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ResultTemplate from '@/components/ResultTemplate';

interface StudentData {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  schoolName: string;
  schoolLogo: string | null;
  principalName: string | null;
  principalSigUrl: string | null;
}

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

export default function StudentResultPage() {
  const [admissionNo, setAdmissionNo] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [results, setResults] = useState<ResultData[]>([]);
  const [selectedResult, setSelectedResult] = useState<number>(0);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/student/check-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionNo, pin }),
      });

      const data = await res.json();
      if (data.success) {
        setStudentData(data.student);
        setResults(data.results);
        setSelectedResult(0);
      } else {
        setError(data.error || 'Failed to fetch result');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = async () => {
    const resultToDownload = results[selectedResult];
    if (!resultToDownload || !studentData) return;

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
      pdf.save(`${studentData.name.replace(/\s+/g, '_')}_${resultToDownload.term.replace(/\s+/g, '_')}.pdf`);
    } catch {
      alert('Failed to generate PDF. Please try printing instead.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-bold text-blue-900">Check Result</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!studentData ? (
          /* PIN Entry Form */
          <div className="card max-w-md mx-auto animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Check Your Result</h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter your admission number and PIN to view your result
              </p>
            </div>

            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number
                </label>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="e.g., STU-2024-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="input-field"
                  placeholder="Enter your 4-digit PIN"
                  maxLength={4}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Checking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Check Result
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-400">
              PIN is provided by your school. Contact the school if you don&apos;t have one.
            </p>
          </div>
        ) : (
          /* Results Display */
          <div className="animate-fade-in">
            {/* Student Info Banner */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{studentData.name}</h2>
                  <p className="text-sm text-gray-500">
                    {studentData.schoolName} | {studentData.className}
                  </p>
                  <p className="text-xs text-gray-400">Admission No: {studentData.admissionNo}</p>
                </div>
              </div>

              {/* Term Selector */}
              {results.length > 1 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {results.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedResult(i)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedResult === i
                          ? 'bg-blue-900 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {r.term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Result Template */}
            <div id="result-print-area">
              <ResultTemplate
                student={studentData}
                result={results[selectedResult]}
                onDownload={downloadResult}
                showActions={true}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
