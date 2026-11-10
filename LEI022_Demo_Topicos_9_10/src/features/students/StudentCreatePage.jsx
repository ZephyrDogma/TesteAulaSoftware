import React from 'react';
import { Link } from 'react-router-dom';
import { StudentForm } from './StudentForm';

export function StudentCreatePage() {
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/students" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}>
          ← Voltar à Lista
        </Link>
      </div>

      <StudentForm />
    </div>
  );
}
