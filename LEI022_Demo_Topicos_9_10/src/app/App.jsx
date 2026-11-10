import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { router } from './routes';

// Instância global do TanStack Query Client (Slide 12)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Ponto de Entrada da Árvore de Componentes
 * Demonstra a composição de Providers:
 * 1. QueryClientProvider (Slide 12: TanStack Query para estado remoto)
 * 2. AuthProvider (Slide 11: Context API para estado partilhado)
 * 3. RouterProvider (Slide 9: React Router para navegação por rotas)
 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
