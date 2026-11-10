import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StudentList } from './StudentList';

describe('Tópico 9 · Testes de Componentes e Composição (Slide 4 & 16)', () => {
  const mockStudents = [
    { id: 1, name: 'Ana Silva', email: 'ana@escola.pt', course: 'Engenharia Informática', active: true },
    { id: 2, name: 'Bruno Santos', email: 'bruno@escola.pt', course: 'Ciência de Computadores', active: false },
  ];

  test('renderiza a lista de cartões com os nomes e emails dos alunos', () => {
    render(
      <MemoryRouter>
        <StudentList students={mockStudents} />
      </MemoryRouter>
    );

    // Slide 4: StudentCard renderiza h2 com o nome e p com o email
    expect(screen.getByRole('heading', { level: 2, name: 'Ana Silva' })).toBeInTheDocument();
    expect(screen.getByText('📧 ana@escola.pt')).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 2, name: 'Bruno Santos' })).toBeInTheDocument();
    expect(screen.getByText('📧 bruno@escola.pt')).toBeInTheDocument();
  });

  test('aciona o callback onDelete ao clicar no botão de eliminar', async () => {
    const onDeleteMock = vi.fn();

    render(
      <MemoryRouter>
        <StudentList students={mockStudents} onDelete={onDeleteMock} />
      </MemoryRouter>
    );

    const deleteButtons = screen.getAllByTitle('Eliminar estudante');
    await userEvent.click(deleteButtons[0]);

    expect(onDeleteMock).toHaveBeenCalledWith(1);
  });
});
