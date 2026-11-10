import React from 'react';

/**
 * Componente StudentFilters
 * Decomposição e responsabilidade única (Slide 4).
 * Emite eventos para o componente pai atualizar os filtros (Slide 5: fluxo unidirecional).
 */
export function StudentFilters({ search, onSearchChange, activeFilter, onActiveFilterChange }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{ flex: '1 1 240px' }}>
        <label htmlFor="search-student" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
          Pesquisar por nome:
        </label>
        <input
          id="search-student"
          type="search"
          placeholder="Ex: Ana, Bruno..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input"
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ flex: '0 1 200px' }}>
        <label htmlFor="filter-active" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
          Estado da matrícula:
        </label>
        <select
          id="filter-active"
          value={activeFilter}
          onChange={(e) => onActiveFilterChange(e.target.value)}
          className="select"
          style={{ width: '100%' }}
        >
          <option value="all">Todos os estudantes</option>
          <option value="true">Apenas Ativos</option>
          <option value="false">Apenas Inativos</option>
        </select>
      </div>
    </div>
  );
}
