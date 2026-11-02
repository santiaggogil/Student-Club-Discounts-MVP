"""Coordina la recolección de todas las fuentes activas, aislando los fallos de cada una."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from .fuentes import ConfigFuente, crear_adaptador
from .http import ClienteHTTP, FuenteError
from .modelo import Oferta
from .repositorio import RepositorioOfertas

CONFIG_DIR = Path(__file__).resolve().parent.parent


def cargar_fuentes(ruta: Path | None = None) -> list[ConfigFuente]:
    ruta = ruta or CONFIG_DIR / "fuentes.json"
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    return [ConfigFuente.desde_dict(d) for d in datos["fuentes"]]


def cargar_sedes(ruta: Path | None = None) -> dict:
    ruta = ruta or CONFIG_DIR / "sedes.json"
    return json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else {}


@dataclass
class ResultadoFuente:
    fuente: str
    estado: str  # ok | error | omitida
    productos: int = 0
    ofertas: int = 0
    nuevas: list[Oferta] = field(default_factory=list)
    error: str | None = None
    invalidas: int = 0


def recolectar(repo: RepositorioOfertas, cliente: ClienteHTTP, fuentes: list[ConfigFuente],
               solo: str | None = None) -> list[ResultadoFuente]:
    resultados = []
    for cfg in fuentes:
        if solo and cfg.id != solo:
            continue
        if not cfg.activo:
            resultados.append(ResultadoFuente(cfg.id, "omitida", error=cfg.notas or "Fuente desactivada en fuentes.json"))
            continue
        eid = repo.iniciar_ejecucion(cfg.id)
        try:
            productos = crear_adaptador(cfg).recolectar(cliente)
            validos = [p for p in productos if not p.validar()]
            ofertas = [p for p in validos if p.es_oferta]
            nuevas = repo.guardar(cfg.id, ofertas)
            repo.cerrar_ejecucion(eid, "ok", productos=len(productos), ofertas=len(ofertas), nuevas=len(nuevas))
            resultados.append(ResultadoFuente(cfg.id, "ok", len(productos), len(ofertas), nuevas,
                                              invalidas=len(productos) - len(validos)))
        except FuenteError as exc:
            repo.cerrar_ejecucion(eid, "error", str(exc))
            resultados.append(ResultadoFuente(cfg.id, "error", error=str(exc)))
    return resultados
