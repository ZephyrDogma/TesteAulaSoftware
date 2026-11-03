# Guia de demonstração — sequência de aula

## Tópico 6 — Persistência e ORM

1. Mostrar `docker-compose.yml`: PostgreSQL é um serviço separado da API.
2. Explicar `.env.example`: configuração fora do código; nunca versionar `.env`.
3. Mostrar `prisma/schema.prisma`: modelos `Student`, `Course`, `Enrolment`, tipos, PK, FK, UNIQUE e índices.
4. Executar migração e gerar Prisma Client.
5. Comparar `examples/raw-pg-comparison.js` com `studentService.js`.
6. Ativar `SQL_LOG=true` e observar SQL gerado pelo Prisma.
7. Demonstrar N+1: `findMany()` seguido de consulta por estudante; comparar com `include`. Não afirmar que `include` gera sempre uma única instrução: observar o SQL efetivo da versão/configuração.

## Tópico 7 — Entidades, relações, ciclo de vida e CRUD

1. Explicar identidade: `Student.id`; não é a posição do objeto em memória.
2. Explicar 1:N Student–Enrolment e 1:N Course–Enrolment. A entidade associativa `Enrolment` representa a relação N:M entre estudantes e UCs e contém atributos próprios.
3. Demonstrar POST/GET/PUT/DELETE de estudantes.
4. Demonstrar restrições UNIQUE e FK na base de dados.
5. Criar inscrição dentro de `$transaction`.
6. Demonstrar concorrência otimista: `version` é campo explícito, atualizado pela aplicação; Prisma não o gere automaticamente.

## Tópico 8 — Integração, validação, erros e testes

1. Enviar JSON inválido: Zod responde 400 antes de chegar ao serviço.
2. Enviar email repetido: PostgreSQL/Prisma deteta UNIQUE; API traduz para 409.
3. Pedir estudante inexistente: 404.
4. Explicar diferença entre erro de validação (400), conflito com estado (409), regra de domínio (422, se adotado no contrato), falha temporária de BD (503, se detetada) e falha inesperada (500).
5. Executar testes com `DATABASE_URL_TEST` apontada para BD dedicada.
6. Mostrar `beforeEach`: limpa apenas tabelas da BD de testes.
7. Discutir testes unitários de serviços com dependências simuladas como extensão; os testes incluídos são de integração/API com PostgreSQL real.

## Critérios de conclusão

- Projeto inicia a partir de clone limpo.
- Migrações reproduzem o esquema.
- `npm test` usa exclusivamente a BD de teste.
- O aluno explica o SQL e as restrições por detrás das chamadas ORM.
- O README e os exemplos HTTP permitem reproduzir a demonstração.
