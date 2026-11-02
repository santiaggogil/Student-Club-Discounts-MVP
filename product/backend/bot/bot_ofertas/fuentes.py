"""
Adaptadores de fuentes (patrón Adapter: cada sitio expone sus datos de forma
distinta y se traduce a la Oferta normalizada).

- VtexAdapter: tiendas sobre la plataforma VTEX, que publican un buscador de
  catálogo en JSON (/api/catalog_system/pub/products/search). Precio de lista
  (ListPrice) mayor que el precio de venta (Price) indica descuento.
- HtmlAdapter: páginas de promociones en HTML, con selectores CSS definidos en
  la configuración de la fuente (fuentes.json).

Agregar una tienda = agregar una entrada en fuentes.json (y un adaptador solo
si usa un formato nuevo).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Protocol
from urllib.parse import quote, urljoin

from .http import ClienteHTTP, FuenteError
from .modelo import Oferta


@dataclass
class ConfigFuente:
    id: str
    tienda: str
    tipo: str
    url_base: str
    activo: bool = True
    consultas: list[str] = field(default_factory=list)
    max_resultados: int = 50
    selectores: dict[str, str] = field(default_factory=dict)
    paginas: list[str] = field(default_factory=list)
    notas: str = ""

    @classmethod
    def desde_dict(cls, d: dict) -> "ConfigFuente":
        campos = {k: d[k] for k in cls.__dataclass_fields__ if k in d}
        return cls(**campos)


class Adaptador(Protocol):
    def recolectar(self, cliente: ClienteHTTP) -> list[Oferta]: ...


def _num(valor: Any) -> float | None:
    if valor is None:
        return None
    if isinstance(valor, (int, float)):
        return float(valor)
    texto = re.sub(r"[^\d,\.]", "", str(valor))
    if not texto:
        return None
    # Formato colombiano: 12.900 o 12.900,50
    if "," in texto and "." in texto:
        texto = texto.replace(".", "").replace(",", ".")
    elif "." in texto and len(texto.split(".")[-1]) == 3:
        texto = texto.replace(".", "")
    elif "," in texto:
        texto = texto.replace(",", ".") if len(texto.split(",")[-1]) != 3 else texto.replace(",", "")
    try:
        return float(texto)
    except ValueError:
        return None


class VtexAdapter:
    RUTA = "/api/catalog_system/pub/products/search?ft={q}&_from=0&_to={to}"

    def __init__(self, config: ConfigFuente):
        self.config = config

    def url_consulta(self, consulta: str) -> str:
        to = max(0, min(self.config.max_resultados, 50) - 1)
        return self.config.url_base.rstrip("/") + self.RUTA.format(q=quote(consulta), to=to)

    def parsear(self, datos: Any, consulta: str | None = None) -> list[Oferta]:
        if not isinstance(datos, list):
            raise FuenteError(f"{self.config.tienda}: formato inesperado (se esperaba una lista de productos).")
        ofertas = []
        for prod in datos:
            try:
                item = (prod.get("items") or [{}])[0]
                seller = (item.get("sellers") or [{}])[0]
                oferta = seller.get("commertialOffer") or {}
                precio = _num(oferta.get("Price"))
                lista = _num(oferta.get("ListPrice"))
                if not precio:
                    continue
                imagen = ((item.get("images") or [{}])[0]).get("imageUrl")
                cats = prod.get("categories") or []
                link = prod.get("link") or ""
                ofertas.append(Oferta(
                    fuente=self.config.id, tienda=self.config.tienda, producto=str(prod.get("productName", "")).strip(),
                    precio_actual=precio, precio_anterior=lista if lista and lista > precio else None,
                    url=link if link.startswith("http") else urljoin(self.config.url_base, link),
                    imagen=imagen, categoria=cats[0].strip("/").split("/")[-1] if cats else None, consulta=consulta,
                    disponible=(oferta.get("AvailableQuantity") or 0) > 0 or oferta.get("IsAvailable", False)))
            except (AttributeError, IndexError, TypeError):
                continue
        return ofertas

    def recolectar(self, cliente: ClienteHTTP) -> list[Oferta]:
        resultado: list[Oferta] = []
        for consulta in self.config.consultas:
            resultado += self.parsear(cliente.get_json(self.url_consulta(consulta)), consulta)
        return resultado


class HtmlAdapter:
    """Selectores requeridos en config.selectores: item, nombre, precio. Opcionales: precio_anterior, enlace, imagen."""

    def __init__(self, config: ConfigFuente):
        self.config = config
        faltan = [k for k in ("item", "nombre", "precio") if not config.selectores.get(k)]
        if faltan:
            raise FuenteError(f"{config.tienda}: faltan selectores HTML ({', '.join(faltan)}) en fuentes.json")

    def parsear(self, html: str, url_pagina: str) -> list[Oferta]:
        from bs4 import BeautifulSoup
        s = self.config.selectores
        soup = BeautifulSoup(html, "html.parser")
        ofertas = []
        for nodo in soup.select(s["item"]):
            nombre = nodo.select_one(s["nombre"])
            precio = nodo.select_one(s["precio"])
            if not nombre or not precio:
                continue
            anterior = nodo.select_one(s["precio_anterior"]) if s.get("precio_anterior") else None
            enlace = nodo.select_one(s["enlace"]) if s.get("enlace") else None
            imagen = nodo.select_one(s["imagen"]) if s.get("imagen") else None
            p_actual = _num(precio.get_text())
            if not p_actual:
                continue
            p_ant = _num(anterior.get_text()) if anterior else None
            href = enlace.get("href") if enlace else None
            ofertas.append(Oferta(
                fuente=self.config.id, tienda=self.config.tienda, producto=nombre.get_text(" ", strip=True),
                precio_actual=p_actual, precio_anterior=p_ant if p_ant and p_ant > p_actual else None,
                url=urljoin(url_pagina, href) if href else url_pagina,
                imagen=urljoin(url_pagina, imagen.get("src")) if imagen and imagen.get("src") else None))
        return ofertas

    def recolectar(self, cliente: ClienteHTTP) -> list[Oferta]:
        resultado: list[Oferta] = []
        for pagina in self.config.paginas:
            url = urljoin(self.config.url_base, pagina)
            resultado += self.parsear(cliente.get(url), url)
        return resultado


ADAPTADORES = {"vtex": VtexAdapter, "html": HtmlAdapter}


def crear_adaptador(config: ConfigFuente) -> Adaptador:
    if config.tipo not in ADAPTADORES:
        raise FuenteError(f"Tipo de fuente desconocido: {config.tipo}")
    return ADAPTADORES[config.tipo](config)
