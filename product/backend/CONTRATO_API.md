# Contrato API - Student Club Discounts

## Ofertas
- GET /api/v1/ofertas: Lista ofertas (opcional: q, page, size, orden). Devuelve 'mi_calificacion' y 'autor_foto'.
- GET /api/v1/ofertas/{id}: Detalle de oferta para edición. Devuelve 'autor_foto'.
- POST /api/v1/ofertas: Publicar oferta (multipart).
- PUT /api/v1/ofertas/{id}: Editar oferta (multipart).
- DELETE /api/v1/ofertas/{id}: Eliminar oferta.
- POST /api/v1/ofertas/{id}/calificar: Calificar oferta. Devuelve {promedio, promedio_calificacion, total_calificaciones, mi_calificacion}.

## Usuarios
- GET /api/v1/usuarios/me: Perfil propio con 'ofertas_publicadas' (incluye 'autor_foto').
- PUT /api/v1/usuarios/me: Actualizar perfil y foto (multipart).
- GET /api/v1/usuarios/{id}: Perfil público con 'ofertas_publicadas' (incluye 'autor_foto').