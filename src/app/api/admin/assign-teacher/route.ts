import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classSubjectId, teacherId } = await request.json();

    if (!classSubjectId || !teacherId) {
      return NextResponse.json({ error: 'classSubjectId and teacherId are required' }, { status: 400 });
    }

    const classSubject = await prisma.classSubject.update({
      where: { id: classSubjectId },
      data: { teacherId },
    });

    return NextResponse.json({ classSubject });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign teacher' }, { status: 500 });
  }
}
