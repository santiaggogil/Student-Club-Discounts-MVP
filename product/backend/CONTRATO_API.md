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
