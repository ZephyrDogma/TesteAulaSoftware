# LEI022 — Demonstração Prática dos Tópicos 9 e 10
## Interfaces Web, Componentes, Estado, Formulários, Validação e Responsividade

Este projeto é a implementação de referência completa e executável que concretiza todos os conceitos expostos nos slides dos **Tópicos 9 e 10** da Unidade Curricular **LEI022 — Laboratório de Desenvolvimento de Software** (Ano Letivo 2026/27).

---

## 📑 Mapeamento Slide a Slide com o Código da Aplicação

| Slide | Conceito Teórico dos Slides | Ficheiro(s) de Implementação no Projeto |
| :--- | :--- | :--- |
| **Slide 2 & 3** | **Enquadramento & Fronteira de Confiança** (Cliente vs Servidor, Autoridade da API) | [`server/api-server.js`](file:///server/api-server.js), [`src/lib/http.js`](file:///src/lib/http.js) |
| **Slide 4** | **Componentes e Composição** (`StudentsPage`, `StudentFilters`, `StudentList`, `StudentCard`) | [`src/features/students/StudentCard.jsx`](file:///src/features/students/StudentCard.jsx), [`StudentList.jsx`](file:///src/features/students/StudentList.jsx) |
| **Slide 5** | **Props, Estado e Eventos** (Contador, fluxo unidirecional, imutabilidade com `[...items]`) | [`src/features/demos/CounterDemo.jsx`](file:///src/features/demos/CounterDemo.jsx) |
| **Slide 6** | **Consumir a API com `useEffect`** (`AbortController`, `fetch`, `signal`, limpeza `ctrl.abort()`) | [`src/features/students/StudentsPage.jsx`](file:///src/features/students/StudentsPage.jsx) |
| **Slide 7** | **Os Quatro Estados de uma Vista** (`loading`, `error` com retry, `empty`, com dados) | [`src/components/Spinner.jsx`](file:///src/components/Spinner.jsx), [`ErrorBox.jsx`](file:///src/components/ErrorBox.jsx), [`Empty.jsx`](file:///src/components/Empty.jsx) |
| **Slide 8** | **Organização & Cliente HTTP Central** (`request(path, opts)`, `toApiError`, status 204) | [`src/lib/http.js`](file:///src/lib/http.js), [`src/features/students/studentApi.js`](file:///src/features/students/studentApi.js) |
| **Slide 9** | **React Router: Navegação por Rotas** (`createBrowserRouter`, `Layout`, `useParams`, `Link`) | [`src/app/routes.jsx`](file:///src/app/routes.jsx), [`src/app/Layout.jsx`](file:///src/app/Layout.jsx), [`StudentDetail.jsx`](file:///src/features/students/StudentDetail.jsx) |
| **Slide 10** | **Onde Guardar Cada Estado & Estado Derivado** (Local vs Partilhado vs Remoto; `filter`) | [`src/features/demos/DerivedStateDemo.jsx`](file:///src/features/demos/DerivedStateDemo.jsx) |
| **Slide 11** | **Context API: Estado Partilhado** (`AuthProvider`, `AuthContext`, `useAuth()`, Navbar) | [`src/context/AuthContext.jsx`](file:///src/context/AuthContext.jsx), [`src/components/Navbar.jsx`](file:///src/components/Navbar.jsx) |
| **Slide 12** | **TanStack Query: Estado Remoto** (`useQuery`, `useMutation`, `invalidateQueries`, cache) | [`src/features/students/StudentsQueryPage.jsx`](file:///src/features/students/StudentsQueryPage.jsx) |
| **Slide 13** | **Formulário Controlado Completo** (`form`, `errors`, `saving`, prevenção de duplo clique) | [`src/features/students/StudentForm.jsx`](file:///src/features/students/StudentForm.jsx) |
| **Slide 14** | **Validação no Cliente e no Servidor** (Respostas 422 validação e 409 conflito de email) | [`src/features/students/StudentForm.jsx`](file:///src/features/students/StudentForm.jsx), [`server/api-server.js`](file:///server/api-server.js) |
| **Slide 15** | **Responsividade e Acessibilidade** (CSS Grid, `@media (min-width: 48rem)`, `aria-invalid`, `role="alert"`) | [`src/styles/global.css`](file:///src/styles/global.css), [`src/components/FormField.jsx`](file:///src/components/FormField.jsx) |
| **Slide 16** | **Testar o Comportamento Observável** (Vitest, RTL, `getByLabelText`, `getByRole`, MSW) | [`src/features/students/StudentForm.test.jsx`](file:///src/features/students/StudentForm.test.jsx), [`StudentList.test.jsx`](file:///src/features/students/StudentList.test.jsx) |
| **Slide 17** | **7 Erros Comuns e Como Evitá-los** (Tabela comparativa e bug de `key={index}` demonstrado ao vivo) | [`src/features/demos/KeyIndexPitfallDemo.jsx`](file:///src/features/demos/KeyIndexPitfallDemo.jsx), [`CommonErrorsSummary.jsx`](file:///src/features/demos/CommonErrorsSummary.jsx) |
| **Slide 18** | **Ligação à PL / TP3** (Semana 9: Componentes + REST; Semana 10: Estado + Formulários + Testes) | Estrutura modular integral pronta a servir de base ao projeto prático |

---

## 🚀 Como Executar o Projeto

### 1. Instalar as Dependências
Na pasta do projeto, execute:
```bash
npm install
```

### 2. Iniciar a Aplicação (Frontend + Backend Didático)
Para arrancar simultaneamente a API REST na porta `3001` e a aplicação Vite na porta `5173`:
```bash
npm run dev
```

Abra o browser em:
👉 **`http://localhost:5173`**

*(Em alternativa, pode correr os serviços em terminais separados com `npm run dev:api` e `npm run dev:web`)*.

### 3. Executar a Suite de Testes Automatizados
Para correr os testes de componentes, formulários e integração (MSW):
```bash
npm test
```
Para executar em modo contínuo (watch):
```bash
npm run test:watch
```

---

## 🛠️ Estrutura de Ficheiros do Projeto (Slide 8)

```text
LEI022_Demo_Topicos_9_10/
├── server/
│   └── api-server.js           # API REST Express didática (validações 422, conflitos 409, DELETE 204)
├── src/
│   ├── app/
│   │   ├── App.jsx             # Providers: QueryClientProvider, AuthProvider, RouterProvider
│   │   ├── Layout.jsx          # Layout responsivo (Navbar + Sidebar + Main Outlet)
│   │   └── routes.jsx          # Definição declarativa com createBrowserRouter
│   ├── components/
│   │   ├── Button.jsx          # Botão com variantes e estado disabled (saving)
│   │   ├── Empty.jsx           # Vista de estado vazio (Slide 7)
│   │   ├── ErrorBox.jsx        # Vista de erro com retry onRetry (Slide 7)
│   │   ├── FormField.jsx       # Campo acessível: htmlFor, aria-invalid, role="alert" (Slide 15)
│   │   ├── Navbar.jsx          # Barra superior consumindo useAuth() (Slide 11)
│   │   ├── NotFound.jsx        # Rota de recurso para 404 (Slide 9)
│   │   └── Spinner.jsx         # Indicador de estado de carregamento (Slide 7)
│   ├── context/
│   │   └── AuthContext.jsx     # Context API para dados de sessão partilhados (Slide 11)
│   ├── features/
│   │   ├── demos/              # Laboratório Interativo de Conceitos dos Slides
│   │   │   ├── CommonErrorsSummary.jsx     # Tabela de referência dos 7 erros comuns (Slide 17)
│   │   │   ├── ConceptsOverviewPage.jsx    # Página agregadora do laboratório
│   │   │   ├── CounterDemo.jsx             # useState, eventos e imutabilidade de arrays (Slide 5)
│   │   │   ├── DerivedStateDemo.jsx        # Estado derivado vs estado duplicado desatualizado (Slide 10)
│   │   │   ├── KeyIndexPitfallDemo.jsx     # Demonstração viva do bug de key={index} (Slide 17)
│   │   │   └── ResponsivenessAndA11yDemo.jsx # Demonstração de grelha CSS e a11y (Slide 15)
│   │   └── students/           # Funcionalidade de Gestão de Estudantes
│   │       ├── studentApi.js               # Cliente da API com métodos CRUD (Slide 8)
│   │       ├── StudentCard.jsx             # Cartão individual com dados e ações (Slide 4)
│   │       ├── StudentCreatePage.jsx       # Página de registo
│   │       ├── StudentDetail.jsx           # Detalhe do estudante consumindo useParams (Slide 9)
│   │       ├── StudentEditPage.jsx         # Página de edição
│   │       ├── StudentFilters.jsx          # Componente de filtros (pesquisa e estado) (Slide 4)
│   │       ├── StudentForm.jsx             # Formulário controlado com validação 422/409 (Slide 13/14)
│   │       ├── StudentList.jsx             # Grelha de cartões com key={id} (Slide 4)
│   │       ├── StudentsPage.jsx            # Vista principal REST gerida com useEffect (Slide 6/7)
│   │       └── StudentsQueryPage.jsx       # Vista idêntica gerida com TanStack Query (Slide 12)
│   ├── lib/
│   │   └── http.js             # request() centralizado com tratamento de res.ok e 204 (Slide 8)
│   ├── styles/
│   │   └── global.css          # CSS responsivo: .grid, @media (min-width: 48rem), a11y
│   ├── test/
│   │   ├── server.js           # Configuração do MSW (Mock Service Worker)
│   │   └── setup.js            # Setup do Vitest e jest-dom
│   └── main.jsx                # Ponto de entrada React 18 DOM
├── .env                        # Variáveis de ambiente da aplicação (VITE_API_URL)
├── index.html                  # Ficheiro HTML raiz
├── package.json                # Dependências e scripts de execução
└── vite.config.js              # Configuração do Vite e Vitest
```

---

## 💡 Como Usar em Aula com os Alunos

1. **Demonstração A (Semana 9): Consumo REST, Ciclo de Vida e 4 Estados**
   - Abra a página `/students`.
   - Utilize a caixa de controlos didáticos para injetar latência de rede (800ms) e observar o componente `<Spinner />`.
   - Ative o checkbox *"Simular falha HTTP 500"* e recarregue: observe o componente `<ErrorBox />` e teste o botão *"Tentar de novo"*.
   - Escreva no filtro de pesquisa um nome inexistente (ex: `"xyz"`): observe o componente `<Empty text="Nenhum estudante..." />`.

2. **Demonstração B (Semana 10): Formulário Controlado e Validação em 2 Camadas**
   - Aceda a `/students/new`.
   - Clique em **Guardar** sem preencher nada: observe a validação rápida no cliente com feedback instantâneo e atributos acessíveis.
   - Preencha o email com `"ana.silva@escola.pt"` (email que já existe no seed): submeta e observe a API a devolver status `409 Conflito`. O erro aparece junto ao campo do email e os dados preenchidos mantêm-se intactos!

3. **Demonstração C: Laboratório de Conceitos (`/demos`)**
   - **Slide 5:** Clique no botão de *push()* proibido vs *[...items, novo]*.
   - **Slide 10:** Mostre a desincronização entre a lista filtrada em `useState` e o estado derivado.
   - **Slide 17:** No teste de `key={index}`, escreva nas caixas de texto e elimine o primeiro item para ver o bug do estado trocado diante dos olhos dos estudantes!

4. **Demonstração D: Comparação `useEffect` vs `TanStack Query` (`/students/query`)**
   - Mostre como o TanStack Query faz cache automática, deduplica pedidos, cancela requisições desnecessárias e invalida o cache declarativamente após uma mutação.
