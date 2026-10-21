import json
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from models import validar_evento, EncomendaExpedida


def testar_payloads():
    exemplos_file = Path(__file__).resolve().parent / "payloads_exemplos.json"
    assert exemplos_file.exists()

    with open(exemplos_file, "r", encoding="utf-8") as f:
        dados = json.load(f)

    payload_valido = dados["payload_valido"]
    valido, erro, evento = validar_evento(payload_valido)
    assert valido is True
    assert isinstance(evento, EncomendaExpedida)
    assert evento.tipo == "EncomendaExpedida"
    assert evento.eventoId == "EVT-1001"
    assert evento.encomendaId == "ENC-1042"
    assert evento.transportadora == "RotaSul"

    for cenario in dados["payloads_invalidos"]:
        payload = cenario["payload"]
        valido, erro, evento = validar_evento(payload)
        assert valido is False

    valido, erro, _ = validar_evento("string_invalida")
    assert valido is False

    print("Testes de payload executados com sucesso.")


if __name__ == "__main__":
    testar_payloads()
