import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generatePin } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      where: { class: { schoolId: session.schoolId } },
      include: { class: true },
      orderBy: [{ class: { name: 'asc' } }, { lastName: 'asc' }],
    });

    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, admissionNo, classId } = await request.json();

    if (!firstName || !lastName || !admissionNo || !classId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await prisma.student.findUnique({ where: { admissionNo } });
    if (existing) {
      return NextResponse.json({ error: 'Admission number already exists' }, { status: 400 });
    }

    const pin = generatePin();

    const student = await prisma.student.create({
      data: { firstName, lastName, admissionNo, pin, classId },
    });

    return NextResponse.json({ student: { ...student, pin } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
