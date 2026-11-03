const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const db = await prisma.$transaction(async tx => {
    const students = await Promise.all([
      tx.student.upsert({ where: { email: "ana@exemplo.pt" }, update: {}, create: { name: "Ana Silva", email: "ana@exemplo.pt" } }),
      tx.student.upsert({ where: { email: "bruno@exemplo.pt" }, update: {}, create: { name: "Bruno Costa", email: "bruno@exemplo.pt" } })
    ]);
    const courses = await Promise.all([
      tx.course.upsert({ where: { code: "LEI022" }, update: {}, create: { code: "LEI022", name: "Laboratório de Desenvolvimento de Software", ects: 6 } }),
      tx.course.upsert({ where: { code: "LEI015" }, update: {}, create: { code: "LEI015", name: "Bases de Dados", ects: 6 } })
    ]);
    await tx.enrolment.upsert({
      where: { studentId_courseId: { studentId: students[0].id, courseId: courses[0].id } },
      update: {},
      create: { studentId: students[0].id, courseId: courses[0].id }
    });
    return { students, courses };
  });
  console.log(`Seed concluído: ${db.students.length} estudantes, ${db.courses.length} UCs.`);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
