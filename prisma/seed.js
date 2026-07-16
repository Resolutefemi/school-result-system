const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ======== CREATE SCHOOL ========
  const school = await prisma.school.upsert({
    where: { id: 'default-school' },
    update: {},
    create: {
      id: 'default-school',
      name: 'God Generals International School',
      address: 'School Address',
      phone: '080-0000-0000',
      email: 'info@godgenerals.com',
      principalName: 'Dr. Adebayo Ogunlesi',
    },
  });
  console.log(`✅ Created school: ${school.name}`);

  // ======== CREATE ADMIN ========
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password: adminPassword,
      name: 'School Admin',
      schoolId: school.id,
    },
  });
  console.log(`✅ Created admin: ${admin.email} / admin123`);

  // ======== CREATE DEFAULT SUBJECTS ========
  const defaultSubjects = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'English Language', code: 'ENG' },
    { name: 'Basic Science', code: 'B/SCI' },
    { name: 'Basic Technology', code: 'B/TECH' },
    { name: 'Social Studies', code: 'S/S' },
    { name: 'Home Economics', code: 'H/ECON' },
    { name: 'Civic Education', code: 'CIV' },
    { name: 'Agricultural Science', code: 'AGRIC' },
    { name: 'Computer Science', code: 'COMP' },
    { name: 'Christian Religious Studies', code: 'CRS' },
    { name: 'Yoruba Language', code: 'YOR' },
    { name: 'French', code: 'FREN' },
    { name: 'Physical Health Education', code: 'PHE' },
    { name: 'Creative Arts', code: 'ARTS' },
    { name: 'Business Studies', code: 'BUS' },
  ];

  for (const subject of defaultSubjects) {
    await prisma.subject.upsert({
      where: { id: `subject-${subject.code}` },
      update: {},
      create: {
        id: `subject-${subject.code}`,
        name: subject.name,
        code: subject.code,
        schoolId: school.id,
      },
    });
  }
  console.log(`✅ Created ${defaultSubjects.length} default subjects`);

  // ======== CREATE CLASSES (JSS Only) ========
  const classNames = [
    'JSS 1A', 'JSS 1B', 'JSS 1C',
    'JSS 2A', 'JSS 2B', 'JSS 2C',
    'JSS 3A', 'JSS 3B', 'JSS 3C',
  ];

  for (const name of classNames) {
    await prisma.class.upsert({
      where: { id: `class-${name.replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `class-${name.replace(/\s+/g, '-')}`,
        name,
        schoolId: school.id,
      },
    });
  }
  console.log(`✅ Created ${classNames.length} JSS classes`);

  // ======== CREATE SAMPLE TEACHER (Approved) ========
  const teacherPassword = await bcrypt.hash('teacher123', 12);
  const teacher = await prisma.teacher.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: {
      name: 'Mrs. Grace Okafor',
      email: 'teacher@school.com',
      password: teacherPassword,
      phone: '080-1234-5678',
      schoolId: school.id,
      approved: true,
    },
  });
  console.log(`✅ Created approved teacher: ${teacher.email} / teacher123`);

  // ======== CREATE A PENDING TEACHER (Waiting approval) ========
  const pendingPassword = await bcrypt.hash('pending123', 12);
  const pendingTeacher = await prisma.teacher.upsert({
    where: { email: 'pending@school.com' },
    update: {},
    create: {
      name: 'Mr. John Adeleke',
      email: 'pending@school.com',
      password: pendingPassword,
      phone: '080-9876-5432',
      schoolId: school.id,
      approved: false,
    },
  });
  console.log(`✅ Created pending teacher: ${pendingTeacher.email} (awaiting admin approval)`);

  // ======== CREATE TERMS ========
  const currentYear = new Date().getFullYear();
  const terms = [
    { name: 'First Term', year: currentYear, isActive: false },
    { name: 'Second Term', year: currentYear, isActive: false },
    { name: 'Third Term', year: currentYear, isActive: true },
  ];

  const createdTerms = [];
  for (const term of terms) {
    const t = await prisma.term.create({
      data: {
        name: term.name,
        year: term.year,
        isActive: term.isActive,
        schoolId: school.id,
      },
    });
    createdTerms.push(t);
  }
  console.log(`✅ Created ${terms.length} terms for ${currentYear}`);

  // ======== CREATE SAMPLE STUDENTS ========
  const sampleStudents = [
    { fn: 'Chisom', ln: 'Adebayo', adm: 'STU-2024-001', cls: 'class-JSS-1A', pin: '1234' },
    { fn: 'Femi', ln: 'Ogunlade', adm: 'STU-2024-002', cls: 'class-JSS-1A', pin: '2345' },
    { fn: 'Nkechi', ln: 'Eze', adm: 'STU-2024-003', cls: 'class-JSS-1B', pin: '3456' },
    { fn: 'Tunde', ln: 'Bakare', adm: 'STU-2024-004', cls: 'class-JSS-2A', pin: '4567' },
    { fn: 'Zainab', ln: 'Abdullahi', adm: 'STU-2024-005', cls: 'class-JSS-2B', pin: '5678' },
  ];

  for (const s of sampleStudents) {
    await prisma.student.upsert({
      where: { admissionNo: s.adm },
      update: {},
      create: {
        firstName: s.fn,
        lastName: s.ln,
        admissionNo: s.adm,
        pin: s.pin,
        classId: s.cls,
      },
    });
  }
  console.log(`✅ Created ${sampleStudents.length} sample students with PINs`);

  // ======== CREATE SAMPLE RESULTS ========
  const activeTerm = createdTerms.find(t => t.isActive) || createdTerms[2];
  
  // Get all JSS 1A students
  const jss1AStudents = await prisma.student.findMany({
    where: { classId: 'class-JSS-1A' },
  });

  const jss1ASubjects = [
    { code: 'MATH', score: 85 },
    { code: 'ENG', score: 78 },
    { code: 'B/SCI', score: 72 },
    { code: 'B/TECH', score: 68 },
    { code: 'S/S', score: 90 },
    { code: 'H/ECON', score: 74 },
    { code: 'CIV', score: 65 },
    { code: 'COMP', score: 88 },
    { code: 'CRS', score: 80 },
    { code: 'YOR', score: 70 },
    { code: 'PHE', score: 92 },
  ];

  for (let i = 0; i < jss1AStudents.length; i++) {
    const student = jss1AStudents[i];
    const studentSubjects = jss1ASubjects.map(s => ({
      score: s.score - (i * 3) + Math.floor(Math.random() * 10),
      subjectCode: s.code,
    }));

    // Create result
    const result = await prisma.result.create({
      data: {
        studentId: student.id,
        termId: activeTerm.id,
        isPublished: true,
        teacherRemark: studentSubjects.reduce((sum, s) => sum + s.score, 0) / studentSubjects.length >= 75
          ? 'Excellent performance. Keep up the great work!'
          : 'Good performance. Keep striving for excellence!',
        teacherReport: 'The student is attentive and participative in class.',
        principalReport: 'A promising student with great potential.',
      },
    });

    // Create subject scores
    for (const ss of studentSubjects) {
      const subject = await prisma.subject.findUnique({
        where: { id: `subject-${ss.subjectCode}` },
      });
      if (subject) {
        const score = Math.min(100, Math.max(0, ss.score));
        await prisma.subjectScore.create({
          data: {
            resultId: result.id,
            subjectId: subject.id,
            score,
            grade: score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'E',
          },
        });
      }
    }

    // Calculate total and average
    const scores = await prisma.subjectScore.findMany({ where: { resultId: result.id } });
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    const avg = scores.length > 0 ? Math.round((total / scores.length) * 100) / 100 : 0;

    await prisma.result.update({
      where: { id: result.id },
      data: {
        totalScore: total,
        averageScore: avg,
        position: i + 1,
      },
    });
  }
  console.log(`✅ Created sample results for ${jss1AStudents.length} students`);

  // ======== DISPLAY LOGIN INFO ========
  console.log('');
  console.log('🎉 ======== SEEDING COMPLETE! ========');
  console.log('');
  console.log('📋 Admin Login:');
  console.log('   Email:    admin@school.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('📋 Approved Teacher:');
  console.log('   Email:    teacher@school.com');
  console.log('   Password: teacher123');
  console.log('');
  console.log('📋 Pending Teacher (needs admin approval):');
  console.log('   Email:    pending@school.com');
  console.log('   Password: pending123');
  console.log('');
  console.log('📋 Sample Student PINs:');
  for (const s of sampleStudents) {
    console.log(`   ${s.fn} ${s.ln}: Admission=${s.adm}, PIN=${s.pin}`);
  }
  console.log('');
  console.log('🏫 School: God Generals International School');
  console.log('👨‍🏫 Principal: Dr. Adebayo Ogunlesi');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
