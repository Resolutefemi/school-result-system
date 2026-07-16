import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = await params;

    // Get class info and subjects
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classSubjects: {
          include: { subject: true },
          where: { teacherId: session.id },
        },
      },
    });

    if (!classInfo) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get students in this class
    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        results: {
          include: { subjectScores: true },
          where: {
            term: { isActive: true },
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    // Get terms
    const terms = await prisma.term.findMany({
      where: { schoolId: session.schoolId },
      orderBy: { year: 'desc' },
    });

    const studentsData = students.map((s) => {
      const activeResult = s.results[0];
      return {
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        admissionNo: s.admissionNo,
        resultId: activeResult?.id || null,
        hasScore: (activeResult?.subjectScores?.length || 0) > 0,
        isPublished: activeResult?.isPublished || false,
      };
    });

    return NextResponse.json({
      classInfo: {
        id: classInfo.id,
        name: classInfo.name,
        subjects: classInfo.classSubjects.map(cs => cs.subject),
      },
      students: studentsData,
      terms,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch class data' }, { status: 500 });
  }
}
