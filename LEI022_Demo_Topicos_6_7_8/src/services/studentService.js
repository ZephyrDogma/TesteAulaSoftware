const prisma = require("../db/prisma");
const AppError = require("../errors/AppError");

async function listStudents({ name, includeEnrolments }) {
  return prisma.student.findMany({
    where: name ? { name: { contains: name, mode: "insensitive" } } : {},
    orderBy: { id: "asc" },
    ...(includeEnrolments ? { include: { enrolments: { include: { course: true } } } } : {})
  });
}

async function getStudent(id) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { enrolments: { include: { course: true } } }
  });
  if (!student) throw new AppError(404, "NOT_FOUND", "Estudante não encontrado.");
  return student;
}

async function createStudent(data) {
  return prisma.student.create({ data });
}

async function updateStudent(id, data) {
  // Controlo otimista: a atualização só ocorre se a versão ainda for a esperada.
  const result = await prisma.student.updateMany({
    where: { id, version: data.version },
    data: { name: data.name, email: data.email, version: { increment: 1 } }
  });
  if (result.count === 0) {
    const exists = await prisma.student.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new AppError(404, "NOT_FOUND", "Estudante não encontrado.");
    throw new AppError(409, "STALE_VERSION", "O estudante foi alterado por outra operação. Recarregue os dados.");
  }
  return prisma.student.findUnique({ where: { id } });
}

async function deleteStudent(id) {
  await prisma.student.delete({ where: { id } });
}
module.exports = { listStudents, getStudent, createStudent, updateStudent, deleteStudent };
