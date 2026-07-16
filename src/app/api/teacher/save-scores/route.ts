import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateGrade, calculateTotal, calculateAverage } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.type !== 'teacher' && session.type !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, termId, scores } = await request.json();

    if (!studentId || !termId || !scores) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create result
    let result = await prisma.result.findUnique({
      where: { studentId_termId: { studentId, termId } },
    });

    if (!result) {
      result = await prisma.result.create({
        data: { studentId, termId },
      });
    }

    // Save each subject score
    for (const { subjectId, score } of scores) {
      const grade = calculateGrade(score);
      await prisma.subjectScore.upsert({
        where: {
          resultId_subjectId: { resultId: result.id, subjectId },
        },
        update: { score, grade },
        create: { resultId: result.id, subjectId, score, grade },
      });
    }

    // Recalculate totals
    const subjectScores = await prisma.subjectScore.findMany({
      where: { resultId: result.id },
    });

    const total = calculateTotal(subjectScores);
    const average = calculateAverage(total, subjectScores.length);

    await prisma.result.update({
      where: { id: result.id },
      data: { totalScore: total, averageScore: average },
    });

    return NextResponse.json({ success: true, total, average, resultId: result.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save scores' }, { status: 500 });
  }
}
