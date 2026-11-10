/**
 * Módulo de API para a funcionalidade de Estudantes
 * Baseado no Slide 8 da UC LEI022: Organizar por funcionalidade (features/students)
 */

import { request } from '../../lib/http';

/**
 * Converte um objeto de parâmetros numa query string
 */
function toQueryString(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const studentApi = {
  /**
   * Lista estudantes com suporte a filtros e cancelamento (AbortSignal)
   */
  listStudents: (filters = {}, signal) => {
    return request(`/students${toQueryString(filters)}`, { signal });
  },

  /**
   * Obtém os detalhes de um estudante
   */
  getStudent: (id, signal) => {
    return request(`/students/${id}`, { signal });
  },

  /**
   * Cria um novo estudante (Slide 13: POST /students)
   */
  createStudent: (studentData) => {
    return request('/students', {
      method: 'POST',
      body: studentData,
    });
  },

  /**
   * Atualiza um estudante existente (PUT /students/:id)
   */
  updateStudent: (id, studentData) => {
    return request(`/students/${id}`, {
      method: 'PUT',
      body: studentData,
    });
  },

  /**
   * Elimina um estudante (Slide 8: DELETE /students/:id -> 204 No Content)
   */
  deleteStudent: (id) => {
    return request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Repõe os dados didáticos iniciais
   */
  resetData: () => {
    return request('/reset', {
      method: 'POST',
    });
  },
};
