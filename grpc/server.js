/**
 * LEI022 — Aula 4: Servidor gRPC de Referência Docente
 * Baseado no Guia Oficial: Laboratorio_GraphQL_gRPC_Postman.docx
 *
 * Utiliza carregamento dinâmico do contrato (.proto) com @grpc/proto-loader,
 * dispensando a compilação prévia de stubs em tempo de desenvolvimento.
 */

const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('node:path');

// 1. Carregamento dinâmico do contrato Protobuf
const PROTO_PATH = path.join(__dirname, 'protos', 'academico.proto');
const packageDefinition = loader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const academicoProto = grpc.loadPackageDefinition(packageDefinition).academico;

// ============================================================================
// IMPLEMENTAÇÃO DOS MÉTODOS DO SERVIÇO AvaliacaoService
// ============================================================================

/**
 * 1. UNARY RPC: SubmeterNota
 * Recebe 1 pedido com dados de avaliação e responde com 1 mensagem de confirmação.
 * Tratamento: Validação de nota entre 0 e 20 com sucesso de negócio no payload.
 */
function SubmeterNota(call, callback) {
  const req = call.request;
  console.log('[SubmeterNota] Pedido recebido:', req);

  // Validação de dados de negócio
  if (!req.aluno_id || !req.disciplina_code || req.nota < 0 || req.nota > 20) {
    return callback(null, {
      sucesso: false,
      mensagem: 'Dados inválidos; nota deve estar entre 0 e 20 e campos obrigatórios preenchidos.'
    });
  }

  callback(null, {
    sucesso: true,
    mensagem: `Nota ${req.nota} registada com sucesso para o aluno ${req.aluno_id}.`
  });
}

/**
 * 2. UNARY RPC: ObterPerfil
 * Recebe NIF e procura docente em memória.
 * Tratamento: Se não existir, emite código de erro de protocolo gRPC NOT_FOUND.
 */
function ObterPerfil(call, callback) {
  const perfis = {
    '12345678': { nome: 'Ana Martins', departamento: 'Informática' },
    '87654321': { nome: 'Rui Lopes', departamento: 'Matemática' }
  };

  const nif = call.request.nif;
  console.log('[ObterPerfil] Pesquisa para NIF:', nif);

  const perfil = perfis[nif];
  if (!perfil) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: 'Professor não encontrado.'
    });
  }

  callback(null, perfil);
}

/**
 * 3. SERVER STREAMING: MonitorizarLocalizacao
 * Recebe o ID de um autocarro e emite coordenadas geográficas periodicamente (1s)
 * simulando uma transmissão GPS em tempo real até call.end().
 */
function MonitorizarLocalizacao(call) {
  console.log('[MonitorizarLocalizacao] Início de rastreio para autocarro:', call.request.autocarro_id);

  const pontos = [
    { latitude: 39.236, longitude: -8.686 },
    { latitude: 39.238, longitude: -8.683 },
    { latitude: 39.241, longitude: -8.680 }
  ];

  let i = 0;
  const timer = setInterval(() => {
    if (i >= pontos.length) {
      clearInterval(timer);
      console.log('[MonitorizarLocalizacao] Transmissão GPS concluída.');
      call.end(); // Notifica o cliente de que o fluxo terminou
      return;
    }

    const coordenada = {
      ...pontos[i++],
      timestamp: Date.now()
    };

    console.log('[MonitorizarLocalizacao] A enviar coordenada:', coordenada);
    call.write(coordenada);
  }, 1000);

  // Cancela o timer se o cliente abortar a ligação
  call.on('cancelled', () => {
    console.log('[MonitorizarLocalizacao] Ligação cancelada pelo cliente.');
    clearInterval(timer);
  });
}

/**
 * 4. CLIENT STREAMING: EnviarLogs
 * Recebe múltiplas entradas de LogEntry enviadas pelo cliente.
 * Quando o cliente fecha o fluxo ('end'), o servidor responde com um resumo (LogSummary).
 */
function EnviarLogs(call, callback) {
  console.log('[EnviarLogs] Abertura de fluxo de logs pelo cliente.');
  let totalRecebidos = 0;

  call.on('data', (logEntry) => {
    totalRecebidos++;
    console.log(`[EnviarLogs] [#${totalRecebidos}] [${logEntry.origem}] ${logEntry.mensagem} (ts: ${logEntry.timestamp})`);
  });

  call.on('end', () => {
    console.log(`[EnviarLogs] Fluxo fechado pelo cliente. Total processado: ${totalRecebidos}`);
    callback(null, {
      recebidos: totalRecebidos,
      mensagem: `Recebidas com sucesso ${totalRecebidos} entradas de log.`
    });
  });

  call.on('error', (err) => {
    console.error('[EnviarLogs] Erro no stream do cliente:', err);
  });
}

/**
 * 5. BIDIRECTIONAL STREAMING: CanalChat
 * Ambos os lados enviam e recebem mensagens de forma contínua e assíncrona.
 * O servidor devolve uma resposta (eco) para cada mensagem recebida.
 */
function CanalChat(call) {
  console.log('[CanalChat] Canal de chat bidirecional estabelecido.');

  call.on('data', (msg) => {
    console.log(`[CanalChat] Recebido de [${msg.utilizador}]: ${msg.texto}`);

    // Resposta imediata de eco enviada pelo servidor através do canal aberto
    call.write({
      utilizador: 'servidor',
      texto: `Recebido: ${msg.texto}`
    });
  });

  call.on('end', () => {
    console.log('[CanalChat] Cliente encerrou o canal de chat.');
    call.end();
  });

  call.on('error', (err) => {
    console.error('[CanalChat] Erro no canal de chat:', err);
  });
}

// ============================================================================
// ARRANQUE DO SERVIDOR gRPC
// ============================================================================
const server = new grpc.Server();

server.addService(academicoProto.AvaliacaoService.service, {
  SubmeterNota,
  ObterPerfil,
  MonitorizarLocalizacao,
  EnviarLogs,
  CanalChat
});

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Falha ao iniciar servidor gRPC:', err);
    return;
  }
  console.log('====================================================');
  console.log(`🚀 Servidor gRPC LEI022 a escutar em 0.0.0.0:${port}`);
  console.log(`📡 Porta: ${port} (Inseguro - apenas para ambiente local)`);
  console.log('📄 Contrato ativo: protos/academico.proto');
  console.log('====================================================');
});
