import React from 'react';

/**
 * Componente de Carregamento (Slide 7: if (status === "loading") return <Spinner />)
 */
export function Spinner({ message = 'A carregar dados...' }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
