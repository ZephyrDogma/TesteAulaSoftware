/**
 * LEI022 — Demonstração Prática do Problema N+1 (Exercício Slide 13)
 * 
 * Compara três estratégias de carregamento de relações:
 * 1. Abordagem ingénua (N+1 queries)
 * 2. Prisma ORM com include (queries agrupadas com IN)
 * 3. SQL direto com LEFT JOIN (1 query)
 * 
 * Execução:
 *   node examples/demo-n-plus-one.js
 */

const { PrismaClient } = require("@prisma/client");
const { getDatabaseUrl } = require("../src/config/env");

let queryCount = 0;
const queriesExecuted = [];

const prisma = new PrismaClient({
  datasources: { db: { url: getDatabaseUrl() } },
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" }
  ]
});

prisma.$on("query", (e) => {
  queryCount++;
  queriesExecuted.push(e.query);
});

async function seedDataIfRequired(targetStudents = 50) {
  const currentCount = await prisma.student.count();
  if (currentCount >= targetStudents) {
    console.log(`[Seed] A base de dados já tem ${currentCount} estudantes. Reutilizando dados existentes.`);
    return;
  }

  console.log(`[Seed] A povoar base de dados com ${targetStudents} estudantes para o teste N+1...`);
  
  // Garantir UC de teste
  const course = await prisma.course.upsert({
    where: { code: "LEI022" },
    update: {},
    create: { code: "LEI022", name: "Laboratório de Desenvolvimento de Software", ects: 6 }
  });

  const remaining = targetStudents - currentCount;
  for (let i = 1; i <= remaining; i++) {
    const studentNum = currentCount + i;
    const student = await prisma.student.create({
      data: {
        name: `Estudante Teste ${studentNum}`,
        email: `aluno${studentNum}_bench@lei022.pt`
      }
    });

    // Inscrever em LEI022
    await prisma.enrolment.create({
      data: {
        studentId: student.id,
        courseId: course.id
      }
    });
  }

  console.log(`[Seed] Concluído! Total atual de estudantes: ${await prisma.student.count()}`);
}

async function runBenchmark() {
  console.log("\n=======================================================");
  console.log("   LEI022 — BENCHMARK DO PROBLEMA N+1 (SLIDE 13)       ");
  console.log("=======================================================\n");

  await seedDataIfRequired(50);
  const totalStudents = await prisma.student.count();
  console.log(`\nBase de teste com ${totalStudents} estudantes.\n`);

  // -----------------------------------------------------------------
  // ESTRATÉGIA 1: Abordagem ingénua (N+1 queries)
  // -----------------------------------------------------------------
  queryCount = 0;
  queriesExecuted.length = 0;
  console.log("-> Executando Estratégia 1: Ciclo de consultas individuais (N+1)...");
  
  const t1Start = performance.now();
  const studentsNaive = await prisma.student.findMany({ take: 50 });
  const naiveResults = [];
  for (const s of studentsNaive) {
    const enrolments = await prisma.enrolment.findMany({
      where: { studentId: s.id }
    });
    naiveResults.push({ ...s, enrolments });
  }
  const t1Duration = (performance.now() - t1Start).toFixed(2);
  const q1Count = queryCount;
  console.log(`   Tempo: ${t1Duration} ms | Total de queries SQL executadas: ${q1Count}`);

  // -----------------------------------------------------------------
  // ESTRATÉGIA 2: Prisma ORM com include (queries agrupadas)
  // -----------------------------------------------------------------
  queryCount = 0;
  queriesExecuted.length = 0;
  console.log("\n-> Executando Estratégia 2: Prisma findMany com include...");
  
  const t2Start = performance.now();
  const studentsInclude = await prisma.student.findMany({
    take: 50,
    include: { enrolments: true }
  });
  const t2Duration = (performance.now() - t2Start).toFixed(2);
  const q2Count = queryCount;
  console.log(`   Tempo: ${t2Duration} ms | Total de queries SQL executadas: ${q2Count}`);
  if (queriesExecuted.length > 0) {
    console.log("   SQL executado pelo Prisma include:");
    queriesExecuted.forEach((q, idx) => console.log(`     [Query ${idx + 1}] ${q.slice(0, 95)}...`));
  }

  // -----------------------------------------------------------------
  // ESTRATÉGIA 3: SQL direto com LEFT JOIN
  // -----------------------------------------------------------------
  queryCount = 0;
  queriesExecuted.length = 0;
  console.log("\n-> Executando Estratégia 3: Raw SQL com LEFT JOIN único...");
  
  const t3Start = performance.now();
  const rawJoin = await prisma.$queryRaw`
    SELECT s.id, s.name, s.email, e.id AS enrolment_id, e."courseId"
    FROM students s
    LEFT JOIN enrolments e ON e."studentId" = s.id
    LIMIT 50
  `;
  const t3Duration = (performance.now() - t3Start).toFixed(2);
  const q3Count = queryCount;
  console.log(`   Tempo: ${t3Duration} ms | Total de queries SQL executadas: ${q3Count}`);

  // -----------------------------------------------------------------
  // QUADRO COMPARATIVO E CONCLUSÃO PEDAGÓGICA
  // -----------------------------------------------------------------
  console.log("\n=======================================================");
  console.log("             QUADRO RESUMO DE PERFORMANCE             ");
  console.log("=======================================================");
  console.table([
    {
      "Estratégia": "1. N+1 (Ciclo manual)",
      "Queries SQL": `${q1Count} (1 inicial + ${q1Count - 1} no ciclo)`,
      "Tempo (ms)": `${t1Duration} ms`,
      "Vantagens / Inconvenientes": "Pior desempenho; satura conexões à BD"
    },
    {
      "Estratégia": "2. Prisma (include)",
      "Queries SQL": `${q2Count} (Agrupamento com WHERE studentId IN (...))`,
      "Tempo (ms)": `${t2Duration} ms`,
      "Vantagens / Inconvenientes": "Excelente equilíbrio; sem duplicação de dados"
    },
    {
      "Estratégia": "3. SQL (LEFT JOIN)",
      "Queries SQL": `${q3Count} (Apenas 1 round-trip à base de dados)`,
      "Tempo (ms)": `${t3Duration} ms`,
      "Vantagens / Inconvenientes": "1 round-trip; duplica colunas pai em memória"
    }
  ]);

  console.log("\n[Takeaway Pedagógico para a Aula]:");
  console.log("1. include NÃO significa que o ORM faça sempre 1 único JOIN!");
  console.log("   O Prisma opta frequentemente por 2 queries agrupadas com 'IN (...)' para evitar");
  console.log("   o fenómeno de explosão de dados (duplicação de colunas em relações N:M).");
  console.log("2. Menos queries não é sinónimo obrigatório de menor custo global.");
  console.log("3. O desenvolvedor deve inspecionar sempre o SQL real através de logs e EXPLAIN ANALYZE.\n");
}

runBenchmark()
  .catch(err => {
    console.error("Erro durante o benchmark:", err.message);
    if (err.message.includes("Can't reach database server")) {
      console.log("\nAVISO: O PostgreSQL parece estar offline. Certifique-se de executar:");
      console.log("  docker compose up -d\n");
    }
  })
  .finally(() => prisma.$disconnect());
