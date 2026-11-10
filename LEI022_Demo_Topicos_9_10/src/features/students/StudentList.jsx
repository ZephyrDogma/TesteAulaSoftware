import React from 'react';
import { StudentCard } from './StudentCard';

/**
 * Componente StudentList
 * Baseado no Slide 4 e Slide 17:
 * - Mapeia a lista de estudantes renderizando <StudentCard />
 * - Utiliza SEMPRE a chave única da API (key={s.id}) para manter integridade no reconciler do React
 */
export function StudentList({ students, onDelete }) {
  return (
    <div className="grid">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
