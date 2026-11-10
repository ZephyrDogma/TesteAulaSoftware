/**
 * Cliente HTTP Centralizado
 * Baseado no Slide 8 do guião teórica da UC LEI022:
 * - Um só ponto trata URL base, cabeçalhos comuns e tratamento de erros
 * - Os componentes não conhecem detalhes de infraestrutura HTTP
 * - Trata status 204 No Content retornando null sem tentar ler JSON
 * - Lança ApiError estruturado quando !res.ok (Slide 6 e Slide 14)
 */

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Erro de API estruturado com suporte a erros de validação campo a campo (Slide 14)
 */
export class ApiError extends Error {
  constructor(status, title, message, errors = {}) {
    super(message || title || `Erro HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.errors = errors; // Ex: { email: "Já existe", name: "Campo obrigatório" }
  }
}

/**
 * Converte resposta HTTP com erro em objeto ApiError
 */
export async function toApiError(res) {
  let body = {};
  try {
    body = await res.json();
  } catch {
    body = { message: res.statusText };
  }

  return new ApiError(
    res.status,
    body.title || `Erro ${res.status}`,
    body.message || body.error || `O pedido falhou com o código ${res.status}`,
    body.errors || {}
  );
}

/**
 * Função utilitária central de pedidos HTTP
 * @param {string} path - Caminho relativo (ex: "/students" ou "/students/1")
 * @param {RequestInit} [opts] - Opções do fetch (method, body, signal, etc.)
 */
export async function request(path, opts = {}) {
  const url = `${API}${path}`;

  // Se o body for um objeto e não for string/FormData, converte em JSON
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  const config = {
    ...opts,
    headers,
  };

  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    config.body = JSON.stringify(opts.body);
  }

  // Slide 6: fetch só lança exceção em erro de rede (offline, DNS, timeout)
  const res = await fetch(url, config);

  // Slide 6 & 17: verificar sempre res.ok
  if (!res.ok) {
    throw await toApiError(res);
  }

  // Slide 8: Resposta 204 não tem corpo
  return res.status === 204 ? null : res.json();
}
