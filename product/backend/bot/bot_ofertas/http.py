"""
Cliente HTTP responsable para la recolección.

- Se identifica con un User-Agent propio (configurable).
- Respeta robots.txt de cada sitio (si robots.txt prohíbe la ruta, no se consulta).
- Espera entre solicitudes al mismo dominio y usa tiempo límite.
- El transporte es inyectable para pruebas (sin red).
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
import urllib.robotparser
from typing import Callable
from urllib.parse import urlsplit

USER_AGENT = "StudentClubDiscountsBot/1.0 (+proyecto académico; contacto en el repositorio)"


class FuenteError(Exception):
    """Error al consultar una fuente (red, bloqueo, robots.txt, formato)."""


Transporte = Callable[[str, dict, float], tuple[int, str]]


def transporte_urllib(url: str, headers: dict, timeout: float) -> tuple[int, str]:
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            charset = resp.headers.get_content_charset() or "utf-8"
            return resp.status, resp.read().decode(charset, errors="replace")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", errors="replace") if exc.fp else ""
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise FuenteError(f"No se pudo conectar con {urlsplit(url).netloc}: {exc}") from exc


class ClienteHTTP:
    def __init__(self, transporte: Transporte = transporte_urllib, espera_s: float = 2.0, timeout_s: float = 20.0,
                 respetar_robots: bool = True, user_agent: str = USER_AGENT, dormir: Callable[[float], None] = time.sleep):
        self.transporte = transporte
        self.espera_s = espera_s
        self.timeout_s = timeout_s
        self.respetar_robots = respetar_robots
        self.user_agent = user_agent
        self.dormir = dormir
        self._ultimo: dict[str, float] = {}
        self._robots: dict[str, urllib.robotparser.RobotFileParser | None] = {}

    def _permitido(self, url: str) -> bool:
        if not self.respetar_robots:
            return True
        parts = urlsplit(url)
        base = f"{parts.scheme}://{parts.netloc}"
        if base not in self._robots:
            parser = urllib.robotparser.RobotFileParser()
            try:
                status, text = self.transporte(base + "/robots.txt", {"User-Agent": self.user_agent}, self.timeout_s)
                if status >= 400:
                    parser.parse([])  # sin robots.txt: todo permitido
                else:
                    parser.parse(text.splitlines())
                self._robots[base] = parser
            except FuenteError:
                self._robots[base] = None
        parser = self._robots[base]
        if parser is None:
            raise FuenteError(f"No se pudo leer robots.txt de {parts.netloc}; no se consulta el sitio.")
        return parser.can_fetch(self.user_agent, url)

    def get(self, url: str, aceptar: str = "text/html,application/json") -> str:
        if not self._permitido(url):
            raise FuenteError(f"robots.txt de {urlsplit(url).netloc} no permite consultar {urlsplit(url).path}")
        dominio = urlsplit(url).netloc
        transcurrido = time.monotonic() - self._ultimo.get(dominio, 0)
        if transcurrido < self.espera_s:
            self.dormir(self.espera_s - transcurrido)
        status, text = self.transporte(url, {"User-Agent": self.user_agent, "Accept": aceptar,
                                             "Accept-Language": "es-CO,es;q=0.9"}, self.timeout_s)
        self._ultimo[dominio] = time.monotonic()
        if status == 429:
            raise FuenteError(f"{dominio} limitó las solicitudes (429). Reintenta más tarde.")
        if status >= 400:
            raise FuenteError(f"{dominio} respondió {status} para {urlsplit(url).path}")
        return text

    def get_json(self, url: str):
        text = self.get(url, "application/json")
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise FuenteError(f"La respuesta de {urlsplit(url).netloc} no es JSON (¿cambió el sitio o hay un bloqueo?)") from exc
