import React, { useState } from 'react';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';

/**
 * Demonstração do Slide 15: Responsividade CSS e Acessibilidade (a11y)
 */
export function ResponsivenessAndA11yDemo() {
  const [testEmail, setTestEmail] = useState('email-invalido');
  const [showError, setShowError] = useState(true);

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        4. Responsividade e Acessibilidade — a11y (Slide 15)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Acessibilidade em Ação */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Acessibilidade no Leitor de Ecrã:
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Inspecione no DevTools os atributos <code>aria-invalid</code>, <code>aria-describedby="email-err"</code> e <code>role="alert"</code>.
          </p>

          <FormField
            id="demo-email"
            label="Email de Demonstração"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            error={showError ? 'Formato de email inválido (Slide 15)' : ''}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setShowError(!showError)} style={{ fontSize: '0.8rem' }}>
              Alternar Erro ({showError ? 'Ligado' : 'Desligado'})
            </Button>
          </div>
        </div>

        {/* Resumo da Arquitetura CSS Responsiva */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            CSS Grid e Media Query (Slide 15):
          </h4>
          <pre className="code-box" style={{ fontSize: '0.75rem' }}>{`/* Slide 15: CSS Responsivo */
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 
    repeat(auto-fill, minmax(16rem, 1fr));
}

@media (min-width: 48rem) {
  .layout { 
    grid-template-columns: 16rem 1fr; 
  }
}`}</pre>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            💡 <strong>Teste prático:</strong> Redimensione a janela do seu browser para menos de <code>768px (48rem)</code> para ver o menu recolher automaticamente para 1 coluna móvel.
          </p>
        </div>
      </div>
    </div>
  );
}
