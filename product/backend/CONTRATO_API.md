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
- **Salida (201)**: `{"id": 1, ...}`

### GET /api/v1/ofertas
- **Descripción**: Obtiene el feed de ofertas comunitarias vigentes (paginado).
- **Auth**: Ninguna.
- **Entrada (Query Params)**:
  - `page` (int, opcional, default 1)
  - `size` (int, opcional, default 10)
- **Salida (200)**: Lista de ofertas comunitarias.
