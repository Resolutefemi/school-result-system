const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create School
  const school = await prisma.school.upsert({
    where: { id: 'default-school' },
    update: {},
    create: {
      id: 'default-school',
      name: 'My School',
      address: 'School Address',
      phone: '080-0000-0000',
      email: 'info@myschool.com',
      principalName: 'Principal Name',
    },
  });
  console.log(`Created school: ${school.name}`);

  // Create Admin
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
  console.log(`Created admin: ${admin.email} (password: admin123)`);

  // Create Default Subjects
  const defaultSubjects = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'English Language', code: 'ENG' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Chemistry', code: 'CHEM' },
    { name: 'Biology', code: 'BIO' },
    { name: 'Geography', code: 'GEO' },
    { name: 'Economics', code: 'ECO' },
    { name: 'Government', code: 'GOV' },
    { name: 'Literature in English', code: 'LIT' },
    { name: 'History', code: 'HIST' },
    { name: 'Civic Education', code: 'CIV' },
    { name: 'Agricultural Science', code: 'AGRIC' },
    { name: 'Further Mathematics', code: 'F/MATH' },
    { name: 'Commerce', code: 'COMM' },
    { name: 'Accounting', code: 'ACCT' },
    { name: 'Christian Religious Studies', code: 'CRS' },
    { name: 'Yoruba Language', code: 'YOR' },
    { name: 'French', code: 'FREN' },
    { name: 'Computer Science', code: 'COMP' },
    { name: 'Basic Science', code: 'B/SCI' },
    { name: 'Basic Technology', code: 'B/TECH' },
    { name: 'Social Studies', code: 'S/S' },
    { name: 'Home Economics', code: 'H/ECON' },
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
  console.log(`Created ${defaultSubjects.length} default subjects`);

  // Create Classes (JSS only, no SSS)
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
  console.log(`Created ${classNames.length} JSS classes`);

  // Create Sample Teacher
  const teacherPassword = await bcrypt.hash('teacher123', 12);
  const teacher = await prisma.teacher.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: {
      name: 'Sample Teacher',
      email: 'teacher@school.com',
      password: teacherPassword,
      phone: '080-0000-0001',
      schoolId: school.id,
    },
  });
  console.log(`Created teacher: ${teacher.email} (password: teacher123)`);

  // Create Terms
  const currentYear = new Date().getFullYear();
  const terms = [
    { name: 'First Term', year: currentYear, isActive: false },
    { name: 'Second Term', year: currentYear, isActive: false },
    { name: 'Third Term', year: currentYear, isActive: true },
  ];

  for (const term of terms) {
    await prisma.term.create({
      data: {
        name: term.name,
        year: term.year,
        isActive: term.isActive,
        schoolId: school.id,
      },
    });
  }
  console.log(`Created ${terms.length} terms for ${currentYear}`);

  console.log('\n✅ Seeding complete!');
  console.log('📧 Admin login: admin@school.com / admin123');
  console.log('📧 Teacher login: teacher@school.com / teacher123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
