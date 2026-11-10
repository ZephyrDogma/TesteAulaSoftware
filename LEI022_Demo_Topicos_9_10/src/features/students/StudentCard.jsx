import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';

/**
 * Componente StudentCard
 * Baseado no Slide 4 da UC LEI022:
 * "Uma responsabilidade por componente. Não é preciso um componente por cada etiqueta HTML."
 */
export function StudentCard({ student, onDelete }) {
  return (
    <article className="student-card">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h2>{student.name}</h2>
          <span className={`badge ${student.active ? 'badge-active' : 'badge-inactive'}`}>
            {student.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <p style={{ marginBottom: '0.25rem' }}>
          📧 {student.email}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          📚 {student.course || 'Sem curso atribuído'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
        {/* Slide 9: Link para /students/:id sem recarregar a página */}
        <Link to={`/students/${student.id}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
          Detalhe
        </Link>
        <Link to={`/students/${student.id}/edit`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
          Editar
        </Link>
        {onDelete && (
          <Button
            variant="danger"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', marginLeft: 'auto' }}
            onClick={() => onDelete(student.id)}
            title="Eliminar estudante"
          >
            🗑️
          </Button>
        )}
      </div>
    </article>
  );
}
