# Bot de ofertas y notificaciones Telegram (componente existente)

Componente desarrollado por separado e integrado en el producto Student Club Discounts. Los agentes de Arquitectura, Planning y Coding deben **usarlo mediante esta interfaz pública** y no reescribirlo.

## Ubicación y dependencias

- Paquete Python `bot_ofertas` (se copia al producto en la ruta elegida al integrarlo, por ejemplo `backend/bot/bot_ofertas`).
- Dependencia de terceros: `beautifulsoup4>=4.12` (solo para fuentes HTML). Todo lo demás es biblioteca estándar.
- Configuración: `fuentes.json` (tiendas y consultas) y `sedes.json` (sedes físicas en Manizales para el mapa) junto al paquete.
- Variables de entorno: `TELEGRAM_BOT_TOKEN` (obligatoria para notificar; se obtiene gratis con @BotFather), `BOT_OFERTAS_DB` (ruta de la base SQLite del bot, opcional).

## Recolección de ofertas (Web Scraping)

```python
from bot_ofertas import ClienteHTTP, RepositorioOfertas, cargar_fuentes, cargar_sedes, recolectar

repo = RepositorioOfertas("datos/ofertas_bot.db")
resultados = recolectar(repo, ClienteHTTP(), cargar_fuentes())   # una entrada por fuente: estado ok | error | omitida
ofertas = repo.ofertas_vigentes(tienda=None, min_descuento=1.0)  # lista de dict ordenada por descuento
sedes = cargar_sedes()["sedes"]                                  # {fuente: [{nombre, direccion, lat, lon}]}
```

Cada oferta vigente es un diccionario con: `clave` (id estable), `fuente`, `tienda`, `producto`, `precio_actual`, `precio_anterior`, `descuento_pct`, `url`, `imagen`, `categoria`, `consulta`, `disponible`, `vigente`, `primera_vez`, `ultima_vez`.

Comportamiento garantizado:
- Solo se guardan productos con precio anterior mayor al actual (descuento ≥ 1 %).
- Una oferta que deja de aparecer en la siguiente recolección queda `vigente = 0`.
- El fallo de una tienda no detiene a las demás; cada ejecución queda registrada (`repo.ejecuciones()`).
- Respeta `robots.txt`, se identifica con un User-Agent propio y espera entre solicitudes al mismo dominio.
- La recolección es periódica: el producto decide la frecuencia (tarea programada o comando `python -m bot_ofertas recolectar`).

## Notificaciones selectivas por Telegram

```python
from bot_ofertas import (ClienteTelegram, generar_codigo_vinculacion, enlace_vinculacion,
                         procesar_vinculaciones, formatear_publicacion, notificar)

tg = ClienteTelegram()                       # lee TELEGRAM_BOT_TOKEN
codigo = generar_codigo_vinculacion()        # guardar asociado al usuario del producto
url = enlace_vinculacion("NombreDelBot", codigo)   # mostrar al usuario para que pulse «Iniciar»
vinculos, offset = procesar_vinculaciones(tg, offset)   # [(codigo, chat_id, usuario_telegram)]
texto = formatear_publicacion(autor, titulo, descripcion, ubicacion, url_publicacion)
resultado = notificar(tg, chat_ids_de_los_seguidores, texto)
# resultado.enviados, resultado.fallidos [(chat_id, motivo)], resultado.bloqueados (dejar de notificarles)
```

Reglas de responsabilidad:
- El **producto** decide a quién notificar (solo seguidores del autor con Telegram vinculado). El bot solo entrega.
- `notificar` elimina destinatarios duplicados, reintenta ante límite de frecuencia (429) y separa los chats que bloquearon al bot (403).
- Sin `TELEGRAM_BOT_TOKEN`, `ClienteTelegram()` lanza `TelegramError` con un mensaje explícito; el producto debe manejarlo (por ejemplo, publicar igual y registrar que la notificación no se envió).

## Limitaciones conocidas

- Las fuentes VTEX (Éxito, Carulla, Olímpica, Jumbo) usan el buscador público de catálogo; deben comprobarse en vivo con `python -m bot_ofertas verificar` porque los sitios pueden cambiar o bloquear consultas automatizadas.
- La fuente D1 está desactivada hasta configurar páginas y selectores HTML reales.
- `sedes.json` no trae coordenadas: deben completarse con datos verificados para que el mapa ubique las ofertas.
