import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from './studentApi';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';

/**
 * Formulário Controlado Completo
 * Baseado rigorosamente nos Slides 13, 14 e 15 da UC LEI022:
 * - Slide 13: Separação de estados (form, errors, saving) e bloqueio de cliques duplos (saving)
 * - Slide 14: Validação no cliente (rápida) combinada com validação autoritativa do servidor (422 / 409)
 * - Slide 15: Acessibilidade rigorosa (role="alert", aria-invalid, labels associados)
 * - Slide 17: Preservação dos valores introduzidos em caso de erro
 */
export function StudentForm({ initialData = null, isEdit = false, onSaved }) {
  const navigate = useNavigate();

  // Slide 13: Estado dos campos do formulário
  const [form, setForm] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    course: initialData?.course || 'Engenharia Informática',
    active: initialData?.active ?? true,
  });

  // Slide 13: Estado de erros por campo devolvidos pelo backend ou cliente
  const [errors, setErrors] = useState({});

  // Slide 13: Estado de submissão em curso (bloqueia submissões repetidas)
  const [saving, setSaving] = useState(false);

  // Erro geral do formulário (ex: falha de rede ou 500)
  const [generalError, setGeneralError] = useState('');

  /**
   * Atualização controlada dos campos do formulário
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Ao digitar, limpa o erro desse campo para melhorar a UX imediata (Slide 14)
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * Slide 14: Validação rápida no cliente para feedback imediato ao utilizador
   */
  const validateClientSide = () => {
    const clientErrors = {};
    if (!form.name.trim()) {
      clientErrors.name = 'O nome do estudante é obrigatório.';
    } else if (form.name.trim().length < 2) {
      clientErrors.name = 'O nome deve conter pelo menos 2 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      clientErrors.email = 'O endereço de email é obrigatório.';
    } else if (!emailRegex.test(form.email.trim())) {
      clientErrors.email = 'Introduza um formato de email válido (ex: utilizador@dominio.pt).';
    }

    return clientErrors;
  };

  /**
   * Slide 13: Função de submissão completa
   */
  async function submit(e) {
    e.preventDefault();
    setGeneralError('');

    // 1. Validação local preventiva
    const localErrors = validateClientSide();
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    // 2. Submissão para o servidor (autoridade final)
    setSaving(true);
    try {
      if (isEdit && initialData?.id) {
        await studentApi.updateStudent(initialData.id, form);
      } else {
        await studentApi.createStudent(form);
      }

      // Slide 13: "Só a resposta da API confirma a gravação"
      if (onSaved) {
        onSaved();
      } else {
        navigate('/students');
      }
    } catch (err) {
      // Slide 13 & 14: Em caso de erro, os valores introduzidos mantêm-se no formulário!
      // Os erros campo a campo (422) ou conflito (409) são injetados diretamente no estado de erros
      if (err.errors && Object.keys(err.errors).length > 0) {
        setErrors(err.errors);
      } else {
        setGeneralError(err.message || 'Ocorreu um erro inesperado ao gravar o estudante.');
      }
    } finally {
      // Garante desbloqueio do botão quer haja sucesso quer haja erro
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: '600px', backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: 700 }}>
        {isEdit ? 'Editar Estudante' : 'Registar Novo Estudante'}
      </h2>

      {generalError && (
        <div role="alert" className="error-box" style={{ marginBottom: '1.25rem' }}>
          <strong>⚠️ Erro:</strong> {generalError}
        </div>
      )}

      {/* Slide 15: Rótulo associado via htmlFor e id acessível */}
      <FormField
        id="name"
        label="Nome Completo"
        placeholder="Ex: Ana Sofia Silva"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        required
        disabled={saving}
      />

      <FormField
        id="email"
        type="email"
        label="Endereço de Email"
        placeholder="Ex: ana.silva@escola.pt"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        required
        disabled={saving}
      />

      <div className="form-group">
        <label htmlFor="course">Curso / Licenciatura</label>
        <select
          id="course"
          name="course"
          value={form.course}
          onChange={handleChange}
          disabled={saving}
          className="select"
        >
          <option value="Engenharia Informática">Engenharia Informática</option>
          <option value="Ciência de Computadores">Ciência de Computadores</option>
          <option value="Sistemas de Informação">Sistemas de Informação</option>
          <option value="Multimédia e Tecnologias Web">Multimédia e Tecnologias Web</option>
        </select>
      </div>

      <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
        <input
          id="active"
          name="active"
          type="checkbox"
          checked={form.active}
          onChange={handleChange}
          disabled={saving}
          style={{ width: '1.1rem', height: '1.1rem' }}
        />
        <label htmlFor="active" style={{ cursor: 'pointer', marginBottom: 0 }}>
          Matrícula ativa no ano letivo corrente
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
        <Button
          variant="outline"
          onClick={() => navigate('/students')}
          disabled={saving}
        >
          Cancelar
        </Button>

        {/* Slide 13: saving bloqueia submissões repetidas */}
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
        >
          {saving ? 'A gravar no servidor...' : isEdit ? 'Atualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
