import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teacherId, approved } = await request.json();

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: { approved },
    });

    return NextResponse.json({
      success: true,
      teacher,
      message: approved
        ? `Teacher "${teacher.name}" has been approved successfully`
        : `Teacher "${teacher.name}" has been rejected`,
    });
  } catch (error) {
    console.error('Teacher approval error:', error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}
