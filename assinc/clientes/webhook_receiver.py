import argparse
import json
import logging
from typing import Set, Dict
from fastapi import FastAPI, Header, HTTPException, Request, Response
import uvicorn
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))
from models import validar_evento

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("WebhookReceiver")

app = FastAPI(
    title="Serviço de Notificações (Webhook Receiver)",
    version="1.0.0",
    description="Serviço consumidor de Webhooks para notificação aos clientes."
)

SEGREDO_ESPERADO = "segredo_super_seguro_aula5"
SIMULAR_FALHA = False
EVENTOS_PROCESSADOS: Set[str] = set()
HISTORICO_RECEBIDOS = []


@app.post("/webhook", summary="Endpoint de destino do Webhook", description="Recebe chamadas POST com autenticação X-Webhook-Secret e deduplicação de eventoId.")
async def receber_webhook(
    request: Request,
    response: Response,
    x_webhook_secret: str = Header(None, alias="X-Webhook-Secret", description="Token secreto partilhado de autenticação")
):
    global SIMULAR_FALHA

    if SIMULAR_FALHA:
        logger.warning("Falha simulada HTTP 500")
        raise HTTPException(status_code=500, detail="Serviço indisponível.")

    if not x_webhook_secret or x_webhook_secret != SEGREDO_ESPERADO:
        raise HTTPException(
            status_code=401,
            detail="Autenticação falhou: cabeçalho 'X-Webhook-Secret' inválido ou ausente."
        )

    try:
        dados = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Corpo da mensagem não é JSON válido.")

    valido, erro, evento = validar_evento(dados)
    if not valido:
        raise HTTPException(status_code=422, detail=f"Violação de contrato: {erro}")

    evento_id = evento.eventoId
    if evento_id in EVENTOS_PROCESSADOS:
        response.status_code = 208
        return {
            "status": "duplicado_ignorado",
            "mensagem": f"O evento {evento_id} já foi processado anteriormente. Nenhuma ação duplicada foi executada.",
            "eventoId": evento_id
        }

    EVENTOS_PROCESSADOS.add(evento_id)
    registo = {
        "eventoId": evento_id,
        "encomendaId": evento.encomendaId,
        "instante": evento.instante.isoformat(),
        "transportadora": evento.transportadora,
        "status": "notificacao_enviada"
    }
    HISTORICO_RECEBIDOS.append(registo)

    logger.info(f"Notificação enviada: Encomenda {evento.encomendaId} ({evento_id})")

    return {
        "status": "sucesso",
        "mensagem": f"Notificação da encomenda {evento.encomendaId} processada com sucesso.",
        "eventoId": evento_id
    }


@app.post("/toggle-falha", summary="Ativa/desativa simulação de falha 500", description="Alterna o modo de falha para testar a resiliência e as repetições do emissor.")
def alternar_falha(falhar: bool):
    global SIMULAR_FALHA
    SIMULAR_FALHA = falhar
    return {"simularFalha": SIMULAR_FALHA}


@app.get("/historico", summary="Lista de eventos recebidos pelo Webhook", description="Retorna todos os eventos registados pelo serviço consumidor.")
def ver_historico():
    return {
        "totalProcessados": len(EVENTOS_PROCESSADOS),
        "eventos": HISTORICO_RECEBIDOS,
        "simularFalha": SIMULAR_FALHA
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Servidor Receptor de Webhook (Consumidor de Notificações)")
    parser.add_argument("--porta", type=int, default=5001, help="Porta HTTP para escuta (padrão: 5001)")
    parser.add_argument("--falhar", action="store_true", help="Inicia o receptor em modo de falha simulada HTTP 500")
    args = parser.parse_args()

    SIMULAR_FALHA = args.falhar
    uvicorn.run(app, host="0.0.0.0", port=args.porta)
