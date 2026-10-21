import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Set, Optional

import requests
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Header, Query
from fastapi.responses import HTMLResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from models import (
    ComandoExpedir,
    EncomendaExpedida,
    EstadoEncomenda,
    validar_evento
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ServidorEncomendas")

app = FastAPI(
    title="Plataforma de Encomendas - APIs Assíncronas (Aula 5)",
    version="1.0.0",
    description="Servidor didático para demonstração e comparação de Polling, SSE, WebSockets e Webhooks."
)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

ENCOMENDAS_DB: Dict[str, dict] = {
    "ENC-1042": {
        "encomendaId": "ENC-1042",
        "estado": "em preparação",
        "transportadora": None,
        "ultimoEvento": None,
        "atualizadoEm": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "pedidosPolling": 0
    }
}

SSE_SUBSCRIBERS: Dict[str, Set[asyncio.Queue]] = {}
WS_LIGADOS: Set[WebSocket] = set()

CONFIG_WEBHOOK = {
    "url": "http://localhost:5001/webhook",
    "secret": "segredo_super_seguro_aula5",
    "ativo": True,
    "max_retries": 3,
    "backoff_base": 1.0
}

HISTORICO_WEBHOOKS: List[dict] = []


async def notificar_clientes_sse(encomenda_id: str, evento: EncomendaExpedida):
    if encomenda_id in SSE_SUBSCRIBERS:
        mensagem_sse = (
            f"event: EncomendaExpedida\n"
            f"id: {evento.eventoId}\n"
            f"data: {json.dumps(evento.to_event_dict(), ensure_ascii=False)}\n\n"
        )
        queues = list(SSE_SUBSCRIBERS[encomenda_id])
        logger.info(f"[SSE] A notificar {len(queues)} cliente(s) SSE para {encomenda_id}")
        for q in queues:
            await q.put(mensagem_sse)


async def notificar_clientes_ws(evento: EncomendaExpedida):
    mensagem_json = json.dumps(evento.to_event_dict(), ensure_ascii=False)
    clientes = list(WS_LIGADOS)
    logger.info(f"[WEBSOCKET] A difundir evento para {len(clientes)} cliente(s) ativos")
    for ws in clientes:
        try:
            await ws.send_text(mensagem_json)
        except Exception as e:
            logger.warning(f"[WEBSOCKET] Falha ao enviar para cliente: {e}")


def enviar_webhook_com_retries(evento_dict: dict, config: dict):
    url = config["url"]
    secret = config["secret"]
    max_retries = config["max_retries"]
    backoff = config["backoff_base"]

    registo = {
        "eventoId": evento_dict.get("eventoId"),
        "encomendaId": evento_dict.get("encomendaId"),
        "url": url,
        "iniciadoEm": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "tentativas": 0,
        "sucesso": False,
        "detalhes": []
    }

    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Secret": secret,
        "X-Event-Type": evento_dict.get("tipo", "EncomendaExpedida")
    }

    import time
    sucesso = False
    for tentativa in range(1, max_retries + 1):
        registo["tentativas"] = tentativa
        inicio_tentativa = time.time()
        try:
            logger.info(f"[WEBHOOK] Tentativa {tentativa}/{max_retries} -> {url}")
            resp = requests.post(url, json=evento_dict, headers=headers, timeout=3.0)
            duracao_ms = round((time.time() - inicio_tentativa) * 1000, 2)
            
            if resp.status_code in (200, 201, 202, 204, 208):
                logger.info(f"[WEBHOOK] Sucesso (HTTP {resp.status_code}) em {duracao_ms}ms")
                registo["sucesso"] = True
                registo["detalhes"].append({
                    "tentativa": tentativa,
                    "status_code": resp.status_code,
                    "resposta": resp.text[:200],
                    "duracao_ms": duracao_ms
                })
                sucesso = True
                break
            else:
                logger.warning(f"[WEBHOOK] Servidor de destino rejeitou com HTTP {resp.status_code}")
                registo["detalhes"].append({
                    "tentativa": tentativa,
                    "status_code": resp.status_code,
                    "erro": resp.text[:200],
                    "duracao_ms": duracao_ms
                })
        except Exception as ex:
            duracao_ms = round((time.time() - inicio_tentativa) * 1000, 2)
            logger.warning(f"[WEBHOOK] Tentativa {tentativa} falhou: {ex}")
            registo["detalhes"].append({
                "tentativa": tentativa,
                "status_code": None,
                "erro": str(ex),
                "duracao_ms": duracao_ms
            })

        if tentativa < max_retries:
            tempo_espera = backoff * (2 ** (tentativa - 1))
            logger.info(f"[WEBHOOK] A aguardar {tempo_espera}s antes da próxima repetição...")
            time.sleep(tempo_espera)

    registo["finalizadoEm"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    HISTORICO_WEBHOOKS.append(registo)


@app.get("/api/encomendas", summary="Lista todas as encomendas", description="Retorna a lista completa das encomendas registadas e o seu estado atual.")
def listar_encomendas():
    return list(ENCOMENDAS_DB.values())


@app.get("/api/encomendas/{encomenda_id}", summary="Consulta de estado (Endpoint de Polling)", description="O cliente consulta periodicamente este endpoint para detetar se o estado da encomenda mudou.")
def obter_estado_encomenda(encomenda_id: str):
    if encomenda_id not in ENCOMENDAS_DB:
        raise HTTPException(status_code=404, detail=f"Encomenda '{encomenda_id}' não encontrada.")
    
    encomenda = ENCOMENDAS_DB[encomenda_id]
    encomenda["pedidosPolling"] += 1
    return encomenda


@app.post("/api/encomendas/{encomenda_id}/expedir", summary="Comando ExpedirEncomenda (Transição de Estado)", description="Executa a transição de estado da encomenda de «em preparação» para «expedida» e despoleta os eventos assíncronos.")
async def expedir_encomenda(
    encomenda_id: str,
    transportadora: str = Query("RotaSul", description="Nome da transportadora encarregada do envio")
):
    if encomenda_id not in ENCOMENDAS_DB:
        raise HTTPException(status_code=404, detail=f"Encomenda '{encomenda_id}' não existe.")

    encomenda = ENCOMENDAS_DB[encomenda_id]
    agora = datetime.now(timezone.utc)
    agora_iso = agora.strftime("%Y-%m-%dT%H:%M:%SZ")
    evento_id = f"EVT-{int(agora.timestamp() * 1000) % 100000}"

    evento = EncomendaExpedida(
        tipo="EncomendaExpedida",
        eventoId=evento_id,
        encomendaId=encomenda_id,
        instante=agora,
        transportadora=transportadora
    )

    encomenda["estado"] = "expedida"
    encomenda["transportadora"] = transportadora
    encomenda["ultimoEvento"] = evento.to_event_dict()
    encomenda["atualizadoEm"] = agora_iso

    logger.info(f"[COMANDO] Encomenda '{encomenda_id}' expedida via {transportadora}.")

    await notificar_clientes_sse(encomenda_id, evento)
    await notificar_clientes_ws(evento)

    if CONFIG_WEBHOOK["ativo"]:
        asyncio.create_task(
            asyncio.to_thread(enviar_webhook_com_retries, evento.to_event_dict(), CONFIG_WEBHOOK)
        )

    return {
        "mensagem": f"Encomenda '{encomenda_id}' expedida com sucesso.",
        "evento": evento.to_event_dict(),
        "estadoAtual": encomenda
    }


@app.post("/api/encomendas/{encomenda_id}/reset", summary="Reinicia o estado da encomenda", description="Repõe a encomenda no estado inicial 'em preparação' para permitir novas demonstrações.")
async def reset_encomenda(encomenda_id: str):
    if encomenda_id not in ENCOMENDAS_DB:
        ENCOMENDAS_DB[encomenda_id] = {
            "encomendaId": encomenda_id,
            "estado": "em preparação",
            "transportadora": None,
            "ultimoEvento": None,
            "atualizadoEm": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "pedidosPolling": 0
        }
    else:
        encomenda = ENCOMENDAS_DB[encomenda_id]
        encomenda["estado"] = "em preparação"
        encomenda["transportadora"] = None
        encomenda["ultimoEvento"] = None
        encomenda["atualizadoEm"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        encomenda["pedidosPolling"] = 0

    return {"mensagem": f"Encomenda '{encomenda_id}' reposta para 'em preparação'.", "encomenda": ENCOMENDAS_DB[encomenda_id]}


@app.get("/api/encomendas/{encomenda_id}/sse", summary="Stream de eventos Server-Sent Events (SSE)", description="Mantém uma ligação HTTP aberta text/event-stream com envio de eventos em tempo real.")
async def stream_sse(encomenda_id: str):
    if encomenda_id not in ENCOMENDAS_DB:
        raise HTTPException(status_code=404, detail="Encomenda não encontrada.")

    async def event_generator():
        queue: asyncio.Queue = asyncio.Queue()
        if encomenda_id not in SSE_SUBSCRIBERS:
            SSE_SUBSCRIBERS[encomenda_id] = set()
        SSE_SUBSCRIBERS[encomenda_id].add(queue)

        try:
            estado_atual = ENCOMENDAS_DB[encomenda_id]
            msg_inicial = (
                f"event: estadoAtual\n"
                f"data: {json.dumps(estado_atual, ensure_ascii=False)}\n\n"
            )
            yield msg_inicial

            while True:
                try:
                    mensagem = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield mensagem
                except asyncio.TimeoutError:
                    yield ": ping keep-alive\n\n"

        except asyncio.CancelledError:
            pass
        finally:
            SSE_SUBSCRIBERS[encomenda_id].discard(queue)
            logger.info(f"[SSE] Cliente desconectado da encomenda {encomenda_id}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.websocket("/ws/encomendas")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    WS_LIGADOS.add(ws)
    logger.info(f"[WS] Novo cliente conectado via WebSocket. Total: {len(WS_LIGADOS)}")

    await ws.send_json({
        "status": "conectado",
        "tipo": "ConexaoEstabelecida",
        "clientesLigados": len(WS_LIGADOS)
    })

    try:
        while True:
            texto = await ws.receive_text()
            logger.info(f"[WS-RECEBIDO]: {texto}")

            try:
                dados = json.loads(texto)
            except json.JSONDecodeError:
                await ws.send_json({
                    "erro": "JSON_MALFORMADO",
                    "detalhe": "A mensagem enviada não é um JSON válido."
                })
                continue

            valido, erro_msg, evento = validar_evento(dados)
            if not valido:
                await ws.send_json({
                    "erro": "PAYLOAD_INVALIDO",
                    "detalhe": erro_msg
                })
                continue

            enc_id = evento.encomendaId
            if enc_id in ENCOMENDAS_DB:
                ENCOMENDAS_DB[enc_id]["estado"] = "expedida"
                ENCOMENDAS_DB[enc_id]["transportadora"] = evento.transportadora
                ENCOMENDAS_DB[enc_id]["ultimoEvento"] = evento.to_event_dict()
                ENCOMENDAS_DB[enc_id]["atualizadoEm"] = evento.instante.strftime("%Y-%m-%dT%H:%M:%SZ")

            msg_broadcast = json.dumps(evento.to_event_dict(), ensure_ascii=False)
            outros_clientes = [c for c in list(WS_LIGADOS) if c != ws]
            for cliente in outros_clientes:
                try:
                    await cliente.send_text(msg_broadcast)
                except Exception as ex:
                    logger.warning(f"[WS] Falha ao enviar broadcast: {ex}")

            await notificar_clientes_sse(enc_id, evento)

            await ws.send_json({
                "status": "sucesso",
                "mensagem": "Evento validado e difundido aos clientes/empregados de entrega conectados.",
                "eventoId": evento.eventoId,
                "difundidoPara": len(outros_clientes)
            })

    except WebSocketDisconnect:
        WS_LIGADOS.discard(ws)
        logger.info(f"[WS] Cliente desconectado. Total ativos: {len(WS_LIGADOS)}")
    except Exception as e:
        WS_LIGADOS.discard(ws)
        logger.info(f"[WS] Conexão terminada: {e}")


@app.get("/api/webhook/config", summary="Obtém a configuração atual do Webhook", description="Retorna a URL de destino, chave secreta e política de retries configurada.")
def obter_config_webhook():
    return CONFIG_WEBHOOK


@app.post("/api/webhook/config", summary="Atualiza a configuração do Webhook", description="Permite redefinir URL, chave secreta e número de repetições do emissor.")
def atualizar_config_webhook(dados: dict):
    if "url" in dados:
        CONFIG_WEBHOOK["url"] = dados["url"]
    if "secret" in dados:
        CONFIG_WEBHOOK["secret"] = dados["secret"]
    if "ativo" in dados:
        CONFIG_WEBHOOK["ativo"] = bool(dados["ativo"])
    if "max_retries" in dados:
        CONFIG_WEBHOOK["max_retries"] = int(dados["max_retries"])
    return {"mensagem": "Configuração do Webhook atualizada.", "config": CONFIG_WEBHOOK}


@app.get("/api/webhook/historico", summary="Histórico de tentativas de envio de Webhook", description="Registo de todos os despachos de Webhook com contagem de tentativas e status codes.")
def historico_webhooks():
    return HISTORICO_WEBHOOKS


@app.get("/asyncapi.yaml", summary="Descarrega o contrato AsyncAPI 3.0", description="Disponibiliza o ficheiro de especificação formal da API de eventos em formato YAML.")
def descarregar_asyncapi():
    asyncapi_file = BASE_DIR / "asyncapi.yaml"
    if not asyncapi_file.exists():
        raise HTTPException(status_code=404, detail="Ficheiro asyncapi.yaml não encontrado.")
    return FileResponse(asyncapi_file, media_type="application/x-yaml")


@app.get("/", response_class=HTMLResponse, summary="Painel Web interativo de demonstração", description="Interface gráfica com visualização simultânea dos 4 mecanismos assíncronos.")
def painel_principal():
    index_file = STATIC_DIR / "index.html"
    if not index_file.exists():
        return "<h3>Painel interativo não encontrado.</h3>"
    return FileResponse(index_file)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
