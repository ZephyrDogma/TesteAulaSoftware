import asyncio
import json
import sys
from datetime import datetime, timezone
from websockets.asyncio.client import connect

URI = "ws://localhost:8765"


def gerar_payload_valido(encomenda_id: str = "ENC-1042", transportadora: str = "RotaSul") -> dict:
    agora_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return {
        "tipo": "EncomendaExpedida",
        "eventoId": f"EVT-{int(datetime.now().timestamp() * 1000) % 100000}",
        "encomendaId": encomenda_id,
        "instante": agora_iso,
        "transportadora": transportadora
    }


def gerar_payload_invalido() -> dict:
    return {
        "tipo": "EncomendaExpedida",
        "encomendaId": "ENC-1042"
    }


async def main():
    uri = sys.argv[1] if len(sys.argv) > 1 else URI

    try:
        async with connect(uri) as ws:
            print(f"Ligado a {uri}")

            async def receber():
                try:
                    async for msg in ws:
                        print(f"\n[Recebido]: {msg}\n> ", end="", flush=True)
                except asyncio.CancelledError:
                    pass
                except Exception:
                    pass

            tarefa = asyncio.create_task(receber())

            try:
                while True:
                    msg = await asyncio.to_thread(input, "Mensagem (sair termina): ")
                    comando = msg.strip()

                    if comando.lower() == "sair":
                        break

                    if not comando:
                        continue

                    if comando.lower() == "expedir":
                        payload = gerar_payload_valido()
                        await ws.send(json.dumps(payload, ensure_ascii=False))
                    elif comando.lower() == "invalido":
                        payload = gerar_payload_invalido()
                        await ws.send(json.dumps(payload, ensure_ascii=False))
                    else:
                        await ws.send(comando)

            finally:
                tarefa.cancel()
                try:
                    await tarefa
                except asyncio.CancelledError:
                    pass

    except Exception as err:
        print(f"Erro de conexão: {err}")


if __name__ == "__main__":
    asyncio.run(main())
