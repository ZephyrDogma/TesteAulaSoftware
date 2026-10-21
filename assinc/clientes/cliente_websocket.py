import argparse
import asyncio
import json
import sys
from datetime import datetime, timezone
from websockets.asyncio.client import connect

DEFAULT_URI = "ws://localhost:8000/ws/encomendas"


def criar_evento_valido(encomenda_id: str = "ENC-1042", transportadora: str = "RotaSul") -> dict:
    agora_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    sufixo = int(datetime.now().timestamp() * 1000) % 100000
    return {
        "tipo": "EncomendaExpedida",
        "eventoId": f"EVT-{sufixo}",
        "encomendaId": encomenda_id,
        "instante": agora_iso,
        "transportadora": transportadora
    }


def criar_evento_invalido() -> dict:
    return {
        "tipo": "EncomendaExpedida",
        "encomendaId": "ENC-1042"
    }


async def main():
    parser = argparse.ArgumentParser(description="Cliente WebSocket Bidirecional")
    parser.add_argument("--uri", default=DEFAULT_URI, help="URI do WebSocket (padrão: ws://localhost:8000/ws/encomendas)")
    parser.add_argument("--nome", default="Cliente-WS", help="Nome do cliente para identificação nos logs")
    args = parser.parse_args()

    uri = args.uri
    nome = args.nome

    print(f"[{nome}] A ligar a: {uri}")

    try:
        async with connect(uri) as ws:
            print(f"[{nome}] Conectado com sucesso.")

            async def receber():
                try:
                    async for mensagem in ws:
                        agora = datetime.now().strftime("%H:%M:%S")
                        try:
                            dados = json.loads(mensagem)
                            print(f"\n[{agora}][{nome}]:\n{json.dumps(dados, indent=2, ensure_ascii=False)}\n> ", end="", flush=True)
                        except Exception:
                            print(f"\n[{agora}][{nome}]: {mensagem}\n> ", end="", flush=True)
                except asyncio.CancelledError:
                    pass
                except Exception:
                    pass

            tarefa_receber = asyncio.create_task(receber())

            try:
                while True:
                    entrada = await asyncio.to_thread(input, f"[{nome}] Comando ('expedir', 'invalido', 'sair'): ")
                    comando = entrada.strip()

                    if comando.lower() == "sair":
                        break

                    if not comando:
                        continue

                    if comando.lower() == "expedir":
                        payload = criar_evento_valido()
                        await ws.send(json.dumps(payload, ensure_ascii=False))

                    elif comando.lower() == "invalido":
                        payload = criar_evento_invalido()
                        await ws.send(json.dumps(payload, ensure_ascii=False))

                    else:
                        await ws.send(comando)

            finally:
                tarefa_receber.cancel()
                try:
                    await tarefa_receber
                except asyncio.CancelledError:
                    pass

    except Exception as erro:
        print(f"[{nome}] Erro de ligação: {erro}")


if __name__ == "__main__":
    asyncio.run(main())
