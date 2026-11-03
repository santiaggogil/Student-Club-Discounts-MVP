# Contrato API - Student Club Discounts

## Registro de Usuario (HU-01)

### POST /api/v1/auth/register
- **Descripción**: Registra un nuevo usuario.
- **Auth**: Ninguna.
- **Entrada (JSON)**:
  - `email` (string, opcional, formato email)
  - `username` (string, opcional)
  - `password` (string, obligatorio, min 10 chars, mayúsculas, minúsculas, números)
- **Salida (201)**: `{"message": "Usuario creado exitosamente"}`
- **Errores**:
  - 422: Error de validación de campos.
  - 400: Usuario o correo ya registrado.

## Autenticación (HU-02)

### POST /api/v1/auth/login
- **Descripción**: Inicia sesión y devuelve un token JWT.
- **Auth**: Ninguna.
- **Entrada (JSON)**:
  - `identifier` (string, obligatorio: email o username)
  - `password` (string, obligatorio)
- **Salida (200)**: `{"access_token": "...", "token_type": "bearer"}`
- **Errores**:
  - 401: Credenciales incorrectas.

### POST /api/v1/auth/logout
- **Descripción**: Cierra la sesión actual.
- **Auth**: Requerida (JWT).
- **Salida (200)**: `{"message": "Sesión cerrada"}`

## Gestión de Perfil y Social (HU-03, HU-13)

### GET /api/v1/usuarios/me
- **Descripción**: Consulta los datos del perfil del usuario autenticado.
- **Auth**: Requerida (JWT).
- **Salida (200)**: Datos del perfil (sin contraseña ni su hash) incluyendo `seguidores_count`, `seguidos_count`, `seguidores`, `seguidos` y `lo_sigo` (false).
- **Errores**:
  - 401: No autenticado.

### PUT /api/v1/usuarios/me
- **Descripción**: Actualiza los datos del perfil del usuario autenticado (nombre, biografía, foto, privacidad de seguidores).
- **Auth**: Requerida (JWT).
- **Entrada (Multipart Form Data / Form)**:
  - `nombre` (string, opcional)
  - `biografia` (string, opcional, sanitizada a texto plano)
  - `seguidores_privados` (boolean, opcional)
  - `foto` (UploadFile, opcional)
- **Salida (200)**: Datos actualizados del perfil.
- **Errores**:
  - 401: No autenticado.
  - 422: Error de validación o formato de imagen inválido.

### GET /api/v1/usuarios/{id}
- **Descripción**: Obtiene el perfil público de un usuario, sus ofertas publicadas y relaciones de seguimiento (seguidores, seguidos, lo_sigo). Oculta lista de seguidores si está configurada como privada.
- **Auth**: Opcional / Requerida.
- **Salida (200)**: Perfil público, ofertas y datos de seguimiento.
- **Errores**:
  - 404: Usuario no encontrado.

### POST /api/v1/usuarios/{id}/seguir
- **Descripción**: Sigue a un usuario. (HU-13)
- **Auth**: Requerida (JWT).
- **Salida (200)**: `{"message": "Ahora sigues a este usuario"}`
- **Errores**:
  - 400: No puedes seguirte a ti mismo.
  - 401: No autenticado.
  - 404: Usuario no encontrado.
  - 409: Ya sigues a este usuario.

### DELETE /api/v1/usuarios/{id}/seguir
- **Descripción**: Deja de seguir a un usuario. (HU-13)
- **Auth**: Requerida (JWT).
- **Salida (200)**: `{"message": "Has dejado de seguir a este usuario"}`
- **Errores**:
  - 400: No puedes dejar de seguirte a ti mismo.
  - 401: No autenticado.
  - 404: Usuario no encontrado.

## Ofertas Comunitarias (HU-05, HU-06, HU-08, HU-09, HU-12)

### POST /api/v1/ofertas
- **Descripción**: Publica una nueva oferta comunitaria. Rechaza vigencias pasadas.
- **Auth**: Requerida (JWT).
- **Entrada (Multipart Form Data)**:
  - `foto`, `precio`, `ubicacion`, `vigencia` (ISO), `titulo`, `descripcion`
- **Salida (201)**: `{"id": 1, ..., "autor_username": "cazador"}`
- **Errores**:
  - 422: Vigencia pasada o formato inválido.

### PUT /api/v1/ofertas/{id}
- **Descripción**: Edita una oferta propia. Rechaza vigencias pasadas. (HU-08)
- **Auth**: Requerida (JWT).
- **Entrada (Multipart Form Data)**:
  - `foto` (opcional), `precio`, `ubicacion`, `vigencia`, `titulo`, `descripcion`
- **Salida (200)**: Oferta actualizada.
- **Errores**:
  - 403: No es el autor.
  - 404: No encontrada.
  - 422: Vigencia pasada.

### DELETE /api/v1/ofertas/{id}
- **Descripción**: Elimina una oferta propia. (HU-08)
- **Auth**: Requerida (JWT).
- **Salida (200)**: `{"message": "Oferta eliminada"}`
- **Errores**:
  - 403: No es el autor.
  - 404: No encontrada.

### GET /api/v1/ofertas
- **Descripción**: Obtiene el feed de ofertas comunitarias vigentes (paginado). Excluye vencidas. Incluye `vigente` (bool) y `vence_en` (ISO).
- **Auth**: Ninguna.
- **Entrada (Query Params)**:
  - `page` (int, opcional, default 1)
  - `size` (int, opcional, default 10)
  - `orden` (string, opcional, valores: `relevancia` | `recientes`, default `relevancia`)
- **Salida (200)**: Lista de ofertas comunitarias ordenadas.

## Calificación de Ofertas (HU-11)

### POST /api/v1/ofertas/{oferta_id}/calificar
- **Descripción**: Califica una oferta (1-5 estrellas). Si ya existe, actualiza la calificación.
- **Auth**: Requerida (JWT).
- **Entrada (JSON)**:
  - `puntuacion` (int, obligatorio, 1-5)
- **Salida (200)**: `{"promedio": 4.5}`
- **Errores**:
  - 400: No se puede calificar propia oferta.
  - 401: No autenticado.
  - 404: Oferta no encontrada.
  - 422: Puntuación fuera de rango.

## Archivos Estáticos (Imágenes)

### GET /api/v1/uploads/{filename}
- **Descripción**: Sirve la imagen subida de la oferta o perfil.
- **Auth**: Ninguna.
- **Salida (200)**: Archivo de imagen.

## Mapa de Ofertas (HU-20)

### GET /api/v1/mapa/ofertas
- **Descripción**: Obtiene las sedes de tiendas de cadena en Manizales con coordenadas y sus ofertas vigentes recopiladas por el bot.
- **Auth**: Ninguna.
- **Salida (200)**: `[{"cadena": "Éxito", "nombre": "Éxito Cable Plaza", "latitud": 5.05, "longitud": -75.48, "ofertas": [...]}]`

### GET /api/v1/ofertas/mapa
- **Descripción**: Obtiene las ofertas de supermercados y sedes para el mapa interactivo.
- **Auth**: Ninguna.
- **Salida (200)**: `{"ofertas": [...], "sedes": {...}}`
- **Errores**:
  - 503: Servicio de datos no disponible.