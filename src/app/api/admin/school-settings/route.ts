import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const school = await prisma.school.findUnique({
      where: { id: session.schoolId },
    });

    return NextResponse.json({ school });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch school settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const school = await prisma.school.update({
      where: { id: session.schoolId },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        principalName: data.principalName,
      },
    });

    return NextResponse.json({ school });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update school settings' }, { status: 500 });
  }
}
