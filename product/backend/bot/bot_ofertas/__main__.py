"""
Línea de comandos del bot.

    python -m bot_ofertas verificar                 # prueba cada fuente activa con una consulta
    python -m bot_ofertas recolectar [--fuente exito] [--exportar ofertas.json]
    python -m bot_ofertas listar
    python -m bot_ofertas telegram-verificar        # comprueba TELEGRAM_BOT_TOKEN
    python -m bot_ofertas telegram-vinculaciones    # muestra los /start <codigo> recibidos
    python -m bot_ofertas telegram-probar <chat_id> # envía un mensaje de prueba
"""

from __future__ import annotations

import argparse
import os
import sys

from .fuentes import crear_adaptador
from .http import ClienteHTTP, FuenteError
from .recolector import cargar_fuentes, recolectar
from .repositorio import RepositorioOfertas
from .telegram import ClienteTelegram, TelegramError, procesar_vinculaciones


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="bot_ofertas", description="Bot de recolección de ofertas y notificaciones Telegram")
    ap.add_argument("--db", default=os.getenv("BOT_OFERTAS_DB", "ofertas_bot.db"))
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("verificar")
    r = sub.add_parser("recolectar")
    r.add_argument("--fuente")
    r.add_argument("--exportar")
    sub.add_parser("listar")
    sub.add_parser("telegram-verificar")
    sub.add_parser("telegram-vinculaciones")
    t = sub.add_parser("telegram-probar")
    t.add_argument("chat_id")
    args = ap.parse_args(argv)

    if args.cmd == "verificar":
        cliente = ClienteHTTP(espera_s=1)
        ok = True
        for cfg in cargar_fuentes():
            if not cfg.activo:
                print(f"- {cfg.id}: omitida ({cfg.notas or 'desactivada'})")
                continue
            try:
                ad = crear_adaptador(cfg)
                if cfg.tipo == "vtex":
                    cfg.consultas = cfg.consultas[:1]
                productos = ad.recolectar(cliente)
                ofertas = [p for p in productos if p.es_oferta]
                print(f"- {cfg.id}: OK — {len(productos)} productos, {len(ofertas)} con descuento")
            except FuenteError as exc:
                ok = False
                print(f"- {cfg.id}: ERROR — {exc}")
        return 0 if ok else 1

    if args.cmd == "recolectar":
        repo = RepositorioOfertas(args.db)
        resultados = recolectar(repo, ClienteHTTP(), cargar_fuentes(), args.fuente)
        for res in resultados:
            detalle = f"{res.productos} productos, {res.ofertas} ofertas, {len(res.nuevas)} nuevas" if res.estado == "ok" else res.error
            print(f"- {res.fuente}: {res.estado} — {detalle}")
        if args.exportar:
            print(f"Exportadas {repo.exportar_json(args.exportar)} ofertas vigentes a {args.exportar}")
        return 0 if any(r.estado == "ok" for r in resultados) else 1

    if args.cmd == "listar":
        for o in RepositorioOfertas(args.db).ofertas_vigentes(limite=50):
            print(f"{o['descuento_pct']:>5.1f}%  {o['tienda']:<12} {o['producto'][:60]:<60} ${o['precio_actual']:,.0f}")
        return 0

    try:
        cliente_tg = ClienteTelegram()
        if args.cmd == "telegram-verificar":
            bot = cliente_tg.verificar()
            print(f"Token válido. Bot: @{bot.get('username')}")
        elif args.cmd == "telegram-vinculaciones":
            vinculos, siguiente = procesar_vinculaciones(cliente_tg)
            for v in vinculos:
                print(f"código {v.codigo} → chat_id {v.chat_id} (@{v.usuario_telegram})")
            print(f"{len(vinculos)} vinculación(es). Siguiente offset: {siguiente}")
        elif args.cmd == "telegram-probar":
            cliente_tg.enviar_mensaje(args.chat_id, "Mensaje de prueba de Student Club Discounts.")
            print("Mensaje enviado.")
        return 0
    except TelegramError as exc:
        print(f"Error de Telegram: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
