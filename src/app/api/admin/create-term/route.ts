import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, year, isActive } = await request.json();

    if (!name || !year) {
      return NextResponse.json({ error: 'Name and year are required' }, { status: 400 });
    }

    if (isActive) {
      await prisma.term.updateMany({
        where: { schoolId: session.schoolId },
        data: { isActive: false },
      });
    }

    await prisma.term.create({
      data: {
        name,
        year,
        isActive: isActive || false,
        schoolId: session.schoolId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create term' }, { status: 500 });
  }
}
