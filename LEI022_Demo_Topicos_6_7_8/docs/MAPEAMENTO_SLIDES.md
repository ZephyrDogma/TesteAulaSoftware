# Mapeamento dos conceitos dos slides para o projeto

| Conceito da apresentação | Onde observar |
|---|---|
| Persistência vs. memória | Criar estudante, reiniciar API e voltar a consultar |
| ORM e mapeamento objeto-relacional | `prisma/schema.prisma` |
| Entidade, domínio e DTO | Modelos Prisma vs. schemas Zod vs. dados da API |
| Camadas API/serviço/ORM/BD | `src/routes`, `src/services`, `src/db`, PostgreSQL |
| N+1 e carregamento de relações | `studentService.listStudents` e `include` |
| Identidade | `Student.id`, `Course.id` |
| Relações 1:N e N:M | `Student`–`Enrolment`–`Course` |
| CRUD | Rotas de estudantes |
| Integridade | `@unique`, `@@unique`, relações e FKs |
| Transações | `enrolmentService.createEnrolment` |
| Concorrência otimista | `Student.version` e `updateStudent` |
| Configuração e segredos | `.env.example`, `src/config/env.js` |
| Validação sintática/estrutural | Zod nos middlewares |
| Erros técnicos vs. domínio | `AppError` vs. erros Prisma |
| Mapeamento para HTTP | `errorHandler.js` |
| Testes de integração/API | `tests/students.test.js` |
| Isolamento da BD de testes | `.env.test`, `DATABASE_URL_TEST` |
