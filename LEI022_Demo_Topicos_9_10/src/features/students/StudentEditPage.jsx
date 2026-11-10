import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentApi } from './studentApi';
import { StudentForm } from './StudentForm';
import { Spinner } from '../../components/Spinner';
import { ErrorBox } from '../../components/ErrorBox';

export function StudentEditPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    studentApi.getStudent(id)
      .then((data) => {
        setStudent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erro ao carregar dados do estudante.');
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <Spinner message={`A carregar dados do estudante #${id}...`} />;
  if (error) return <ErrorBox title="Erro" message={error} onRetry={load} />;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/students/${id}`} style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}>
          ← Voltar aos Detalhes
        </Link>
      </div>

      <StudentForm initialData={student} isEdit={true} />
    </div>
  );
}
