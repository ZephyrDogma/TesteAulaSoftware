import argparse
import json
import sys
import time
from datetime import datetime
import requests

DEFAULT_URL = "http://localhost:8000/api/encomendas/ENC-1042/sse"


def main():
    parser = argparse.ArgumentParser(description="Cliente SSE para recepção de eventos de encomenda")
    parser.add_argument("--url", default=DEFAULT_URL, help="URL do endpoint SSE da encomenda")
    args = parser.parse_args()

    url = args.url

    print(f"SSE ligado a {url}")

    pedidos_http = 1
    eventos_recebidos = 0
    t_inicio = time.time()

    headers = {
        "Accept": "text/event-stream",
        "Cache-Control": "no-cache"
    }

    try:
        with requests.get(url, headers=headers, stream=True, timeout=None) as response:
            if response.status_code != 200:
                print(f"Erro HTTP {response.status_code}")
                return

            evento_atual = None
            id_atual = None
            linhas_data = []

            for linha_bytes in response.iter_lines():
                if linha_bytes:
                    linha = linha_bytes.decode("utf-8")

                    if linha.startswith(":"):
                        continue

                    if linha.startswith("event:"):
                        evento_atual = linha[len("event:"):].strip()
                    elif linha.startswith("id:"):
                        id_atual = linha[len("id:"):].strip()
                    elif linha.startswith("data:"):
                        linhas_data.append(linha[len("data:"):].strip())

                else:
                    if linhas_data or evento_atual:
                        eventos_recebidos += 1
                        payload_str = "\n".join(linhas_data)
                        agora_str = datetime.now().strftime("%H:%M:%S")

                        print(f"[{agora_str}] Evento SSE #{eventos_recebidos} ({evento_atual}):")
                        try:
                            dados = json.loads(payload_str)
                            print(json.dumps(dados, indent=2, ensure_ascii=False))
                        except Exception:
                            print(payload_str)

                        evento_atual = None
                        id_atual = None
                        linhas_data = []

    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"Conexão encerrada: {e}")

    duracao = round(time.time() - t_inicio, 1)
    print(f"\nSessão SSE concluída: {eventos_recebidos} eventos recebidos em {duracao}s")


if __name__ == "__main__":
    main()
