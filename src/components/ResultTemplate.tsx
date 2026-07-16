'use client';

import React, { useRef } from 'react';
import { calculateGrade, getGradeMeaning, generateTeacherRemark } from '@/lib/utils';

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

interface ResultTemplateProps {
  student: StudentInfo;
  result: ResultData;
  onDownload?: () => void;
  showActions?: boolean;
}

export default function ResultTemplate({ student, result, onDownload, showActions = true }: ResultTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const avgScore = result.averageScore || 0;
  const autoRemark = result.teacherRemark || generateTeacherRemark(avgScore);

  const getGradeClass = (grade: string | null) => {
    if (!grade) return '';
    return `grade-${grade}`;
  };

  return (
    <div className="w-full">
      {/* Action Buttons */}
      {showActions && (
        <div className="no-print flex gap-3 mb-6 flex-wrap">
          <button
            onClick={onDownload}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Result
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      )}

      {/* Result Template - Matching Paper Format */}
      <div
        ref={printRef}
        className="print-area bg-white shadow-2xl mx-auto overflow-hidden"
        style={{ maxWidth: '850px' }}
      >
        {/* Border frame like paper */}
        <div className="border-4 border-blue-900 m-2 p-6" style={{ border: '3px double #1e3a8a' }}>
          {/* School Header */}
          <div className="text-center mb-6">
            {student.schoolLogo && (
              <img
                src={student.schoolLogo}
                alt="School Logo"
                className="h-20 w-20 mx-auto mb-3 object-contain"
              />
            )}
            <h1 className="text-2xl font-bold text-blue-900 uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
              {student.schoolName}
            </h1>
            <p className="text-sm text-gray-600 mt-1 uppercase tracking-wider">
              {student.principalName ? `PRINCIPAL: ${student.principalName}` : ''}
            </p>
            <div className="border-t-2 border-b-2 border-blue-900 mt-3 py-2">
              <h2 className="text-lg font-bold uppercase tracking-wider">Student Report Sheet</h2>
            </div>
            {/* NOT Duplicate - as per user request */}
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm border-2 border-gray-300 p-4 rounded">
            <div className="flex">
              <span className="font-bold w-24">Student Name:</span>
              <span className="border-b border-gray-400 flex-1 text-center">{student.name}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Admission No:</span>
              <span className="border-b border-gray-400 flex-1 text-center">{student.admissionNo}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Class:</span>
              <span className="border-b border-gray-400 flex-1 text-center">{student.className}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Term:</span>
              <span className="border-b border-gray-400 flex-1 text-center">{result.term}</span>
            </div>
          </div>

          {/* Subjects Score Table - Without "Sign" column */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border border-blue-950 px-4 py-3 text-left text-sm font-semibold">S/N</th>
                <th className="border border-blue-950 px-4 py-3 text-left text-sm font-semibold">Subject</th>
                <th className="border border-blue-950 px-4 py-3 text-center text-sm font-semibold">Score</th>
                <th className="border border-blue-950 px-4 py-3 text-center text-sm font-semibold">Grade</th>
                <th className="border border-blue-950 px-4 py-3 text-center text-sm font-semibold">Remark</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((subject, index) => (
                <tr key={subject.code || subject.name} className="hover:bg-blue-50">
                  <td className="border border-gray-300 px-4 py-2.5 text-center text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2.5 text-sm font-medium">{subject.name}</td>
                  <td className="border border-gray-300 px-4 py-2.5 text-center text-sm font-bold">{subject.score}</td>
                  <td className="border border-gray-300 px-4 py-2.5 text-center">
                    <span className={getGradeClass(subject.grade)}>
                      {subject.grade || calculateGrade(subject.score)}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2.5 text-center text-xs">
                    {getGradeMeaning(subject.grade || calculateGrade(subject.score))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Section */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border-2 border-gray-300 p-4 rounded">
              <h3 className="font-bold text-sm mb-2 text-blue-900 uppercase">Performance Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Total Score:</span>
                  <span className="font-bold">{result.totalScore || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Average Score:</span>
                  <span className="font-bold">{avgScore.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Position in Class:</span>
                  <span className="font-bold text-blue-900">
                    {result.position ? `${result.position}${getOrdinalSuffix(result.position)}` : 'Not calculated'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher's Remark */}
          <div className="border-2 border-gray-300 p-4 rounded mb-6">
            <h3 className="font-bold text-sm text-blue-900 uppercase mb-2">Teacher's Remark</h3>
            <p className="text-sm italic">{autoRemark}</p>
          </div>

          {/* Principal and Teacher Reports */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border-2 border-gray-300 p-4 rounded">
              <h3 className="font-bold text-sm text-blue-900 uppercase mb-2">Principal's Report</h3>
              <p className="text-sm italic min-h-[40px]">
                {result.principalReport || '____________________'}
              </p>
            </div>
            <div className="border-2 border-gray-300 p-4 rounded">
              <h3 className="font-bold text-sm text-blue-900 uppercase mb-2">Teacher's Report</h3>
              <p className="text-sm italic min-h-[40px]">
                {result.teacherReport || '____________________'}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 mt-8 pt-4 border-t-2 border-gray-300">
            {/* Teacher's Signature - input by teacher */}
            <div className="text-center">
              <div className="min-h-[60px] flex items-center justify-center">
                {result.teacherSignature ? (
                  <img
                    src={result.teacherSignature}
                    alt="Teacher Signature"
                    className="h-12 object-contain"
                  />
                ) : (
                  <div className="w-40 border-b-2 border-gray-400 h-10" />
                )}
              </div>
              <p className="text-xs font-bold mt-1">Teacher&apos;s Signature</p>
            </div>

            {/* Principal's Signature - auto from school */}
            <div className="text-center">
              <div className="min-h-[60px] flex items-center justify-center">
                {student.principalSigUrl ? (
                  <img
                    src={student.principalSigUrl}
                    alt="Principal Signature"
                    className="h-12 object-contain"
                  />
                ) : (
                  <div className="w-40 border-b-2 border-gray-400 h-10" />
                )}
              </div>
              <p className="text-xs font-bold mt-1">Principal&apos;s Signature</p>
              {student.principalName && (
                <p className="text-xs text-gray-500 mt-0.5">{student.principalName}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}
