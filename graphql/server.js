const { createServer } = require('node:http');
const { createYoga, createSchema } = require('graphql-yoga');

// Base de dados em memória
const cursos = [
  { id: 'c1', sigla: 'EI', nome: 'Engenharia Informática' },
  { id: 'c2', sigla: 'GEST', nome: 'Gestão' }
];

const alunos = [
  { id: '42', nome: 'Maria Silva', email: 'maria.silva@universidade.pt', cursoId: 'c1' },
  { id: '43', nome: 'João Costa', email: null, cursoId: 'c2' }
];


function emailPareceValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 1. Definição do Contrato (Schema)
const typeDefs = /* GraphQL */ `
  type Curso {
    id: ID!
    sigla: String!
    nome: String!
  }

  type Aluno {
    id: ID!
    nome: String!
    email: String
    curso: Curso!
  }

  type Query {
    alunoPorId(id: ID!): Aluno
    listarAlunos: [Aluno!]!
    alunoPorEmail(email: String!): Aluno
  }

  type Mutation {
    atualizarEmail(id: ID!, novoEmail: String!): Aluno!
    criarAluno(id: ID!, nome: String!, email: String, cursoId: ID!): Aluno!
  }
`;

// 2. Implementação dos Resolvers
const resolvers = {
  Aluno: {
    curso(aluno) {
      const curso = cursos.find(c => c.id === aluno.cursoId);
      if (!curso) throw new Error(`Curso não encontrado: ${aluno.cursoId}`);
      return curso;
    }
  },
  Query: {
    alunoPorId: (_, { id }) => alunos.find(a => a.id === id) ?? null,
    listarAlunos: () => alunos,
    alunoPorEmail: (_, { email }) => alunos.find(a => a.email?.toLowerCase() === email.toLowerCase()) ?? null
  },
  Mutation: {
    atualizarEmail: (_, { id, novoEmail }) => {
      const aluno = alunos.find(a => a.id === id);
      if (!aluno) throw new Error(`Aluno ${id} não encontrado`);
      aluno.email = novoEmail;
      return aluno;
    }
    ,
    criarAluno: (_, { id, nome, email, cursoId }) => {
      const cursoExiste = cursos.some(c => c.id === cursoId);
      if (!cursoExiste) {
        throw new Error(`Curso ${cursoId} não existe`);
      }
      if (alunos.some(a => a.id === id)) {
        throw new Error(`Já existe um aluno com ID ${id}`);
      }
      if (!nome || !nome.trim()) {
        throw new Error('O nome não pode estar vazio');
      }
      if (email && !emailPareceValido(email)) {
        throw new Error('Formato de email inválido');
      }
      const novo = { id, nome: nome.trim(), email: email ?? null, cursoId };
      alunos.push(novo);
      return novo;
    }
  }
};

// 3. Inicialização do Servidor GraphQL Yoga
const yoga = createYoga({ 
  schema: createSchema({ typeDefs, resolvers }),
  maskedErrors: false
});
const server = createServer(yoga);

server.listen(4000, () => {
  console.log('🚀 GraphQL disponível em http://localhost:4000/graphql');
});