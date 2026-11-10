import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente NotFound (Slide 9: { path: "*", element: <NotFound /> })
 */
export function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-primary)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Página Não Encontrada</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '450px', marginInline: 'auto' }}>
        A rota solicitada não existe nesta aplicação de página única (SPA).
      </p>
      <Link to="/students" className="btn btn-primary">
        Voltar à Página Principal
      </Link>
    </div>
  );
}
