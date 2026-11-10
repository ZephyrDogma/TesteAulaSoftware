import React from 'react';

/**
 * Componente de Vista Vazia (Slide 7: if (students.length === 0) return <Empty text="Sem alunos" />)
 */
export function Empty({
  text = 'Sem dados para apresentar',
  action,
}) {
  return (
    <div className="empty-box">
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
      <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        {text}
      </p>
      <p style={{ fontSize: '0.875rem', marginBottom: action ? '1rem' : 0 }}>
        Nenhum registo encontrado com os critérios selecionados.
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
