import React, { useState } from 'react';
import { Button } from '../../components/Button';

/**
 * Demonstração do Slide 5: Props, Estado, Eventos e Imutabilidade
 *
 * Conceitos:
 * 1. useState(0) com atualizador funcional: setCount(c => c + 1)
 * 2. Imutabilidade:
 *    setItems([...items, novo]); // SIM
 *    items.push(novo); setItems(items); // NÃO (não dispara re-renderização por mutação direta de referência)
 */
export function CounterDemo() {
  const [count, setCount] = useState(0);

  // Lista para demonstrar imutabilidade
  const [logs, setLogs] = useState(['Estado inicial criado']);

  // Exemplo INCORRETO (Mutação Direta - Slide 5 & 17)
  const addLogMutating = () => {
    // ERRO: Modifica o array original no mesmo endereço de memória.
    // O React compara prevLogs === nextLogs (por referência) e NÃO atualiza o ecrã!
    logs.push(`Item mutado diretamente às ${new Date().toLocaleTimeString()} (Não atualiza o DOM!)`);
    setLogs(logs); 
  };

  // Exemplo CORRETO (Imutabilidade - Slide 5 & 17)
  const addLogImmutable = () => {
    // CORRETO: Cria um novo array copiando os elementos anteriores
    setLogs((prev) => [...prev, `Item adicionado às ${new Date().toLocaleTimeString()}`]);
  };

  const resetLogs = () => setLogs(['Lista reiniciada']);

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        1. Contador, Eventos e Imutabilidade (Slide 5)
      </h3>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Button onClick={() => setCount((c) => c + 1)}>
          Cliques: <strong>{count}</strong>
        </Button>
        <Button variant="outline" onClick={() => setCount(0)}>
          Reiniciar Contador
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          A apresentação deriva do estado: não se manipula o DOM à mão!
        </span>
      </div>

      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Experiência de Imutabilidade (Array em Estado):
      </h4>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={addLogMutating}
          className="btn btn-outline"
          style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
          title="Executa: logs.push(item); setLogs(logs);"
        >
          ❌ Testar Mutação Proibida: push()
        </button>
        <button
          onClick={addLogImmutable}
          className="btn btn-outline"
          style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
          title="Executa: setLogs([...logs, novo]);"
        >
          ✅ Testar Prática Correta: [...items, novo]
        </button>
        <Button variant="outline" onClick={resetLogs} style={{ fontSize: '0.8rem' }}>
          Limpar
        </Button>
      </div>

      <div style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', maxHeight: '180px', overflowY: 'auto', fontSize: '0.8rem', fontFamily: 'monospace' }}>
        {logs.map((log, index) => (
          <div key={index}>&gt; {log}</div>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
        Nota: Se clicar no botão vermelho (push), repare que a lista NÃO re-renderiza até que outro estado mude o componente!
      </p>
    </div>
  );
}
