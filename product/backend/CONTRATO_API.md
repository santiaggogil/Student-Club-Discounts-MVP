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

## Ofertas Comunitarias (HU-05, HU-09)

### POST /api/v1/ofertas
- **Descripción**: Publica una nueva oferta comunitaria.
- **Auth**: Requerida (JWT).
- **Entrada (Multipart Form Data)**:
  - `foto`, `precio`, `ubicacion`, `vigencia`, `titulo`, `descripcion`
- **Salida (201)**: `{"id": 1, ..., "autor_username": "cazador"}`

### GET /api/v1/ofertas
- **Descripción**: Obtiene el feed de ofertas comunitarias vigentes (paginado) incluyendo la URL codificada de imagen bajo /api/v1/uploads/, el nombre del autor, promedio de calificación y total de calificaciones.
- **Auth**: Ninguna.
- **Entrada (Query Params)**:
  - `page` (int, opcional, default 1)
  - `size` (int, opcional, default 10)
- **Salida (200)**: Lista de ofertas comunitarias.

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
- **Descripción**: Sirve la imagen subida de la oferta.
- **Auth**: Ninguna.
- **Salida (200)**: Archivo de imagen.

## Mapa de Ofertas (HU-20)

### GET /api/v1/ofertas/mapa
- **Descripción**: Obtiene las ofertas de supermercados y sedes para el mapa interactivo.
- **Auth**: Ninguna.
- **Salida (200)**: `{"ofertas": [...], "sedes": {...}}`
- **Errores**:
  - 503: Servicio de datos no disponible.
