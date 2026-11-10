import React from 'react';
import { Button } from './Button';

/**
 * Componente de Caixa de Erro (Slide 7: if (status === "error") return <ErrorBox onRetry={load} />)
 */
export function ErrorBox({
  title = 'Ocorreu um erro',
  message = 'Não foi possível carregar os dados solicitados.',
  onRetry,
}) {
  return (
    <div className="error-box" role="alert">
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
          ⚠️ {title}
        </h3>
        <p style={{ fontSize: '0.9rem' }}>{message}</p>
      </div>
      {onRetry && (
        <div>
          <Button variant="danger" onClick={onRetry}>
            🔄 Tentar de novo
          </Button>
        </div>
      )}
    </div>
  );
}
