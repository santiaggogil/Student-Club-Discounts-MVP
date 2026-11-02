"""Contrato de datos del bot: oferta normalizada."""

from __future__ import annotations

import hashlib
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone


def ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


@dataclass
class Oferta:
    fuente: str                 # id de la fuente configurada (p. ej. "exito")
    tienda: str                 # nombre visible de la tienda
    producto: str
    precio_actual: float        # en pesos colombianos
    precio_anterior: float | None
    url: str
    imagen: str | None = None
    categoria: str | None = None
    consulta: str | None = None
    disponible: bool = True
    capturado_en: str = field(default_factory=ahora)

    @property
    def descuento_pct(self) -> float | None:
        if self.precio_anterior and self.precio_anterior > self.precio_actual > 0:
            return round((1 - self.precio_actual / self.precio_anterior) * 100, 1)
        return None

    @property
    def es_oferta(self) -> bool:
        return self.descuento_pct is not None and self.descuento_pct >= 1

    @property
    def clave(self) -> str:
        """Identificador estable de la oferta (misma tienda, producto y URL)."""
        return hashlib.sha1(f"{self.fuente}|{self.url or self.producto}".encode("utf-8")).hexdigest()[:16]

    def validar(self) -> list[str]:
        errores = []
        if not self.producto.strip():
            errores.append("producto vacío")
        if self.precio_actual <= 0:
            errores.append("precio_actual no positivo")
        if self.precio_anterior is not None and self.precio_anterior <= 0:
            errores.append("precio_anterior no positivo")
        if self.url and not self.url.startswith(("http://", "https://")):
            errores.append("url inválida")
        return errores

    def a_dict(self) -> dict:
        d = asdict(self)
        d.update({"clave": self.clave, "descuento_pct": self.descuento_pct, "es_oferta": self.es_oferta})
        return d
