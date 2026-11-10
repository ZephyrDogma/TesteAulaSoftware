import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import { CounterDemo } from './CounterDemo';

describe('Tópico 9 · Testes de Estado e Eventos (Slide 5)', () => {
  test('incrementa o contador através do clique no botão', async () => {
    render(<CounterDemo />);

    const counterBtn = screen.getByRole('button', { name: /Cliques:/i });
    expect(counterBtn).toHaveTextContent('Cliques: 0');

    await userEvent.click(counterBtn);
    expect(counterBtn).toHaveTextContent('Cliques: 1');

    await userEvent.click(counterBtn);
    expect(counterBtn).toHaveTextContent('Cliques: 2');
  });

  test('reinicia o contador ao clicar em Reiniciar', async () => {
    render(<CounterDemo />);

    const counterBtn = screen.getByRole('button', { name: /Cliques:/i });
    const resetBtn = screen.getByRole('button', { name: /Reiniciar Contador/i });

    await userEvent.click(counterBtn);
    await userEvent.click(counterBtn);
    expect(counterBtn).toHaveTextContent('Cliques: 2');

    await userEvent.click(resetBtn);
    expect(counterBtn).toHaveTextContent('Cliques: 0');
  });
});
