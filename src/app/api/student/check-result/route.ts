import { NextRequest, NextResponse } from 'next/server';
import { checkStudentResult } from '@/lib/actions';

export async function POST(request: NextRequest) {
  try {
    const { admissionNo, pin } = await request.json();

    if (!admissionNo || !pin) {
      return NextResponse.json(
        { success: false, error: 'Admission number and PIN are required' },
        { status: 400 }
      );
    }

    const result = await checkStudentResult(admissionNo, pin);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to check result' },
      { status: 500 }
    );
  }
}
