import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      classCount,
      subjectCount,
      teacherCount,
      studentCount,
      resultCount,
      activeTerm,
      recentStudents,
    ] = await Promise.all([
      prisma.class.count({ where: { schoolId: session.schoolId } }),
      prisma.subject.count({ where: { schoolId: session.schoolId } }),
      prisma.teacher.count({ where: { schoolId: session.schoolId } }),
      prisma.student.count({
        where: { class: { schoolId: session.schoolId } },
      }),
      prisma.result.count({
        where: { student: { class: { schoolId: session.schoolId } } },
      }),
      prisma.term.findFirst({
        where: { schoolId: session.schoolId, isActive: true },
      }),
      prisma.student.findMany({
        where: { class: { schoolId: session.schoolId } },
        include: { class: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      data: {
        classCount,
        subjectCount,
        teacherCount,
        studentCount,
        resultCount,
        activeTerm: activeTerm ? `${activeTerm.name} ${activeTerm.year}` : null,
        recentStudents: recentStudents.map(s => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          admissionNo: s.admissionNo,
          className: s.class.name,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
