import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Barra de Navegação Superior
 * Demonstra o consumo do estado partilhado via Context API (Slide 11: const { user } = useAuth())
 */
export function Navbar() {
  const { user, loginAs, logout } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <NavLink to="/" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>
          🎓 LEI022 <span style={{ color: '#38bdf8', fontWeight: 400 }}>| Tópicos 9 e 10</span>
        </NavLink>
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Estudantes (REST)
              </NavLink>
            </li>
            <li>
              <NavLink to="/students/query" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                TanStack Query
              </NavLink>
            </li>
            <li>
              <NavLink to="/demos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Laboratório de Conceitos
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
        {user ? (
          <>
            <span style={{ color: '#94a3b8' }}>
              Sessão: <strong style={{ color: '#f8fafc' }}>{user.name}</strong> ({user.role})
            </span>
            <button
              onClick={() => loginAs(user.role === 'docente' ? 'estudante' : 'docente')}
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#f8fafc', borderColor: '#475569' }}
              title="Demonstra a re-renderização de consumidores ao alterar o Context (Slide 11)"
            >
              Trocar Papel
            </button>
            <button
              onClick={logout}
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#f87171', borderColor: '#475569' }}
            >
              Sair
            </button>
          </>
        ) : (
          <button
            onClick={() => loginAs('docente')}
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            Entrar como Docente
          </button>
        )}
      </div>
    </header>
  );
}
