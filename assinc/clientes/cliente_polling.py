import argparse
import sys
import time
from datetime import datetime
import requests

DEFAULT_URL = "http://localhost:8000/api/encomendas/ENC-1042"
DEFAULT_INTERVALO = 5


def main():
    parser = argparse.ArgumentParser(description="Cliente de Polling para consulta periódica de estado de encomenda")
    parser.add_argument("--url", default=DEFAULT_URL, help="URL do endpoint de estado da encomenda")
    parser.add_argument("--intervalo", type=float, default=DEFAULT_INTERVALO, help="Intervalo de consulta em segundos (padrão: 5s)")
    parser.add_argument("--max-pedidos", type=int, default=30, help="Número máximo de consultas antes de parar")
    args = parser.parse_args()

    url = args.url
    intervalo = args.intervalo
    max_pedidos = args.max_pedidos

    print(f"Polling iniciado em {url} (intervalo: {intervalo}s)")

    estado_anterior = None
    pedidos_totais = 0
    pedidos_sem_alteracao = 0
    momento_inicio = time.time()

    try:
        while pedidos_totais < max_pedidos:
            pedidos_totais += 1
            agora_str = datetime.now().strftime("%H:%M:%S")

            try:
                t0 = time.time()
                resp = requests.get(url, timeout=4.0)
                latencia_http = round((time.time() - t0) * 1000, 1)

                if resp.status_code == 200:
                    dados = resp.json()
                    estado_atual = dados.get("estado")
                    transportadora = dados.get("transportadora")

                    if estado_anterior is None:
                        estado_anterior = estado_atual
                        print(f"[{agora_str}] Pedido #{pedidos_totais:02d} ({latencia_http}ms) -> Estado Inicial: '{estado_atual}'")
                    elif estado_atual == estado_anterior:
                        pedidos_sem_alteracao += 1
                        print(f"[{agora_str}] Pedido #{pedidos_totais:02d} ({latencia_http}ms) -> Inalterado: '{estado_atual}'")
                    else:
                        print(f"[{agora_str}] Mudança detetada: '{estado_anterior}' -> '{estado_atual}'")
                        if transportadora:
                            print(f"Transportadora: {transportadora}")
                        estado_anterior = estado_atual

                        if estado_atual == "expedida":
                            break
                else:
                    print(f"[{agora_str}] Pedido #{pedidos_totais:02d} -> HTTP {resp.status_code}")

            except requests.exceptions.RequestException as e:
                print(f"[{agora_str}] Pedido #{pedidos_totais:02d} -> Erro: {e}")

            time.sleep(intervalo)

    except KeyboardInterrupt:
        pass

    duracao_total = round(time.time() - momento_inicio, 1)
    percentagem_desperdicio = round((pedidos_sem_alteracao / pedidos_totais * 100), 1) if pedidos_totais > 0 else 0

    print("\nResumo:")
    print(f"Duração: {duracao_total}s")
    print(f"Pedidos efetuados: {pedidos_totais}")
    print(f"Pedidos sem alteração: {pedidos_sem_alteracao} ({percentagem_desperdicio}%)")


if __name__ == "__main__":
    main()
