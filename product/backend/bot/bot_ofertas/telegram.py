"""
Integración con la API de bots de Telegram (gratuita).

Modelo selectivo del producto: un usuario solo recibe alertas de las personas
que sigue. Este módulo NO decide a quién notificar (eso es regla del producto);
recibe la lista de chat_id destinatarios y entrega el mensaje respetando los
límites de Telegram (aprox. 1 mensaje/segundo por chat y 30/segundo en total).

Vinculación de cuentas (sin pedir el chat_id a mano):
1. El producto genera un código único para el usuario: generar_codigo_vinculacion().
2. El usuario abre enlace_vinculacion(bot_username, codigo) y pulsa «Iniciar».
3. El producto llama periódicamente a procesar_vinculaciones(...) (getUpdates) y
   guarda el chat_id asociado a cada código recibido.

Requiere TELEGRAM_BOT_TOKEN (se crea gratis con @BotFather). Nunca se guarda en el código.
"""

from __future__ import annotations

import json
import os
import secrets
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Callable

API = "https://api.telegram.org/bot{token}/{metodo}"


class TelegramError(Exception):
    def __init__(self, mensaje: str, codigo: int | None = None, retry_after: int | None = None):
        super().__init__(mensaje)
        self.codigo = codigo
        self.retry_after = retry_after


TransporteTG = Callable[[str, dict, float], tuple[int, dict]]


def transporte_urllib(url: str, payload: dict, timeout: float) -> tuple[int, dict]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            return exc.code, json.loads(exc.read().decode("utf-8"))
        except Exception:  # noqa: BLE001
            return exc.code, {"ok": False, "description": str(exc)}
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise TelegramError(f"No se pudo conectar con Telegram: {exc}") from exc


class ClienteTelegram:
    def __init__(self, token: str | None = None, transporte: TransporteTG = transporte_urllib, timeout_s: float = 30,
                 dormir: Callable[[float], None] = time.sleep):
        self.token = token or os.getenv("TELEGRAM_BOT_TOKEN")
        if not self.token:
            raise TelegramError("Falta TELEGRAM_BOT_TOKEN. Crea un bot gratuito con @BotFather y define la variable de entorno.")
        self.transporte = transporte
        self.timeout_s = timeout_s
        self.dormir = dormir

    def _llamar(self, metodo: str, payload: dict, timeout: float | None = None) -> object:
        status, data = self.transporte(API.format(token=self.token, metodo=metodo), payload, timeout or self.timeout_s)
        if data.get("ok"):
            return data.get("result")
        params = data.get("parameters") or {}
        raise TelegramError(data.get("description") or f"Error {status}", codigo=data.get("error_code", status),
                            retry_after=params.get("retry_after"))

    def verificar(self) -> dict:
        """getMe: comprueba que el token es válido. Devuelve los datos del bot."""
        return self._llamar("getMe", {})  # type: ignore[return-value]

    def enviar_mensaje(self, chat_id: int | str, texto: str, reintentos: int = 2) -> dict:
        payload = {"chat_id": chat_id, "text": texto[:4096], "disable_web_page_preview": True}
        for intento in range(reintentos + 1):
            try:
                return self._llamar("sendMessage", payload)  # type: ignore[return-value]
            except TelegramError as exc:
                if exc.codigo == 429 and exc.retry_after and intento < reintentos:
                    self.dormir(min(exc.retry_after, 60))
                    continue
                raise
        raise TelegramError("No se pudo enviar el mensaje")

    def obtener_actualizaciones(self, offset: int | None = None, espera_s: int = 0) -> list[dict]:
        payload: dict = {"timeout": espera_s, "allowed_updates": ["message"]}
        if offset is not None:
            payload["offset"] = offset
        return self._llamar("getUpdates", payload, timeout=self.timeout_s + espera_s)  # type: ignore[return-value]


# ------------------------------------------------------------------ vinculación


def generar_codigo_vinculacion() -> str:
    return secrets.token_urlsafe(12).replace("-", "a").replace("_", "b")[:16]


def enlace_vinculacion(bot_username: str, codigo: str) -> str:
    return f"https://t.me/{bot_username.lstrip('@')}?start={codigo}"


@dataclass
class Vinculacion:
    codigo: str
    chat_id: int
    usuario_telegram: str | None


def procesar_vinculaciones(cliente: ClienteTelegram, offset: int | None = None) -> tuple[list[Vinculacion], int | None]:
    """Lee mensajes «/start <codigo>». Devuelve las vinculaciones y el siguiente offset a usar."""
    actualizaciones = cliente.obtener_actualizaciones(offset)
    vinculos: list[Vinculacion] = []
    siguiente = offset
    for upd in actualizaciones:
        siguiente = upd["update_id"] + 1
        msg = upd.get("message") or {}
        texto = (msg.get("text") or "").strip()
        if texto.startswith("/start "):
            codigo = texto.split(maxsplit=1)[1].strip()
            chat = msg.get("chat") or {}
            if codigo and chat.get("id") is not None:
                vinculos.append(Vinculacion(codigo, int(chat["id"]), (msg.get("from") or {}).get("username")))
    return vinculos, siguiente


# ------------------------------------------------------------------ notificación selectiva


@dataclass
class ResultadoNotificacion:
    enviados: list[int | str] = field(default_factory=list)
    fallidos: list[tuple[int | str, str]] = field(default_factory=list)
    bloqueados: list[int | str] = field(default_factory=list)  # el usuario bloqueó al bot: dejar de notificarle


def formatear_publicacion(autor: str, titulo: str, descripcion: str, ubicacion: str, url: str | None = None) -> str:
    partes = [f"Nueva oferta de {autor}", "", titulo]
    if descripcion:
        partes.append(descripcion)
    if ubicacion:
        partes.append(f"Ubicación: {ubicacion}")
    if url:
        partes.append(url)
    return "\n".join(partes)


def notificar(cliente: ClienteTelegram, chat_ids: list[int | str], texto: str, pausa_s: float = 0.05) -> ResultadoNotificacion:
    """Envía el mismo texto a cada destinatario (seguidores con Telegram vinculado)."""
    res = ResultadoNotificacion()
    for chat_id in dict.fromkeys(chat_ids):  # sin duplicados, conserva el orden
        try:
            cliente.enviar_mensaje(chat_id, texto)
            res.enviados.append(chat_id)
        except TelegramError as exc:
            if exc.codigo == 403:
                res.bloqueados.append(chat_id)
            else:
                res.fallidos.append((chat_id, str(exc)))
        cliente.dormir(pausa_s)
    return res
