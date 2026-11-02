"""Bot de recolección de ofertas de supermercados y notificaciones por Telegram (Student Club Discounts)."""

from .fuentes import ConfigFuente, HtmlAdapter, VtexAdapter, crear_adaptador  # noqa: F401
from .http import ClienteHTTP, FuenteError  # noqa: F401
from .modelo import Oferta  # noqa: F401
from .recolector import cargar_fuentes, cargar_sedes, recolectar  # noqa: F401
from .repositorio import RepositorioOfertas  # noqa: F401
from .telegram import (  # noqa: F401
    ClienteTelegram,
    TelegramError,
    enlace_vinculacion,
    formatear_publicacion,
    generar_codigo_vinculacion,
    notificar,
    procesar_vinculaciones,
)
