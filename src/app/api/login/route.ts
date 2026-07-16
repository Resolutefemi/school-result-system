import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin, loginTeacher, getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Try admin login first
    const adminResult = await loginAdmin(email, password);
    if (adminResult.success) {
      return NextResponse.json({ success: true, type: 'admin' });
    }

    // Try teacher login
    const teacherResult = await loginTeacher(email, password);
    if (teacherResult.success) {
      return NextResponse.json({ success: true, type: 'teacher' });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
