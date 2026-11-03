/**
 * LEI022 — Demonstração de Concorrência Otimista (Slide 22 e Tópico 7)
 * 
 * Demonstra como o campo explícito `version` impede a sobreposição acidental
 * de edições concorrentes (lost update problem) sem bloquear a base de dados (pesquisas sem locks).
 * 
 * Execução:
 *   node examples/demo-concurrency.js
 */

const { updateStudent, createStudent } = require("../src/services/studentService");
const prisma = require("../src/db/prisma");

async function runConcurrencyDemo() {
  console.log("\n=======================================================");
  console.log("   LEI022 — DEMO DE CONCORRÊNCIA OTIMISTA (VERSION)    ");
  console.log("=======================================================\n");

  // 1. Criar estudante de teste
  const email = `concorrencia_${Date.now()}@exemplo.pt`;
  const student = await createStudent({
    name: "Candidato a Edição",
    email
  });
  console.log(`[Passo 1] Estudante criado na BD: ID=${student.id}, Versão=${student.version}, Nome="${student.name}"`);

  // 2. Simular dois utilizadores (Alice e Bob) a ler o mesmo estudante em simultâneo
  console.log("\n[Passo 2] Dois clientes (Alice e Bob) abrem o formulário ao mesmo tempo:");
  console.log(`  - Alice tem os dados: ID=${student.id}, Versão=${student.version}`);
  console.log(`  - Bob tem os dados:   ID=${student.id}, Versão=${student.version}`);

  // 3. Alice submete a alteração dela primeiro
  console.log("\n[Passo 3] Alice submete a sua edição com versão 1:");
  const aliceUpdate = await updateStudent(student.id, {
    name: "Nome Alterado por Alice",
    email: student.email,
    version: 1
  });
  console.log(`  -> Sucesso para Alice! Versão incrementada na BD para: ${aliceUpdate.version}`);

  // 4. Bob submete a alteração dele alguns segundos depois, sem recarregar os dados
  console.log("\n[Passo 4] Bob tenta submeter a sua edição ainda com a versão 1 (stale):");
  try {
    await updateStudent(student.id, {
      name: "Nome Substituído por Bob",
      email: student.email,
      version: 1 // Versão desatualizada!
    });
    console.error("  -> ERRO: A alteração de Bob não devia ter sido permitida!");
  } catch (err) {
    console.log(`  -> [REJEITADO COM SUCESSO] Código: ${err.code} (HTTP ${err.status})`);
    console.log(`     Mensagem de erro: "${err.message}"`);
  }

  // 5. Verificar o estado final na BD
  const finalState = await prisma.student.findUnique({ where: { id: student.id } });
  console.log("\n[Passo 5] Estado final preservado na Base de Dados:");
  console.log(`  - ID: ${finalState.id}`);
  console.log(`  - Nome: "${finalState.name}" (a alteração de Alice foi mantida)`);
  console.log(`  - Versão: ${finalState.version}`);
  console.log(`  - Conclusão: O Lost Update foi prevenido com sucesso graças ao versionamento otimista!\n`);
}

runConcurrencyDemo()
  .catch(err => {
    console.error("Erro no teste de concorrência:", err.message);
  })
  .finally(() => prisma.$disconnect());
