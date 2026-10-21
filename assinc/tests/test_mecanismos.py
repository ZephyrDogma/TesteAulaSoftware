import json
from pathlib import Path
import sys
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
sys.path.append(str(BASE_DIR / "clientes"))

from server import app as server_app, ENCOMENDAS_DB
from webhook_receiver import app as webhook_app, EVENTOS_PROCESSADOS, SEGREDO_ESPERADO


def test_mecanismo_polling():
    from server import CONFIG_WEBHOOK
    webhook_original = CONFIG_WEBHOOK["ativo"]
    CONFIG_WEBHOOK["ativo"] = False
    try:
        client = TestClient(server_app)

        client.post("/api/encomendas/ENC-1042/reset")

        r1 = client.get("/api/encomendas/ENC-1042")
        assert r1.status_code == 200
        dados1 = r1.json()
        assert dados1["estado"] == "em preparação"

        r2 = client.get("/api/encomendas/ENC-1042")
        assert r2.status_code == 200
        dados2 = r2.json()
        assert dados2["estado"] == "em preparação"

        r_exp = client.post("/api/encomendas/ENC-1042/expedir?transportadora=RotaSul")
        assert r_exp.status_code == 200

        r3 = client.get("/api/encomendas/ENC-1042")
        dados3 = r3.json()
        assert dados3["estado"] == "expedida"
        assert dados3["transportadora"] == "RotaSul"
    finally:
        CONFIG_WEBHOOK["ativo"] = webhook_original


def test_mecanismo_websocket():
    client = TestClient(server_app)

    with client.websocket_connect("/ws/encomendas") as ws:
        msg_inicial = ws.receive_json()
        assert msg_inicial.get("status") == "conectado"

        ws.send_text("{isto não é json válido")
        erro_json = ws.receive_json()
        assert erro_json["erro"] == "JSON_MALFORMADO"

        invalido = {
            "tipo": "EncomendaExpedida",
            "eventoId": "EVT-TESTE-INV",
            "encomendaId": "ENC-1042",
            "instante": "2026-10-19T14:00:00Z"
        }
        ws.send_text(json.dumps(invalido))
        erro_contrato = ws.receive_json()
        assert erro_contrato["erro"] == "PAYLOAD_INVALIDO"

        valido = {
            "tipo": "EncomendaExpedida",
            "eventoId": "EVT-WS-9999",
            "encomendaId": "ENC-1042",
            "instante": "2026-10-19T14:00:00Z",
            "transportadora": "RotaSul"
        }
        ws.send_text(json.dumps(valido))
        resposta_valida = ws.receive_json()
        assert resposta_valida["status"] == "sucesso"
        assert resposta_valida["eventoId"] == "EVT-WS-9999"


def test_mecanismo_webhook():
    client_wh = TestClient(webhook_app)

    EVENTOS_PROCESSADOS.clear()
    client_wh.post("/toggle-falha?falhar=false")

    payload_evento = {
        "tipo": "EncomendaExpedida",
        "eventoId": "EVT-WH-5001",
        "encomendaId": "ENC-1042",
        "instante": "2026-10-19T14:00:00Z",
        "transportadora": "RotaSul"
    }

    r_unauth = client_wh.post("/webhook", json=payload_evento)
    assert r_unauth.status_code == 401

    headers = {"X-Webhook-Secret": SEGREDO_ESPERADO}
    r_ok = client_wh.post("/webhook", json=payload_evento, headers=headers)
    assert r_ok.status_code == 200
    dados_ok = r_ok.json()
    assert dados_ok["status"] == "sucesso"

    r_duplicado = client_wh.post("/webhook", json=payload_evento, headers=headers)
    assert r_duplicado.status_code in (200, 208)
    dados_dup = r_duplicado.json()
    assert dados_dup["status"] == "duplicado_ignorado"

    client_wh.post("/toggle-falha?falhar=true")
    r_falha = client_wh.post("/webhook", json=payload_evento, headers=headers)
    assert r_falha.status_code == 500

    client_wh.post("/toggle-falha?falhar=false")


def test_mecanismo_sse():
    client = TestClient(server_app)

    with client.stream("GET", "/api/encomendas/ENC-1042/sse") as stream:
        assert stream.status_code == 200
        assert "text/event-stream" in stream.headers["content-type"]

        linhas = []
        for line in stream.iter_lines():
            if line:
                linhas.append(line)
            else:
                break
        texto = "\n".join(linhas)
        assert "event: estadoAtual" in texto


if __name__ == "__main__":
    test_mecanismo_polling()
    test_mecanismo_websocket()
    test_mecanismo_webhook()
    test_mecanismo_sse()
    print("Testes dos 4 mecanismos executados com sucesso.")
