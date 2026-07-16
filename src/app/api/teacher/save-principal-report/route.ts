import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.type !== 'teacher' && session.type !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resultId, studentId, termId, principalReport } = await request.json();

    let result;
    if (resultId) {
      result = await prisma.result.update({
        where: { id: resultId },
        data: { principalReport },
      });
    } else {
      result = await prisma.result.upsert({
        where: { studentId_termId: { studentId, termId } },
        update: { principalReport },
        create: { studentId, termId, principalReport },
      });
    }

    return NextResponse.json({ success: true, resultId: result.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save principal report' }, { status: 500 });
  }
}
