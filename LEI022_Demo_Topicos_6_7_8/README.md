# LEI022 — Projeto de demonstração dos Tópicos 6, 7 e 8

Projeto de referência para demonstrar persistência aplicacional, ORM, entidades, relações, CRUD, transações, concorrência, validação, erros e testes.

**Domínio:** estudantes, unidades curriculares e inscrições.  
**Stack:** Node.js, Express, PostgreSQL, Prisma ORM, Zod, Jest e Supertest.

> Este projeto é um exemplo didático autónomo. Na aplicação dos estudantes, a evolução deve ser feita sobre o projeto TP1, preservando o domínio, os endpoints e os contratos existentes. O domínio académico aqui usado corresponde ao modelo conceptual dos slides e pode ser substituído pelo domínio do TP1.

## 1. Pré-requisitos

- Node.js 20 ou superior
- npm
- Docker Desktop / Docker Engine com Docker Compose
- Git (recomendado)

## 2. Instalação do zero

```bash
git clone <URL_DO_REPOSITORIO>
cd LEI022_Demo_Topicos_6_7_8
npm install
cp .env.example .env
```

No Windows PowerShell, em vez de `cp`:

```powershell
Copy-Item .env.example .env
```

Iniciar PostgreSQL:

```bash
docker compose up -d
```

Gerar Prisma Client e criar esquema:

```bash
npm run prisma:generate
npx prisma migrate dev
npm run db:seed
```

Iniciar API:

```bash
npm run dev
```

Verificar: `GET http://localhost:3000/health`

## 3. Estrutura

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/          # configuração
│   ├── db/               # Prisma Client
│   ├── errors/           # erro aplicacional
│   ├── middleware/       # validação e tratamento de erros
│   ├── routes/           # fronteira HTTP
│   ├── schemas/          # esquemas Zod
│   ├── services/         # regras e coordenação
│   ├── app.js
│   └── server.js
├── tests/
├── examples/
├── docs/
├── docker-compose.yml
└── README.md
```

## 4. Modelo de dados

- `Student`: estudante identificado por `id`; email único; `version` para controlo otimista.
- `Course`: unidade curricular identificada por `id`; código único.
- `Enrolment`: associação entre estudante e UC, com data e classificação opcionais.
- Um estudante pode ter várias inscrições; uma UC pode ter várias inscrições.
- A combinação `(studentId, courseId)` é única.

A relação conceptual Student–Course é N:M e é implementada através da entidade associativa `Enrolment`, que tem atributos próprios.

## 5. API disponível

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/health` | Estado do serviço |
| GET | `/api/students` | Listar estudantes |
| GET | `/api/students?name=ana` | Filtrar por nome |
| GET | `/api/students?include=enrolments` | Listar com inscrições |
| GET | `/api/students/:id` | Consultar estudante |
| POST | `/api/students` | Criar estudante |
| PUT | `/api/students/:id` | Atualizar com controlo de versão |
| DELETE | `/api/students/:id` | Remover estudante |
| GET | `/api/courses` | Listar UCs |
| POST | `/api/courses` | Criar UC |
| POST | `/api/enrolments` | Inscrever estudante numa UC |
| PATCH | `/api/enrolments/:id/grade` | Registar classificação |

Pedidos prontos a usar: `examples/requests.http`.

## 6. Validação e respostas de erro

- JSON/campos estruturalmente inválidos: `400 Bad Request`.
- Recurso inexistente: `404 Not Found`.
- Email/código duplicado ou conflito de concorrência: `409 Conflict`.
- Falha inesperada: `500 Internal Server Error`.
- Uma regra de domínio que rejeite dados estruturalmente válidos pode ser representada por `422 Unprocessable Content`, se esse for o contrato adotado.
- Uma indisponibilidade temporária da base de dados pode justificar `503 Service Unavailable`, quando identificada como tal.

A API não devolve stack traces nem detalhes internos ao cliente.

## 7. Transações e concorrência

`createEnrolment` usa `$transaction` para agrupar verificações e criação numa unidade lógica de trabalho.

`Student.version` é um campo explícito. A aplicação compara a versão recebida com a versão atual e incrementa-a apenas quando a atualização é aceite. Prisma não cria nem gere automaticamente este campo.

## 8. Comparação com SQL direto

`examples/raw-pg-comparison.js` mostra acesso sem ORM com `pg`, parâmetros SQL, `JOIN` e transação explícita.

Para executar esse exemplo, instalar a dependência adicional:

```bash
npm install pg
```

O exemplo pressupõe que as migrações Prisma já criaram as tabelas. A comparação serve para observar responsabilidades que passam a ser tratadas pelo ORM, não para afirmar que SQL direto é incorreto ou que ORM é sempre mais eficiente.

## 9. Testes — muito importante

Criar uma base de dados separada:

```bash
docker exec -it lei022-postgres createdb -U postgres lei022_demo_test
```

Criar `.env.test` (não versionar):

```env
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/lei022_demo_test?schema=public"
```

Aplicar migrações à base de testes:

```bash
set NODE_ENV=test
npx prisma migrate deploy
```

No PowerShell:

```powershell
$env:NODE_ENV="test"
npx prisma migrate deploy
```

Executar testes:

```bash
npm test
```

**Nunca configurar `DATABASE_URL_TEST` com a base de desenvolvimento ou produção.** Os testes executam `deleteMany()` para isolar os casos e devem operar apenas sobre a base dedicada.

## 10. Exploração pedagógica sugerida

### Demonstração A — persistência
1. Criar estudante.
2. Reiniciar a API.
3. Consultar estudante novamente.
4. Concluir que o estado persiste para além do processo.

### Demonstração B — restrições
1. Criar estudante com email.
2. Repetir o email.
3. Observar `409 Conflict`.
4. Explicar que a garantia final está na restrição `UNIQUE` da BD.

### Demonstração C — relações e N+1
1. Consultar estudantes sem relações.
2. Fazer consultas individuais de inscrições num ciclo.
3. Contar as operações SQL.
4. Comparar com `include: { enrolments: true }`.
5. Observar SQL real; o número/estratégia de instruções depende da versão e configuração.

### Demonstração D — transação
1. Criar uma inscrição válida.
2. Tentar inscrição com estudante ou UC inexistente.
3. Tentar duplicar a inscrição.
4. Explicar atomicidade e restrições de integridade.

### Demonstração E — testes
1. Executar `npm test`.
2. Alterar uma regra e observar o teste falhar.
3. Repor a regra e executar novamente.
4. Mostrar que os testes usam BD própria.

## 11. Limitações intencionais

- Não inclui autenticação/autorização: não é objetivo dos tópicos demonstrados.
- Não inclui frontend: o foco é a integração API–serviço–persistência. O frontend TP1 deve continuar a consumir a API HTTP.
- A política de classificação e as regras académicas são simplificadas.
- Os testes fornecidos são testes de integração/API. Testes unitários isolados com mocks podem ser acrescentados como exercício.
- A API é uma base didática, não uma aplicação pronta para produção.

## 12. Relação com os tópicos da apresentação

| Tópico | Código / evidência |
|---|---|
| 6 — Persistência e ORM | `schema.prisma`, `db/prisma.js`, `raw-pg-comparison.js`, `.env.example` |
| 7 — Entidades, relações, ciclo de vida e CRUD | `Student`, `Course`, `Enrolment`, rotas e serviços |
| 7 — Transações e concorrência | `enrolmentService.js`, `studentService.js` (`version`) |
| 8 — Validação e fronteira API | `schemas/`, `middleware/validate.js` |
| 8 — Erros | `middleware/errorHandler.js` |
| 8 — Testes | `tests/students.test.js`, `.env.test` |
