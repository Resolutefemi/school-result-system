import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.type !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get classes where this teacher has subjects assigned
    const classSubjects = await prisma.classSubject.findMany({
      where: { teacherId: session.id },
      include: {
        class: {
          include: {
            _count: { select: { students: true } },
          },
        },
        subject: true,
      },
    });

    // Group by class
    const classMap = new Map<string, { id: string; name: string; studentCount: number; subjects: string[] }>();
    
    for (const cs of classSubjects) {
      if (!classMap.has(cs.class.id)) {
        classMap.set(cs.class.id, {
          id: cs.class.id,
          name: cs.class.name,
          studentCount: cs.class._count.students,
          subjects: [],
        });
      }
      classMap.get(cs.class.id)!.subjects.push(cs.subject.name);
    }

    const classes = Array.from(classMap.values());

    return NextResponse.json({ classes, recentStudents: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
