import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from './studentApi';
import { StudentList } from './StudentList';
import { StudentFilters } from './StudentFilters';
import { Spinner } from '../../components/Spinner';
import { ErrorBox } from '../../components/ErrorBox';
import { Empty } from '../../components/Empty';
import { Button } from '../../components/Button';

/**
 * Página Principal de Estudantes (StudentsPage)
 * Demonstra:
 * - Slide 4: Composição de página (StudentsPage -> StudentFilters, StudentList, StudentCard)
 * - Slide 5: Props, eventos e imutabilidade de estado
 * - Slide 6: Consumo de API via useEffect com AbortController e limpeza
 * - Slide 7: Os 4 estados de uma vista (loading, error com retry, empty, com dados)
 * - Slide 10: Estado derivado vs estado duplicado
 */
export function StudentsPage() {
  // Estado de dados remotos
  const [students, setStudents] = useState([]);
  
  // Slide 7: Uma só variável 'status' evita estados contraditórios (ex: loading e erro ao mesmo tempo)
  // Valores possíveis: 'idle' | 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Filtros locais (Slide 10: Estado local com useState)
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Parâmetros pedagógicos de teste (simular latência ou falha para ver Spinner e ErrorBox)
  const [simulatedDelay, setSimulatedDelay] = useState(400);
  const [simulateError, setSimulateError] = useState(false);

  /**
   * Função de carregamento com AbortController
   * Baseada diretamente no Slide 6
   */
  const loadStudents = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');

    const ctrl = new AbortController();

    studentApi.listStudents(
      {
        delay: simulatedDelay,
        fail: simulateError ? 1 : 0,
      },
      ctrl.signal
    )
      .then((data) => {
        setStudents(data);
        setStatus('success');
      })
      .catch((err) => {
        // Slide 6: Não tratar abort como erro visível na interface
        if (err.name === 'AbortError') {
          console.log('[AbortController] Pedido cancelado por desmonte ou novo pedido.');
          return;
        }
        setStatus('error');
        setErrorMessage(err.message || 'Falha na comunicação com o backend.');
      });

    // Função de limpeza (Slide 6 e Slide 17: evita respostas fora de ordem)
    return () => ctrl.abort();
  }, [simulatedDelay, simulateError]);

  // Slide 6: Efeito corre ao montar ou quando a configuração de simulação altera
  useEffect(() => {
    const cancel = loadStudents();
    return cancel;
  }, [loadStudents]);

  /**
   * Slide 5: Remoção com imutabilidade
   * setItems(items.filter(...)) -> SIM
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este estudante?')) return;

    try {
      await studentApi.deleteStudent(id);
      // Slide 5 & 17: Criação de novo array (imutabilidade) sem mutar o anterior
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(`Erro ao eliminar: ${err.message}`);
    }
  };

  /**
   * Repor dados iniciais
   */
  const handleReset = async () => {
    try {
      await studentApi.resetData();
      setSimulateError(false);
      loadStudents();
    } catch (err) {
      alert(`Erro ao repor dados: ${err.message}`);
    }
  };

  /**
   * Slide 10: ESTADO DERIVADO
   * NÃO: duplicar estudantes filtrados em novo useState
   * SIM: derivar o valor a cada renderização a partir do estado original
   */
  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesActive =
        activeFilter === 'all'
          ? true
          : activeFilter === 'true'
          ? s.active === true
          : s.active === false;
      return matchesName && matchesActive;
    });
  }, [students, search, activeFilter]);

  return (
    <div>
      {/* Cabeçalho da Vista */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Gestão de Estudantes</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Demonstração integrada dos Tópicos 9 e 10 (Consumo REST via useEffect, Ciclo de Estados e Derivação)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={handleReset} title="Repor a lista original na API">
            🔄 Repor Seed
          </Button>
          <Link to="/students/new" className="btn btn-primary">
            ➕ Novo Estudante
          </Link>
        </div>
      </div>

      {/* Caixa de Controlos Pedagógicos (Permite demonstrar os 4 estados ao vivo) */}
      <div className="callout" style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', borderLeftColor: '#6366f1' }}>
        <strong>Controlo Didático da Demonstração (Slides 6 e 7):</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem' }}>
            Latência simulada:
            <select
              value={simulatedDelay}
              onChange={(e) => setSimulatedDelay(Number(e.target.value))}
              className="select"
              style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem' }}
            >
              <option value={0}>0ms (Instantâneo)</option>
              <option value={800}>800ms (Observar Spinner)</option>
              <option value={2000}>2000ms (Atraso longo)</option>
            </select>
          </label>

          <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
            />
            Simular falha HTTP 500 (ver ErrorBox)
          </label>

          <Button variant="outline" onClick={loadStudents} style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>
            Recarregar agora
          </Button>
        </div>
      </div>

      {/* Slide 4 e Slide 10: Componente de Filtros */}
      <StudentFilters
        search={search}
        onSearchChange={setSearch}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
      />

      {/* Slide 7: Os Quatro Estados de Uma Vista */}
      {status === 'loading' && (
        <Spinner message="A sincronizar estudantes com a API..." />
      )}

      {status === 'error' && (
        <ErrorBox
          title="Erro ao carregar a lista de estudantes"
          message={errorMessage}
          onRetry={loadStudents}
        />
      )}

      {status === 'success' && visibleStudents.length === 0 && (
        <Empty
          text={search ? `Nenhum estudante encontrado para "${search}"` : 'Sem alunos registados'}
          action={
            <Link to="/students/new" className="btn btn-primary">
              Criar o primeiro estudante
            </Link>
          }
        />
      )}

      {status === 'success' && visibleStudents.length > 0 && (
        <StudentList
          students={visibleStudents}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
