import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentApi } from './studentApi';
import { StudentCard } from './StudentCard';
import { Spinner } from '../../components/Spinner';
import { ErrorBox } from '../../components/ErrorBox';
import { Empty } from '../../components/Empty';
import { Button } from '../../components/Button';

/**
 * Demonstração Prática do TanStack Query (Estado Remoto)
 * Baseado rigorosamente no Slide 12 da UC LEI022:
 * - useQuery com queryKey estruturada: ["students", { search, active }]
 * - isPending -> A carregar | error -> Erro | data vazio -> Vazio | data -> Com dados
 * - useMutation com invalidação automática: qc.invalidateQueries({ queryKey: ["students"] })
 * - Cache com prazo de validade (a API mantém-se como autoridade da verdade)
 */
export function StudentsQueryPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Slide 12: useQuery com queryKey dependente dos filtros
  const {
    data: students,
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['students', { search, activeFilter }],
    queryFn: ({ signal }) => {
      return studentApi.listStudents(
        {
          name: search || undefined,
          active: activeFilter === 'all' ? undefined : activeFilter,
        },
        signal
      );
    },
    staleTime: 1000 * 30, // 30 segundos de cache fresca
  });

  // Slide 12: useMutation com invalidação de cache após mutação
  const deleteMutation = useMutation({
    mutationFn: (id) => studentApi.deleteStudent(id),
    onSuccess: () => {
      // Notifica o TanStack Query para revalidar a lista automaticamente
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Eliminar estudante via TanStack Query Mutation?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            TanStack Query — Gestão de Estado Remoto
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Slide 12: Cache declarativa por chave, cancelamento automático, deduplicação e mutações
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isFetching && !isPending && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              🔄 A revalidar cache em background...
            </span>
          )}
          <Button variant="outline" onClick={() => refetch()}>
            Refetch Manual
          </Button>
          <Link to="/students/new" className="btn btn-primary">
            ➕ Novo Estudante
          </Link>
        </div>
      </div>

      <div className="callout" style={{ borderLeftColor: '#0ea5e9' }}>
        <strong>Vantagens pedagógicas observáveis no TanStack Query:</strong>
        <ul style={{ marginLeft: '1.25rem', marginTop: '0.35rem', fontSize: '0.85rem' }}>
          <li>Navegue para outra rota e volte aqui: os dados aparecem instantaneamente (cache hit!).</li>
          <li>A alteração nos filtros aciona automaticamente um novo pedido cancelando o anterior.</li>
          <li>Ao eliminar ou criar um estudante, <code>qc.invalidateQueries</code> atualiza a lista sem código manual.</li>
        </ul>
      </div>

      {/* Filtros */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ flex: '1 1 240px' }}>
          <label htmlFor="tq-search" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            Pesquisa (reativa com queryKey):
          </label>
          <input
            id="tq-search"
            type="search"
            placeholder="Pesquisar estudantes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ flex: '0 1 200px' }}>
          <label htmlFor="tq-filter" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            Estado:
          </label>
          <select
            id="tq-filter"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="select"
            style={{ width: '100%' }}
          >
            <option value="all">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
      </div>

      {/* Slide 12: Mapeamento de Estados */}
      {isPending && <Spinner message="useQuery: A obter dados remotos..." />}

      {error && (
        <ErrorBox
          title="useQuery falhou"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {!isPending && !error && students?.length === 0 && (
        <Empty text="Nenhum estudante encontrado na cache/API" />
      )}

      {!isPending && !error && students?.length > 0 && (
        <div className="grid">
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
