'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { calculateGrade, calculateTotal, calculateAverage, generateTeacherRemark, generatePin } from './utils';
import { hashPassword, requireAuth, getSession } from './auth';

// ============ SCHOOL SETTINGS ============

export async function updateSchoolSettings(formData: FormData) {
  const session = await requireAuth(['admin']);
  
  const data = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    principalName: formData.get('principalName') as string,
  };

  await prisma.school.update({
    where: { id: session.schoolId },
    data,
  });

  revalidatePath('/admin/school-settings');
  return { success: true };
}

// ============ CLASSES ============

export async function createClass(formData: FormData) {
  const session = await requireAuth(['admin']);
  const name = formData.get('name') as string;

  await prisma.class.create({
    data: {
      name,
      schoolId: session.schoolId,
    },
  });

  revalidatePath('/admin/classes');
  return { success: true };
}

export async function deleteClass(classId: string) {
  const session = await requireAuth(['admin']);
  
  await prisma.class.delete({
    where: { id: classId },
  });

  revalidatePath('/admin/classes');
  return { success: true };
}

// ============ SUBJECTS ============

export async function createSubject(formData: FormData) {
  const session = await requireAuth(['admin']);
  const name = formData.get('name') as string;
  const code = formData.get('code') as string;

  await prisma.subject.create({
    data: {
      name,
      code,
      schoolId: session.schoolId,
    },
  });

  revalidatePath('/admin/subjects');
  return { success: true };
}

export async function deleteSubject(subjectId: string) {
  const session = await requireAuth(['admin']);
  
  await prisma.subject.delete({
    where: { id: subjectId },
  });

  revalidatePath('/admin/subjects');
  return { success: true };
}

// ============ TEACHERS ============

export async function createTeacher(formData: FormData) {
  const session = await requireAuth(['admin']);
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;

  const hashedPassword = await hashPassword(password);

  await prisma.teacher.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      schoolId: session.schoolId,
    },
  });

  revalidatePath('/admin/teachers');
  return { success: true };
}

export async function deleteTeacher(teacherId: string) {
  const session = await requireAuth(['admin']);
  
  await prisma.teacher.delete({
    where: { id: teacherId },
  });

  revalidatePath('/admin/teachers');
  return { success: true };
}

// ============ STUDENTS ============

export async function createStudent(formData: FormData) {
  const session = await requireAuth(['admin']);
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const admissionNo = formData.get('admissionNo') as string;
  const classId = formData.get('classId') as string;
  const pin = generatePin();

  // Check if admission number already exists
  const existing = await prisma.student.findUnique({
    where: { admissionNo },
  });

  if (existing) {
    return { success: false, error: 'Admission number already exists' };
  }

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      admissionNo,
      pin,
      classId,
    },
  });

  revalidatePath('/admin/students');
  return { success: true, pin: student.pin, studentId: student.id, admissionNo: student.admissionNo };
}

export async function deleteStudent(studentId: string) {
  const session = await requireAuth(['admin']);
  
  await prisma.student.delete({
    where: { id: studentId },
  });

  revalidatePath('/admin/students');
  return { success: true };
}

export async function resetStudentPin(studentId: string) {
  const session = await requireAuth(['admin']);
  const newPin = generatePin();

  await prisma.student.update({
    where: { id: studentId },
    data: { pin: newPin },
  });

  revalidatePath('/admin/students');
  return { success: true, pin: newPin };
}

// ============ SUBJECT-TEACHER ASSIGNMENT ============

export async function assignSubjectToClass(classId: string, subjectId: string) {
  const session = await requireAuth(['admin']);

  await prisma.classSubject.create({
    data: {
      classId,
      subjectId,
    },
  });

  revalidatePath('/admin/classes');
  return { success: true };
}

export async function assignTeacherToSubject(classSubjectId: string, teacherId: string) {
  const session = await requireAuth(['admin']);

  await prisma.classSubject.update({
    where: { id: classSubjectId },
    data: { teacherId },
  });

  revalidatePath('/admin/classes');
  return { success: true };
}

// ============ TERMS ============

export async function createTerm(formData: FormData) {
  const session = await requireAuth(['admin']);
  const name = formData.get('name') as string;
  const year = parseInt(formData.get('year') as string);

  // Deactivate all other terms if this one is active
  const isActive = formData.get('isActive') === 'on';
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
      isActive,
      schoolId: session.schoolId,
    },
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function setActiveTerm(termId: string) {
  const session = await requireAuth(['admin']);

  // Deactivate all terms
  await prisma.term.updateMany({
    where: { schoolId: session.schoolId },
    data: { isActive: false },
  });

  // Activate selected term
  await prisma.term.update({
    where: { id: termId },
    data: { isActive: true },
  });

  revalidatePath('/admin');
  return { success: true };
}

// ============ RESULTS / SCORES ============

export async function saveStudentScores(
  studentId: string,
  termId: string,
  scores: { subjectId: string; score: number }[]
) {
  const session = await requireAuth(['teacher', 'admin']);

  // Find or create result
  let result = await prisma.result.findUnique({
    where: {
      studentId_termId: { studentId, termId },
    },
  });

  if (!result) {
    result = await prisma.result.create({
      data: {
        studentId,
        termId,
      },
    });
  }

  // Save each subject score
  for (const { subjectId, score } of scores) {
    await prisma.subjectScore.upsert({
      where: {
        resultId_subjectId: { resultId: result.id, subjectId },
      },
      update: {
        score,
        grade: calculateGrade(score),
      },
      create: {
        resultId: result.id,
        subjectId,
        score,
        grade: calculateGrade(score),
      },
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
    data: {
      totalScore: total,
      averageScore: average,
    },
  });

  revalidatePath(`/teacher/student/${studentId}/scores`);
  return { success: true, total, average };
}

export async function calculatePositions(termId: string, classId: string) {
  const session = await requireAuth(['teacher', 'admin']);

  // Get all results for this term and class
  const students = await prisma.student.findMany({
    where: { classId },
    include: {
      results: {
        where: { termId },
        include: { subjectScores: true },
      },
    },
  });

  // Calculate averages and sort
  const resultsWithAvg = students
    .filter(s => s.results.length > 0)
    .map(s => ({
      studentId: s.id,
      resultId: s.results[0].id,
      average: s.results[0].averageScore || 0,
    }))
    .sort((a, b) => b.average - a.average);

  // Assign positions
  for (let i = 0; i < resultsWithAvg.length; i++) {
    await prisma.result.update({
      where: { id: resultsWithAvg[i].resultId },
      data: { position: i + 1 },
    });
  }

  revalidatePath(`/teacher/class/${classId}`);
  return { success: true };
}

export async function saveTeacherRemark(
  resultId: string,
  remark: string
) {
  const session = await requireAuth(['teacher', 'admin']);

  await prisma.result.update({
    where: { id: resultId },
    data: { teacherRemark: remark },
  });

  revalidatePath(`/teacher/student/*`);
  return { success: true };
}

export async function saveTeacherReport(
  resultId: string,
  report: string
) {
  const session = await requireAuth(['teacher', 'admin']);

  await prisma.result.update({
    where: { id: resultId },
    data: { teacherReport: report },
  });

  revalidatePath(`/teacher/student/*`);
  return { success: true };
}

export async function savePrincipalReport(
  resultId: string,
  report: string
) {
  const session = await requireAuth(['teacher', 'admin']);

  await prisma.result.update({
    where: { id: resultId },
    data: { principalReport: report },
  });

  revalidatePath(`/teacher/student/*`);
  return { success: true };
}

export async function saveTeacherSignature(
  resultId: string,
  signature: string
) {
  const session = await requireAuth(['teacher', 'admin']);

  await prisma.result.update({
    where: { id: resultId },
    data: { teacherSignature: signature },
  });

  revalidatePath(`/teacher/student/*`);
  return { success: true };
}

export async function publishResult(resultId: string) {
  const session = await requireAuth(['teacher', 'admin']);

  await prisma.result.update({
    where: { id: resultId },
    data: { isPublished: true },
  });

  revalidatePath(`/teacher/student/*`);
  return { success: true };
}

// ============ STUDENT RESULT CHECKING ============

export async function checkStudentResult(admissionNo: string, pin: string) {
  const student = await prisma.student.findUnique({
    where: { admissionNo },
    include: {
      class: {
        include: { school: true },
      },
      results: {
        include: {
          term: true,
          subjectScores: {
            include: { subject: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!student) {
    return { success: false, error: 'Invalid admission number' };
  }

  if (student.pin !== pin) {
    return { success: false, error: 'Invalid PIN' };
  }

  const publishedResults = student.results.filter(r => r.isPublished);
  
  if (publishedResults.length === 0) {
    return { success: false, error: 'No published results available for this student' };
  }

  return {
    success: true,
    student: {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      className: student.class.name,
      schoolName: student.class.school.name,
      schoolLogo: student.class.school.logoUrl,
      principalName: student.class.school.principalName,
      principalSigUrl: student.class.school.principalSigUrl,
    },
    results: publishedResults.map(r => ({
      id: r.id,
      term: `${r.term.name} ${r.term.year}`,
      totalScore: r.totalScore,
      averageScore: r.averageScore,
      position: r.position,
      teacherRemark: r.teacherRemark,
      teacherSignature: r.teacherSignature,
      principalReport: r.principalReport,
      teacherReport: r.teacherReport,
      subjects: r.subjectScores.map(ss => ({
        name: ss.subject.name,
        code: ss.subject.code,
        score: ss.score,
        grade: ss.grade,
      })),
    })),
  };
}
