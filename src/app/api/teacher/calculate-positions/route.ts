import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.type !== 'teacher' && session.type !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, termId } = await request.json();

    if (!classId || !termId) {
      return NextResponse.json({ error: 'classId and termId are required' }, { status: 400 });
    }

    // Get all students in this class with their results
    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        results: {
          where: { termId },
          include: { subjectScores: true },
        },
      },
    });

    // Filter students with results and calculate averages
    const resultsWithAvg = students
      .filter(s => s.results.length > 0 && s.results[0].averageScore !== null)
      .map(s => ({
        studentId: s.id,
        resultId: s.results[0].id,
        average: s.results[0].averageScore!,
      }))
      .sort((a, b) => b.average - a.average);

    // Assign positions
    for (let i = 0; i < resultsWithAvg.length; i++) {
      await prisma.result.update({
        where: { id: resultsWithAvg[i].resultId },
        data: { position: i + 1 },
      });
    }

    return NextResponse.json({ success: true, calculated: resultsWithAvg.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate positions' }, { status: 500 });
  }
}
