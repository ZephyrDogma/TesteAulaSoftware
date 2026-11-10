import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { server } from '../../test/server';
import { StudentForm } from './StudentForm';

describe('Tópico 10 · Testes de Formulários e Validação (Slide 16)', () => {
  test('mostra erro do servidor no campo (Slide 16)', async () => {
    // Intercetação com MSW simulando resposta HTTP 409 Conflito (Slide 14 & 16)
    server.use(
      http.post('*/students', () => {
        return HttpResponse.json(
          {
            status: 409,
            title: 'Conflito',
            errors: { email: 'Já existe' },
          },
          { status: 409 }
        );
      })
    );

    render(
      <MemoryRouter>
        <StudentForm />
      </MemoryRouter>
    );

    // Slide 16: Procurar por rótulo e papel (o que o utilizador vê), não por classes CSS
    await userEvent.type(screen.getByLabelText(/Nome Completo/i), 'Ana Silva');
    await userEvent.type(screen.getByLabelText(/Endereço de Email/i), 'a@b.pt');
    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    // Verificação de acessibilidade e visibilidade do erro do servidor
    expect(await screen.findByText('Já existe')).toBeVisible();
  });

  test('valida campos obrigatórios no cliente antes de contactar a API', async () => {
    render(
      <MemoryRouter>
        <StudentForm />
      </MemoryRouter>
    );

    // Clica em Guardar com o formulário em branco
    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    expect(await screen.findByText(/O nome do estudante é obrigatório/i)).toBeVisible();
    expect(await screen.findByText(/O endereço de email é obrigatório/i)).toBeVisible();
  });

  test('chama onSaved quando a submissão no servidor tem sucesso', async () => {
    const onSavedMock = vi.fn();

    server.use(
      http.post('*/students', () => {
        return HttpResponse.json(
          { id: 99, name: 'Carlos Sousa', email: 'carlos@escola.pt', active: true },
          { status: 201 }
        );
      })
    );

    render(
      <MemoryRouter>
        <StudentForm onSaved={onSavedMock} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/Nome Completo/i), 'Carlos Sousa');
    await userEvent.type(screen.getByLabelText(/Endereço de Email/i), 'carlos@escola.pt');
    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await vi.waitFor(() => {
      expect(onSavedMock).toHaveBeenCalledTimes(1);
    });
  });
});
