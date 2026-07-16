import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: studentId } = await params;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: { school: true },
        },
        results: {
          include: {
            term: true,
            subjectScores: {
              include: { subject: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    if (student.results.length === 0) {
      return NextResponse.json({ success: false, error: 'No results found' });
    }

    const result = student.results[0];

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        className: student.class.name,
        schoolName: student.class.school.name,
        schoolLogo: student.class.school.logoUrl,
        principalName: student.class.school.principalName,
        principalSigUrl: student.class.school.principalSigUrl,
      },
      results: [{
        id: result.id,
        term: `${result.term.name} ${result.term.year}`,
        totalScore: result.totalScore,
        averageScore: result.averageScore,
        position: result.position,
        teacherRemark: result.teacherRemark,
        teacherSignature: result.teacherSignature,
        principalReport: result.principalReport,
        teacherReport: result.teacherReport,
        subjects: result.subjectScores.map(ss => ({
          name: ss.subject.name,
          code: ss.subject.code,
          score: ss.score,
          grade: ss.grade,
        })),
      }],
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch result' }, { status: 500 });
  }
}
