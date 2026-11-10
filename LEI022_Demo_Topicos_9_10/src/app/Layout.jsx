import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

/**
 * Componente Layout Principal
 * Baseado no Slide 9 (createBrowserRouter com Layout pai e Outlet filho)
 * e Slide 15 (layout de grelha responsivo com sidebar e main)
 */
export function Layout() {
  return (
    <div className="app-container">
      {/* Navbar Superior (Slide 11: consome AuthContext) */}
      <Navbar />

      {/* Slide 15: Layout de 1 coluna móvel que muda para 2 colunas em desktop */}
      <div className="layout">
        {/* Barra Lateral de Navegação e Contexto da Aula */}
        <aside className="sidebar">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
              Navegação do Projeto
            </span>
            <ul style={{ listStyle: 'none', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>
                <NavLink
                  to="/students"
                  end
                  className={({ isActive }) => `btn btn-outline ${isActive ? 'btn-primary' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                >
                  📋 Lista (REST + useEffect)
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/students/new"
                  className={({ isActive }) => `btn btn-outline ${isActive ? 'btn-primary' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                >
                  ➕ Novo Estudante (Form)
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/students/query"
                  className={({ isActive }) => `btn btn-outline ${isActive ? 'btn-primary' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                >
                  ⚡ TanStack Query (Cache)
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/demos"
                  className={({ isActive }) => `btn btn-outline ${isActive ? 'btn-primary' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                >
                  🔬 Laboratório de Conceitos
                </NavLink>
              </li>
            </ul>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#475569' }}>
            <strong style={{ display: 'block', color: '#1e293b', marginBottom: '0.25rem' }}>
              📖 Tópicos Abordados:
            </strong>
            <p>• Tópico 9: Componentes, Props, Eventos, useEffect, 4 Estados, Rotas</p>
            <p style={{ marginTop: '0.25rem' }}>• Tópico 10: Estado Local/Partilhado/Remoto, Forms, Validação 422/409, a11y</p>
          </div>
        </aside>

        {/* Área Principal de Conteúdo das Rotas */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
