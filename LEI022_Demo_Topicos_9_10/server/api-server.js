/**
 * Servidor API REST Didático para os Tópicos 9 e 10 (LEI022)
 *
 * Implementa os contratos discutidos nas aulas:
 * - Slide 3: Servidor como autoridade final (validação, integridade)
 * - Slide 6: Suporte a CORS
 * - Slide 8: Resposta 204 sem corpo em DELETE
 * - Slide 14: Resposta 422 para dados inválidos e 409 para conflitos (email duplicado)
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Dados iniciais de demonstração (Seed)
const INITIAL_STUDENTS = [
  { id: 1, name: "Ana Silva", email: "ana.silva@escola.pt", active: true, course: "Engenharia Informática" },
  { id: 2, name: "Bruno Santos", email: "bruno.santos@escola.pt", active: true, course: "Engenharia Informática" },
  { id: 3, name: "Catarina Ferreira", email: "catarina.f@escola.pt", active: false, course: "Ciência de Computadores" },
  { id: 4, name: "Diogo Martins", email: "diogo.martins@escola.pt", active: true, course: "Engenharia Informática" },
  { id: 5, name: "Eva Rodrigues", email: "eva.rodrigues@escola.pt", active: true, course: "Sistemas de Informação" }
];

let students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
let nextId = 6;

// Middleware de simulação de atraso de rede e falha forçada (para fins pedagógicos)
app.use((req, res, next) => {
  const delay = parseInt(req.query.delay || '0', 10);
  const shouldFail = req.query.fail === 'true' || req.query.fail === '1';

  if (shouldFail) {
    return setTimeout(() => {
      res.status(500).json({
        status: 500,
        title: "Erro interno simulado",
        message: "O servidor simulou uma falha interna para demonstrar o tratamento de erros e retentativas no cliente."
      });
    }, delay || 400);
  }

  if (delay > 0) {
    setTimeout(next, delay);
  } else {
    next();
  }
});

// GET /api/students - Listagem com filtros
app.get('/api/students', (req, res) => {
  const { name, active } = req.query;
  let result = [...students];

  if (name) {
    const term = name.trim().toLowerCase();
    result = result.filter(s => s.name.toLowerCase().includes(term));
  }

  if (active !== undefined && active !== 'all') {
    const isActive = active === 'true' || active === true;
    result = result.filter(s => s.active === isActive);
  }

  res.json(result);
});

// GET /api/students/:id - Detalhe do estudante
app.get('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({
      status: 404,
      title: "Estudante não encontrado",
      message: `Não existe nenhum estudante com o ID ${id}.`
    });
  }

  res.json(student);
});

// POST /api/students - Criação com validação autoritativa (Slides 13 e 14)
app.post('/api/students', (req, res) => {
  const { name, email, course, active = true } = req.body || {};
  const errors = {};

  // Validação dos campos (Slide 14: 422 dados inválidos campo a campo)
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = "O nome é obrigatório e deve ter pelo menos 2 caracteres.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.email = "Formato de email inválido.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      status: 422,
      title: "Falha na validação",
      errors
    });
  }

  // Verificação de unicidade (Slide 14: 409 conflito, ex: email já existe)
  const emailNorm = email.trim().toLowerCase();
  const exists = students.some(s => s.email.toLowerCase() === emailNorm);
  if (exists) {
    return res.status(409).json({
      status: 409,
      title: "Conflito de dados",
      errors: {
        email: "Já existe um estudante registado com este endereço de email."
      }
    });
  }

  const newStudent = {
    id: nextId++,
    name: name.trim(),
    email: emailNorm,
    course: course ? course.trim() : "Engenharia Informática",
    active: Boolean(active)
  };

  students.push(newStudent);
  res.status(201).location(`/api/students/${newStudent.id}`).json(newStudent);
});

// PUT /api/students/:id - Atualização completa
app.put('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      status: 404,
      title: "Estudante não encontrado",
      message: `Não existe nenhum estudante com o ID ${id}.`
    });
  }

  const { name, email, course, active } = req.body || {};
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = "O nome é obrigatório e deve ter pelo menos 2 caracteres.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.email = "Formato de email inválido.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      status: 422,
      title: "Falha na validação",
      errors
    });
  }

  // Unicidade de email excluindo o próprio
  const emailNorm = email.trim().toLowerCase();
  const duplicate = students.some(s => s.id !== id && s.email.toLowerCase() === emailNorm);
  if (duplicate) {
    return res.status(409).json({
      status: 409,
      title: "Conflito de dados",
      errors: {
        email: "Já existe outro estudante registado com este endereço de email."
      }
    });
  }

  students[index] = {
    ...students[index],
    name: name.trim(),
    email: emailNorm,
    course: course !== undefined ? course.trim() : students[index].course,
    active: active !== undefined ? Boolean(active) : students[index].active
  };

  res.json(students[index]);
});

// DELETE /api/students/:id - Remoção (Slide 8: status 204 No Content sem corpo)
app.delete('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const exists = students.some(s => s.id === id);

  if (!exists) {
    return res.status(404).json({
      status: 404,
      title: "Estudante não encontrado",
      message: `Não existe nenhum estudante com o ID ${id}.`
    });
  }

  students = students.filter(s => s.id !== id);
  res.status(204).end();
});

// POST /api/reset - Repor estado inicial dos dados para facilitar as aulas
app.post('/api/reset', (req, res) => {
  students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
  nextId = 6;
  res.json({ message: "Dados repostos com sucesso!", total: students.length });
});

app.listen(PORT, () => {
  console.log(`[API Server] Servidor didático em execução em http://localhost:${PORT}`);
  console.log(`[API Server] Endpoints: GET/POST /api/students, GET/PUT/DELETE /api/students/:id`);
});
