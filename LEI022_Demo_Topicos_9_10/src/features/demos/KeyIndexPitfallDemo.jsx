import React, { useState } from 'react';
import { Button } from '../../components/Button';

/**
 * Demonstração do Slide 17: O Perigo de Usar key={index} em Listas
 * 
 * Consequência: Ao eliminar ou reordenar itens, o React associa o estado interno
 * dos elementos DOM à posição do array e não à entidade real.
 */
export function KeyIndexPitfallDemo() {
  const [itemsWithIndexKey, setItemsWithIndexKey] = useState([
    { id: 'a1', label: 'Estudante 1' },
    { id: 'b2', label: 'Estudante 2' },
    { id: 'c3', label: 'Estudante 3' },
  ]);

  const [itemsWithIdKey, setItemsWithIdKey] = useState([
    { id: 'a1', label: 'Estudante 1' },
    { id: 'b2', label: 'Estudante 2' },
    { id: 'c3', label: 'Estudante 3' },
  ]);

  const removeFirstWithIndexKey = () => {
    setItemsWithIndexKey((prev) => prev.slice(1));
  };

  const removeFirstWithIdKey = () => {
    setItemsWithIdKey((prev) => prev.slice(1));
  };

  const resetBoth = () => {
    const fresh = [
      { id: 'a1', label: 'Estudante 1' },
      { id: 'b2', label: 'Estudante 2' },
      { id: 'c3', label: 'Estudante 3' },
    ];
    setItemsWithIndexKey(fresh);
    setItemsWithIdKey(fresh);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        3. O Bug de <code>key={`{index}`}</code> vs <code>key={`{id}`}</code> (Slide 17)
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        <strong>Instrução da experiência:</strong> Escreva uma nota diferente no campo de texto de cada estudante (ex: "Nota A", "Nota B", "Nota C"). Depois, clique em "Eliminar 1º Estudante" em cada lado e veja o que acontece ao texto escrito!
      </p>

      <div style={{ marginBottom: '1.25rem' }}>
        <Button variant="outline" onClick={resetBoth} style={{ fontSize: '0.85rem' }}>
          🔄 Reiniciar Ambas as Listas
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Lado Incorreto: key={index} */}
        <div style={{ border: '2px solid #f87171', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fff5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <strong style={{ color: '#991b1b', fontSize: '0.9rem' }}>
              ❌ Bug: key={`{index}`}
            </strong>
            <button
              onClick={removeFirstWithIndexKey}
              className="btn btn-danger"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              disabled={itemsWithIndexKey.length <= 1}
            >
              Eliminar 1º Estudante
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {itemsWithIndexKey.map((item, index) => (
              // BUG DO SLIDE 17: Usar index como chave
              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', width: '100px', fontWeight: 600 }}>{item.label}:</span>
                <input
                  type="text"
                  placeholder="Escreva uma nota aqui..."
                  className="input"
                  style={{ fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                  defaultValue=""
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.75rem' }}>
            ⚠️ Repare: Ao eliminar o Estudante 1, a caixa de texto do Estudante 1 permaneceu no Estudante 2! O estado foi trocado entre itens.
          </p>
        </div>

        {/* Lado Correto: key={item.id} */}
        <div style={{ border: '2px solid #4ade80', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <strong style={{ color: '#166534', fontSize: '0.9rem' }}>
              ✅ Prática Correta: key={`{item.id}`}
            </strong>
            <button
              onClick={removeFirstWithIdKey}
              className="btn btn-primary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              disabled={itemsWithIdKey.length <= 1}
            >
              Eliminar 1º Estudante
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {itemsWithIdKey.map((item) => (
              // PRÁTICA CORRETA: ID único da base de dados / API
              <div key={item.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', width: '100px', fontWeight: 600 }}>{item.label}:</span>
                <input
                  type="text"
                  placeholder="Escreva uma nota aqui..."
                  className="input"
                  style={{ fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                  defaultValue=""
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.75rem' }}>
            🎯 Perfeito: O React reconcilia com base no identificador permanente da entidade. O elemento correto e o seu input são eliminados em conjunto.
          </p>
        </div>
      </div>
    </div>
  );
}
