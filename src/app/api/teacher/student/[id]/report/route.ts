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

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const result = await prisma.result.findUnique({
      where: {
        studentId_termId: { studentId, termId },
      },
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
        teacherRemark: result.teacherRemark,
        teacherSignature: result.teacherSignature,
        principalReport: result.principalReport,
        teacherReport: result.teacherReport,
        isPublished: result.isPublished,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
  }
}
