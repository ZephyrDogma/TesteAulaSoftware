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

describe("API de estudantes (integração com PostgreSQL real de teste)", () => {
  test("cria estudante e devolve 201", async () => {
    const response = await request(app).post("/api/students")
      .send({ name: "Carla Martins", email: "carla@exemplo.pt" });
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.version).toBe(1);
  });

  test("rejeita estrutura inválida com 400", async () => {
    const response = await request(app).post("/api/students")
      .send({ name: "C", email: "nao-e-email" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("traduz duplicação de email para 409", async () => {
    await request(app).post("/api/students").send({ name: "Ana Silva", email: "ana@exemplo.pt" });
    const response = await request(app).post("/api/students").send({ name: "Outra Ana", email: "ana@exemplo.pt" });
    expect(response.status).toBe(409);
  });

  test("atualiza com versionamento otimista e rejeita versão antiga", async () => {
    const created = await request(app).post("/api/students")
      .send({ name: "Diogo Lopes", email: "diogo@exemplo.pt" });
    const id = created.body.id;
    const update = await request(app).put(`/api/students/${id}`)
      .send({ name: "Diogo L.", email: "diogo@exemplo.pt", version: 1 });
    expect(update.status).toBe(200);
    expect(update.body.version).toBe(2);

    const stale = await request(app).put(`/api/students/${id}`)
      .send({ name: "Nome antigo", email: "diogo@exemplo.pt", version: 1 });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe("STALE_VERSION");
  });

  test("devolve 404 para estudante inexistente", async () => {
    const response = await request(app).get("/api/students/99999");
    expect(response.status).toBe(404);
  });
});
