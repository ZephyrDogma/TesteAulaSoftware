import asyncio
import json
from websockets.asyncio.server import serve
from models import validar_evento

LIGADOS = set()
PORTA = 8765


async def handler(ws):
    cliente_id = f"{ws.remote_address[0]}:{ws.remote_address[1]}"
    LIGADOS.add(ws)

    boas_vindas = {
        "status": "conectado",
        "mensagem": "Ligado ao servidor WebSocket.",
        "clientesLigados": len(LIGADOS)
    }
    await ws.send(json.dumps(boas_vindas, ensure_ascii=False))

    try:
        async for mensagem in ws:
            try:
                dados = json.loads(mensagem)
            except json.JSONDecodeError:
                erro_payload = {
                    "erro": "JSON_MALFORMADO",
                    "detalhe": "A mensagem enviada não é um JSON válido."
                }
                await ws.send(json.dumps(erro_payload, ensure_ascii=False))
                continue

            valido, erro, evento = validar_evento(dados)
            if not valido:
                erro_payload = {
                    "erro": "PAYLOAD_INVALIDO",
                    "detalhe": erro
                }
                await ws.send(json.dumps(erro_payload, ensure_ascii=False))
                continue

            msg_broadcast = json.dumps(evento.to_event_dict(), ensure_ascii=False)
            destinatarios = [c for c in list(LIGADOS) if c != ws]
            for cliente in destinatarios:
                try:
                    await cliente.send(msg_broadcast)
                except Exception:
                    pass

            confirmacao = {
                "status": "aceite",
                "eventoId": evento.eventoId,
                "difundidoPara": len(destinatarios)
            }
            await ws.send(json.dumps(confirmacao, ensure_ascii=False))

    except Exception:
        pass
    finally:
        LIGADOS.discard(ws)


async def main():
    print(f"Servidor WebSocket iniciado em ws://localhost:{PORTA}")
    async with serve(handler, "localhost", PORTA):
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
