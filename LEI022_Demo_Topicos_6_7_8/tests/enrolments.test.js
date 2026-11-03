const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/db/prisma");

beforeEach(async () => {
  await prisma.enrolment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("API de inscrições e transações (integração)", () => {
  test("cria inscrição com sucesso dentro de transação", async () => {
    // 1. Criar estudante e UC prévios
    const studentRes = await request(app).post("/api/students")
      .send({ name: "Beatriz Ramos", email: "beatriz@exemplo.pt" });
    const courseRes = await request(app).post("/api/courses")
      .send({ code: "LEI101", name: "Arquitetura de Software", ects: 6 });

    // 2. Criar inscrição
    const res = await request(app).post("/api/enrolments")
      .send({ studentId: studentRes.body.id, courseId: courseRes.body.id });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.studentId).toBe(studentRes.body.id);
    expect(res.body.courseId).toBe(courseRes.body.id);
  });

  test("rejeita inscrição com estudante inexistente (404)", async () => {
    const courseRes = await request(app).post("/api/courses")
      .send({ code: "LEI102", name: "Segurança Informática", ects: 6 });

    const res = await request(app).post("/api/enrolments")
      .send({ studentId: 9999, courseId: courseRes.body.id });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("STUDENT_NOT_FOUND");
  });

  test("rejeita inscrição duplicada com 409 (@@unique)", async () => {
    const studentRes = await request(app).post("/api/students")
      .send({ name: "Carlos Melo", email: "carlos@exemplo.pt" });
    const courseRes = await request(app).post("/api/courses")
      .send({ code: "LEI103", name: "Inteligência Artificial", ects: 6 });

    await request(app).post("/api/enrolments")
      .send({ studentId: studentRes.body.id, courseId: courseRes.body.id });

    // Segunda tentativa igual
    const res = await request(app).post("/api/enrolments")
      .send({ studentId: studentRes.body.id, courseId: courseRes.body.id });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("RESOURCE_CONFLICT");
  });

  test("atualiza classificação de inscrição existente", async () => {
    const studentRes = await request(app).post("/api/students")
      .send({ name: "Diana Costa", email: "diana@exemplo.pt" });
    const courseRes = await request(app).post("/api/courses")
      .send({ code: "LEI104", name: "Compiladores", ects: 6 });
    const enrolRes = await request(app).post("/api/enrolments")
      .send({ studentId: studentRes.body.id, courseId: courseRes.body.id });

    const res = await request(app).patch(`/api/enrolments/${enrolRes.body.id}/grade`)
      .send({ grade: 18.5 });

    expect(res.status).toBe(200);
    expect(res.body.grade).toBe(18.5);
  });
});
