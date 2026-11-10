import React from 'react';

/**
 * Tabela e Resumo Interativo dos 7 Erros Comuns (Slide 17)
 */
export function CommonErrorsSummary() {
  const errorsTable = [
    {
      error: 'fetch sem verificar r.ok',
      consequence: 'Erros 4xx/5xx tratados silenciosamente como sucesso pelo fetch.',
      solution: 'Verificar if (!res.ok) throw await toApiError(res) (Slide 6 e 8)',
      category: 'HTTP & REST',
    },
    {
      error: 'Efeito sem limpeza (cleanup)',
      consequence: 'Respostas fora de ordem (race conditions) ao pesquisar rápido.',
      solution: 'Criar AbortController e chamar ctrl.abort() no return do useEffect.',
      category: 'React Lifecycle',
    },
    {
      error: 'Guardar o que se calcula',
      consequence: 'Duas fontes de estado que divergem e criam bugs na interface.',
      solution: 'Derivar diretamente na renderização: const visible = items.filter(...)',
      category: 'Estado',
    },
    {
      error: 'Mutar estado diretamente (push/splice)',
      consequence: 'O ecrã não re-renderiza porque a referência do array não mudou.',
      solution: 'Imutabilidade: setItems([...items, novo]) ou prev => prev.filter(...)',
      category: 'Estado',
    },
    {
      error: 'key={index} em listas mutáveis',
      consequence: 'Estado de inputs ou checkboxes associado à posição e não ao elemento.',
      solution: 'Utilizar sempre a chave primária da API: key={student.id}',
      category: 'Reconciliação',
    },
    {
      error: 'Confiar apenas na validação do cliente',
      consequence: 'Qualquer utilizador pode forjar pedidos via DevTools, curl ou scripts.',
      solution: 'O servidor deve ser a autoridade final com validação 422 e 409.',
      category: 'Segurança & Arquitetura',
    },
    {
      error: 'Só testar em ecrã desktop',
      consequence: 'Layout partido, quebras de linha defeituosas e scroll horizontal em telemóvel.',
      solution: 'Media queries (@media min-width: 48rem) e grelhas repeat(auto-fill, ...)',
      category: 'Responsividade',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        5. Consolidação: 7 Erros Comuns e Como Evitá-los (Slide 17)
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        Tabela de referência para os estudantes consultarem durante o desenvolvimento do projeto prático (TP3):
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Erro Típico</th>
              <th style={{ padding: '0.75rem 1rem' }}>Consequência Grave</th>
              <th style={{ padding: '0.75rem 1rem' }}>Prática Correta Recomendada</th>
            </tr>
          </thead>
          <tbody>
            {errorsTable.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : '#f8fafc',
                }}
              >
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                  ❌ {row.error}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#7f1d1d' }}>
                  {row.consequence}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#166534', fontWeight: 500 }}>
                  ✅ {row.solution}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
