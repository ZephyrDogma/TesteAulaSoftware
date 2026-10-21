# Aula 5 — APIs Assíncronas, WebSockets e AsyncAPI
**LEI022 — Laboratório de Desenvolvimento de Software**  
**Localização:** `LabSoftware/assinc`

---

## 📌 1. Visão Geral do Projeto

Este repositório contém a resolução e implementação didática completa da **Aula 5**, cobrindo a modelação de eventos assíncronos, os quatro mecanismos de comunicação assíncrona exigidos no enunciado e a respetiva documentação formal com **AsyncAPI 3.0.0**:

1. **Parte B — Polling HTTP:** Cliente consulta periodicamente o endpoint de estado da encomenda e contabiliza o overhead de pedidos desnecessários e a latência de deteção.
2. **Parte C — Server-Sent Events (SSE):** Conexão HTTP persistente (`text/event-stream`) com empurrão (*push*) imediato de eventos para o cliente sem consultas redundantes.
3. **Parte D — WebSocket:** Comunicação bidirecional contínua full-duplex com validação rigorosa de payloads JSON e difusão (*broadcast*) para múltiplos clientes.
4. **Parte E — Webhook:** Envio assíncrono entre serviços (Server-to-Server) com autenticação por token secreto (`X-Webhook-Secret`), resiliência com política de repetições (*retries* com backoff) e garantia de idempotência no receptor através do `eventoId`.
5. **Parte F — AsyncAPI 3.0.0:** Contrato formal (`asyncapi.yaml`) descrevendo canais lógicos, operações `send`/`receive` e o esquema do evento `EncomendaExpedida`.
6. **Parte G — Testes e Validação:** Suite automatizada de validação de contratos e testes integrados dos quatro mecanismos.

---

## 📂 2. Estrutura de Ficheiros

```
assinc/
├── asyncapi.yaml                     # Contrato formal AsyncAPI 3.0.0
├── models.py                         # Modelos Pydantic de validação do contrato e evento
├── server.py                         # Servidor Central FastAPI (Polling, SSE, WS, Webhook Dispatcher)
├── websocket_slide_server.py         # Servidor WebSocket fidedigno aos Slides 8 e 10
├── websocket_slide_cliente.py        # Cliente WebSocket interativo fidedigno ao Slide 9
├── requirements.txt                  # Dependências Python (FastAPI, Uvicorn, WebSockets, etc.)
├── RESPOSTAS_E_COMPARACAO.md         # Respostas às reflexões, tabela comparativa e riscos
├── README.md                         # Este documento de referência
│
├── clientes/
│   ├── cliente_polling.py            # Cliente de Polling periódico (conta pedidos e desperdício)
│   ├── cliente_sse.py                # Cliente SSE que consome o fluxo de eventos em tempo real
│   ├── cliente_websocket.py          # Cliente interativo WebSocket com suporte a broadcast
│   └── webhook_receiver.py           # Serviço receptor de Webhook (porta 5001) com auth e deduplicação
│
├── tests/
│   ├── payloads_exemplos.json        # Conjunto de payloads válidos e inválidos catalogados
│   ├── test_payloads.py              # Teste unitário de aceitação e rejeição de payloads
│   └── test_mecanismos.py            # Testes integrados automatizados dos 4 mecanismos
│
└── static/
    └── index.html                    # Painel Web interativo didático com os 4 mecanismos lado a lado
```

---

## 🚀 3. Instalação e Preparação

Certifique-se de que o Python 3.10+ está instalado e instale as dependências:

```bash
python -m pip install -r requirements.txt
```

---

## 🎮 4. Como Executar

### Opção A: Demonstração Visual Rápida (Painel Web Interativo)

1. **Iniciar o Servidor Central:**
   ```bash
   python server.py
   ```
2. **Iniciar o Serviço Receptor de Webhook (noutro terminal):**
   ```bash
   python clientes/webhook_receiver.py
   ```
3. **Abrir o Painel no Navegador:**
   Aceda a **[http://localhost:8000](http://localhost:8000)**
   - O painel apresenta os **4 mecanismos lado a lado**:
     - **Polling:** Contador em tempo real de pedidos e percentagem de desperdício.
     - **SSE:** Stream persistente que reage de imediato à expedição.
     - **WebSocket:** Conexão full-duplex permitindo testar payloads e receber broadcast.
     - **Webhook:** Histórico de envios para a porta 5001 com validação de status.
   - Botão **🚀 Expedir Encomenda**: Dispara o comando e aciona de seguida os 4 mecanismos!
   - Botão **⚠️ Testar Payload Inválido**: Envia payload sem campos obrigatórios e demonstra a rejeição pelo servidor.
   - Botão **🔄 Reiniciar Estado**: Repõe a encomenda em «em preparação» para repetir testes.

---

### Opção B: Demonstração dos Scripts em Linha de Comandos (Consola)

#### 1. Testar o Exemplo dos Slides da Aula (Slides 8 e 9)
Abra 3 terminais PowerShell:
* **Terminal 1 (Servidor WebSocket):**
  ```bash
  python websocket_slide_server.py
  ```
* **Terminal 2 (Cliente 1):**
  ```bash
  python websocket_slide_cliente.py
  ```
* **Terminal 3 (Cliente 2):**
  ```bash
  python websocket_slide_cliente.py
  ```
* No Terminal 2, digite `expedir` ou `invalido`. Observe o Terminal 3 a receber o broadcast e o servidor a validar o contrato!

---

#### 2. Testar o Mecanismo de Polling (Parte B)
Com o `server.py` ativo:
```bash
python clientes/cliente_polling.py --intervalo 5
```
* O cliente faz pedidos a cada 5 segundos.
* Noutro terminal/postman (ou no browser), faça a expedição:
  ```bash
  curl -X POST "http://localhost:8000/api/encomendas/ENC-1042/expedir?transportadora=RotaSul"
  ```
* O cliente de polling deteta a alteração e imprime o relatório de overhead com pedidos sem alteração.

---

#### 3. Testar Server-Sent Events - SSE (Parte C)
Com o `server.py` ativo:
```bash
python clientes/cliente_sse.py
```
* O cliente mantém 1 única ligação HTTP persistente.
* Ao expedir a encomenda, o evento chega instantaneamente (0ms de atraso).

---

#### 4. Testar Webhook e Resiliência (Parte E)
Com o `server.py` ativo:
* Inicie o receptor:
  ```bash
  python clientes/webhook_receiver.py
  ```
* Ao expedir no servidor central, noutro terminal, Postman ou através do botão no painel web (/docs):, provocar o expedir da encomenda, e depois o webhook é enviado com autenticação `X-Webhook-Secret`.
* **Deduplicação:** Se o mesmo evento for reenviado, o receptor deteta o `eventoId` já processado e ignora a duplicação.
* **Simulação de Falha e Retries:**
  Inicie o receptor com `--falhar`:
  ```bash
  python clientes/webhook_receiver.py --falhar
  ```
  Ao expedir no servidor, observe no log do `server.py` as 3 tentativas com backoff exponencial!

---

## 🧪 5. Execução dos Testes Automatizados (Parte G)

Execute os testes de validação unitária e integração:

```bash
# Teste de Contratos e Payloads (Válidos vs Inválidos)
python tests/test_payloads.py

# Teste Integrado dos 4 Mecanismos
python tests/test_mecanismos.py
```

Ambos os scripts foram desenhados para correr de forma autónoma sem dependências de serviços externos.

---

## 📜 6. Contrato AsyncAPI 3.0.0 (Parte F)

O contrato formal encontra-se em [`asyncapi.yaml`](file:///D:/Escola/LabSoftware/assinc/asyncapi.yaml) e pode ser visualizado via browser em `http://localhost:8000/asyncapi.yaml` ou importado no [AsyncAPI Studio](https://studio.asyncapi.com/).
