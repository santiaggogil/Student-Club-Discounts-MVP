"""Persistencia de ofertas recolectadas (SQLite, patrón Repository)."""

from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from .modelo import Oferta, ahora

ESQUEMA = """
CREATE TABLE IF NOT EXISTS ofertas_bot (
    clave TEXT PRIMARY KEY, fuente TEXT NOT NULL, tienda TEXT NOT NULL, producto TEXT NOT NULL,
    precio_actual REAL NOT NULL, precio_anterior REAL, descuento_pct REAL, url TEXT, imagen TEXT,
    categoria TEXT, consulta TEXT, disponible INTEGER NOT NULL, vigente INTEGER NOT NULL DEFAULT 1,
    primera_vez TEXT NOT NULL, ultima_vez TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ejecuciones_bot (
    id INTEGER PRIMARY KEY AUTOINCREMENT, fuente TEXT NOT NULL, inicio TEXT NOT NULL, fin TEXT,
    estado TEXT NOT NULL, error TEXT, productos INTEGER DEFAULT 0, ofertas INTEGER DEFAULT 0, nuevas INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_ofertas_vigentes ON ofertas_bot(vigente, descuento_pct);
"""


class RepositorioOfertas:
    def __init__(self, ruta: str | Path):
        self.ruta = Path(ruta)
        self.ruta.parent.mkdir(parents=True, exist_ok=True)
        with self._con() as con:
            con.executescript(ESQUEMA)

    @contextmanager
    def _con(self) -> Iterator[sqlite3.Connection]:
        con = sqlite3.connect(self.ruta)
        con.row_factory = sqlite3.Row
        try:
            yield con
            con.commit()
        finally:
            con.close()

    def iniciar_ejecucion(self, fuente: str) -> int:
        with self._con() as con:
            cur = con.execute("INSERT INTO ejecuciones_bot (fuente, inicio, estado) VALUES (?, ?, 'en_curso')", (fuente, ahora()))
            return int(cur.lastrowid)

    def cerrar_ejecucion(self, eid: int, estado: str, error: str | None = None, productos: int = 0, ofertas: int = 0, nuevas: int = 0):
        with self._con() as con:
            con.execute("UPDATE ejecuciones_bot SET fin = ?, estado = ?, error = ?, productos = ?, ofertas = ?, nuevas = ? WHERE id = ?",
                        (ahora(), estado, error, productos, ofertas, nuevas, eid))

    def guardar(self, fuente: str, ofertas: list[Oferta]) -> list[Oferta]:
        """Guarda las ofertas de una fuente; las que ya no aparecen quedan como no vigentes. Devuelve las nuevas."""
        nuevas: list[Oferta] = []
        ts = ahora()
        with self._con() as con:
            existentes = {r["clave"] for r in con.execute("SELECT clave FROM ofertas_bot WHERE fuente = ?", (fuente,))}
            vistas = set()
            for o in ofertas:
                vistas.add(o.clave)
                valores = (o.tienda, o.producto, o.precio_actual, o.precio_anterior, o.descuento_pct, o.url, o.imagen,
                           o.categoria, o.consulta, int(o.disponible))
                if o.clave in existentes:
                    con.execute("UPDATE ofertas_bot SET tienda=?, producto=?, precio_actual=?, precio_anterior=?, descuento_pct=?, "
                                "url=?, imagen=?, categoria=?, consulta=?, disponible=?, vigente=1, ultima_vez=? WHERE clave=?",
                                (*valores, ts, o.clave))
                else:
                    con.execute("INSERT INTO ofertas_bot (clave, fuente, tienda, producto, precio_actual, precio_anterior, descuento_pct, "
                                "url, imagen, categoria, consulta, disponible, vigente, primera_vez, ultima_vez) "
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)", (o.clave, fuente, *valores, ts, ts))
                    nuevas.append(o)
            no_vistas = existentes - vistas
            if no_vistas:
                con.executemany("UPDATE ofertas_bot SET vigente = 0 WHERE clave = ?", [(c,) for c in no_vistas])
        return nuevas

    def ofertas_vigentes(self, tienda: str | None = None, min_descuento: float = 1.0, limite: int = 500) -> list[dict]:
        sql = "SELECT * FROM ofertas_bot WHERE vigente = 1 AND descuento_pct >= ?"
        params: list = [min_descuento]
        if tienda:
            sql += " AND fuente = ?"
            params.append(tienda)
        sql += " ORDER BY descuento_pct DESC LIMIT ?"
        params.append(limite)
        with self._con() as con:
            return [dict(r) for r in con.execute(sql, params)]

    def ejecuciones(self, limite: int = 50) -> list[dict]:
        with self._con() as con:
            return [dict(r) for r in con.execute("SELECT * FROM ejecuciones_bot ORDER BY id DESC LIMIT ?", (limite,))]

    def exportar_json(self, ruta: str | Path) -> int:
        datos = self.ofertas_vigentes()
        Path(ruta).write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
        return len(datos)
