import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, subjectId } = await request.json();

    if (!classId || !subjectId) {
      return NextResponse.json({ error: 'classId and subjectId are required' }, { status: 400 });
    }

    const existing = await prisma.classSubject.findUnique({
      where: { classId_subjectId: { classId, subjectId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Subject already assigned to this class' }, { status: 400 });
    }

    const classSubject = await prisma.classSubject.create({
      data: { classId, subjectId },
    });

    return NextResponse.json({ classSubject });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign subject' }, { status: 500 });
  }
}
