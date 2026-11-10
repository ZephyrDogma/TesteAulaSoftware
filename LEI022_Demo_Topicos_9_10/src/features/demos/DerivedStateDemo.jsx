import React, { useState } from 'react';
import { Button } from '../../components/Button';

/**
 * Demonstração do Slide 10: Estado Derivado vs Estado Duplicado
 * 
 * Regra: "Se pode ser calculado, não se guarda."
 * Mostra como duplicar estado em useState gera bugs de dessincronização.
 */
export function DerivedStateDemo() {
  const [items, setItems] = useState([
    { id: 1, name: 'Engenharia de Software', completed: true },
    { id: 2, name: 'Bases de Dados', completed: false },
    { id: 3, name: 'Sistemas Operativos', completed: true },
  ]);

  // Anti-padrão (Slide 10): Guardar uma cópia filtrada em useState
  const [staleFilteredCopy, setStaleFilteredCopy] = useState(
    items.filter((item) => item.completed)
  );

  // Prática Correta (Slide 10): Estado derivado a cada renderização
  const derivedFiltered = items.filter((item) => item.completed);

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    // Reparar: O programador esqueceu-se de sincronizar 'staleFilteredCopy', ou sincronizou incorretamente!
  };

  const addItem = () => {
    const nextId = items.length + 1;
    setItems((prev) => [
      ...prev,
      { id: nextId, name: `Nova UC #${nextId}`, completed: true },
    ]);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        2. Estado Derivado vs Estado Duplicado (Slide 10 & 17)
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        O que acontece quando guardamos uma cópia filtrada em vez de calculá-la diretamente na renderização?
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Button onClick={addItem}>➕ Adicionar Nova UC Concluída</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Lista Original com Controlo */}
        <div style={{ border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Lista Fonte da Verdade (items):
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map((item) => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span>{item.name}</span>
                <button
                  onClick={() => toggleItem(item.id)}
                  className="btn btn-outline"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  {item.completed ? '✅ Concluída' : '⏳ Pendente'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Anti-padrão: Cópia em useState que dessincronizou */}
        <div style={{ border: '1px solid #fca5a5', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
            ❌ NÃO: Cópia em useState
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#7f1d1d', marginBottom: '0.5rem' }}>
            Fica desatualizada e diverge da fonte de verdade (Slide 10)!
          </p>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#7f1d1d' }}>
            {staleFilteredCopy.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>

        {/* Prática Correta: Derivado a cada renderização */}
        <div style={{ border: '1px solid #86efac', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>
            ✅ SIM: Derivado na renderização
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#14532d', marginBottom: '0.5rem' }}>
            <code>items.filter(i =&gt; i.completed)</code> sempre 100% atual!
          </p>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#14532d' }}>
            {derivedFiltered.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
