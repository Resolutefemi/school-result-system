import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: studentId } = await params;
    const termId = request.nextUrl.searchParams.get('termId');

    if (!termId) {
      return NextResponse.json({ error: 'termId is required' }, { status: 400 });
    }

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get subjects for this class
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        classId: student.classId,
        teacherId: session.id,
      },
      include: { subject: true },
    });

    // Get existing result and scores
    const result = await prisma.result.findUnique({
      where: {
        studentId_termId: { studentId, termId },
      },
      include: { subjectScores: true },
    });

    // Build subjects list with existing scores
    const subjects = classSubjects.map(cs => {
      const existingScore = result?.subjectScores.find(ss => ss.subjectId === cs.subject.id);
      return {
        subjectId: cs.subject.id,
        subjectName: cs.subject.name,
        subjectCode: cs.subject.code,
        score: existingScore?.score || 0,
        grade: existingScore?.grade || null,
      };
    });

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNo: student.admissionNo,
        className: student.class.name,
        classId: student.class.id,
      },
      result: result ? {
        id: result.id,
        totalScore: result.totalScore,
        averageScore: result.averageScore,
        position: result.position,
        isPublished: result.isPublished,
      } : null,
      subjects,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}
