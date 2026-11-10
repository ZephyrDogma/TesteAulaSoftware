import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { StudentsPage } from '../features/students/StudentsPage';
import { StudentDetail } from '../features/students/StudentDetail';
import { StudentCreatePage } from '../features/students/StudentCreatePage';
import { StudentEditPage } from '../features/students/StudentEditPage';
import { StudentsQueryPage } from '../features/students/StudentsQueryPage';
import { ConceptsOverviewPage } from '../features/demos/ConceptsOverviewPage';
import { NotFound } from '../components/NotFound';

/**
 * Definição Declarativa de Rotas com React Router
 * Baseado no Slide 9 da UC LEI022:
 * - Layout partilhado no nó raiz
 * - Sub-rotas dinâmicas (/students/:id com useParams)
 * - Rota de recurso para páginas inexistentes ({ path: "*", element: <NotFound /> })
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/students" replace />,
      },
      {
        path: 'students',
        element: <StudentsPage />,
      },
      {
        path: 'students/new',
        element: <StudentCreatePage />,
      },
      {
        path: 'students/:id',
        element: <StudentDetail />,
      },
      {
        path: 'students/:id/edit',
        element: <StudentEditPage />,
      },
      {
        path: 'students/query',
        element: <StudentsQueryPage />,
      },
      {
        path: 'demos',
        element: <ConceptsOverviewPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
