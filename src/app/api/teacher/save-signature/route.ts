import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.type !== 'teacher' && session.type !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resultId, studentId, termId, signature } = await request.json();

    if (!signature) {
      return NextResponse.json({ error: 'Signature is required' }, { status: 400 });
    }

    let result;
    if (resultId) {
      result = await prisma.result.update({
        where: { id: resultId },
        data: { teacherSignature: signature },
      });
    } else {
      result = await prisma.result.upsert({
        where: { studentId_termId: { studentId, termId } },
        update: { teacherSignature: signature },
        create: { studentId, termId, teacherSignature: signature },
      });
    }

    return NextResponse.json({ success: true, resultId: result.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
  }
}
