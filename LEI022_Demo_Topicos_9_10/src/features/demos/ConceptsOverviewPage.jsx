import React from 'react';
import { CounterDemo } from './CounterDemo';
import { DerivedStateDemo } from './DerivedStateDemo';
import { KeyIndexPitfallDemo } from './KeyIndexPitfallDemo';
import { ResponsivenessAndA11yDemo } from './ResponsivenessAndA11yDemo';
import { CommonErrorsSummary } from './CommonErrorsSummary';

/**
 * Página do Laboratório de Conceitos
 * Agrupa todas as experiências interativas para suporte à lecionação em aula prática
 */
export function ConceptsOverviewPage() {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Laboratório Interativo de Conceitos</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Demonstrações ao vivo para explorar os princípios dos Slides 5, 10, 15 e 17 da UC LEI022.
        </p>
      </div>

      <CounterDemo />
      <DerivedStateDemo />
      <KeyIndexPitfallDemo />
      <ResponsivenessAndA11yDemo />
      <CommonErrorsSummary />
    </div>
  );
}
