import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teachers = await prisma.teacher.findMany({
      where: { schoolId: session.schoolId },
      include: {
        classSubjects: {
          include: {
            class: { select: { name: true } },
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A teacher with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        schoolId: session.schoolId,
      },
    });

    return NextResponse.json({ teacher });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}
