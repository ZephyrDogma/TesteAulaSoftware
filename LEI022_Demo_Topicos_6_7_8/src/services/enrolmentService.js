const prisma = require("../db/prisma");
const AppError = require("../errors/AppError");

async function createEnrolment({ studentId, courseId }) {
  // Uma unidade lógica de trabalho: verificar e criar dentro da mesma transação.
  return prisma.$transaction(async tx => {
    const [student, course] = await Promise.all([
      tx.student.findUnique({ where: { id: studentId } }),
      tx.course.findUnique({ where: { id: courseId } })
    ]);
    if (!student) throw new AppError(404, "STUDENT_NOT_FOUND", "Estudante não encontrado.");
    if (!course) throw new AppError(404, "COURSE_NOT_FOUND", "Unidade curricular não encontrada.");
    return tx.enrolment.create({
      data: { studentId, courseId },
      include: { student: true, course: true }
    });
  });
}

async function setGrade(id, grade) {
  return prisma.enrolment.update({ where: { id }, data: { grade } });
}
module.exports = { createEnrolment, setGrade };
