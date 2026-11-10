import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentApi } from './studentApi';
import { Spinner } from '../../components/Spinner';
import { ErrorBox } from '../../components/ErrorBox';
import { Button } from '../../components/Button';

/**
 * Vista de Detalhe de Estudante
 * Baseado no Slide 9 da UC LEI022:
 * - Leitura do parâmetro dinâmico da rota: const { id } = useParams()
 * - O URL é estado (pode ser partilhado por link direto ou adicionado a favoritos)
 * - Suporta navegação sem recarregar a página (<Link to="...">)
 */
export function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadDetails = () => {
    setStatus('loading');
    setError('');

    const ctrl = new AbortController();

    studentApi.getStudent(id, ctrl.signal)
      .then((data) => {
        setStudent(data);
        setStatus('success');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setStatus('error');
        setError(err.message || 'Estudante não encontrado.');
      });

    return () => ctrl.abort();
  };

  useEffect(() => {
    const cancel = loadDetails();
    return cancel;
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Tem a certeza que deseja eliminar ${student?.name}?`)) return;
    try {
      await studentApi.deleteStudent(id);
      navigate('/students');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  if (status === 'loading') {
    return <Spinner message={`A carregar detalhes do estudante #${id}...`} />;
  }

  if (status === 'error') {
    return (
      <div style={{ maxWidth: '600px' }}>
        <ErrorBox
          title={`Erro ao consultar estudante #${id}`}
          message={error}
          onRetry={loadDetails}
        />
        <Link to="/students" className="btn btn-outline">
          ← Voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '650px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/students" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}>
          ← Voltar à Lista de Estudantes
        </Link>
      </div>

      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identificador: #{student.id}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {student.name}
            </h1>
          </div>
          <span className={`badge ${student.active ? 'badge-active' : 'badge-inactive'}`}>
            {student.active ? 'Matrícula Ativa' : 'Matrícula Inativa'}
          </span>
        </div>

        <div style={{ display: 'grid', gap: '1rem', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1.25rem 0', margin: '1.25rem 0' }}>
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Email Institucional:</strong>
            <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>{student.email}</p>
          </div>
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Curso / Ciclo de Estudos:</strong>
            <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>{student.course}</p>
          </div>
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>URL do Recurso:</strong>
            <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              /students/{student.id} (URL como estado da vista)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="danger" onClick={handleDelete}>
            🗑️ Eliminar
          </Button>
          <Link to={`/students/${student.id}/edit`} className="btn btn-primary">
            ✏️ Editar Dados
          </Link>
        </div>
      </div>
    </div>
  );
}
