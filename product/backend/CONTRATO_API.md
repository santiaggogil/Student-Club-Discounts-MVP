# Contrato API - Student Club Discounts

## Ofertas
- GET /api/v1/ofertas: Lista ofertas (opcional: q, page, size, orden). Devuelve 'mi_calificacion' y 'autor_foto'.
- GET /api/v1/ofertas/{id}: Detalle de oferta para edición. Devuelve 'autor_foto'.
- POST /api/v1/ofertas: Publicar oferta (multipart). Notificación asíncrona por Telegram a seguidores vinculados (HU-24).
- PUT /api/v1/ofertas/{id}: Editar oferta (multipart).
- DELETE /api/v1/ofertas/{id}: Eliminar oferta.
- POST /api/v1/ofertas/{id}/calificar: Calificar oferta. Devuelve {promedio, promedio_calificacion, total_calificaciones, mi_calificacion}.

## Usuarios
- GET /api/v1/usuarios/me: Perfil propio con 'ofertas_publicadas' (incluye 'autor_foto').
- PUT /api/v1/usuarios/me: Actualizar perfil y foto (multipart).
- GET /api/v1/usuarios/{id}: Perfil público con 'ofertas_publicadas' (incluye 'autor_foto').

## Telegram (HU-23 / HU-24)
- POST /api/v1/telegram/vincular: Genera código de vinculación. Devuelve {enlace}.
- GET /api/v1/telegram/estado: Verifica estado de vinculación. Devuelve {vinculado, usuario_telegram}.
- DELETE /api/v1/telegram/vincular: Desvincula la cuenta.
- Notificaciones automáticas por Telegram (HU-24): Al publicar una oferta (POST /api/v1/ofertas), de forma asíncrona (BackgroundTasks) se notifica a los seguidores vinculados del autor. Si falta TELEGRAM_BOT_TOKEN o falla Telegram, la publicación concluye con éxito. Si un usuario bloqueó al bot, se elimina su vinculación automáticamente.
