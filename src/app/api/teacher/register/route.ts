import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
    if (existingTeacher) {
      return NextResponse.json(
        { success: false, error: 'A teacher with this email already exists' },
        { status: 400 }
      );
    }

    // Get the school (default school for now)
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json(
        { success: false, error: 'No school found. Contact the administrator.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.teacher.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        schoolId: school.id,
        approved: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval. You will be notified once approved.',
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
