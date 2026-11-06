# Student Club Discounts MVP

Plataforma de descuentos para estudiantes: publicación de ofertas, mapa de sedes, perfiles sociales y notificaciones por Telegram.

```
product/
├── backend/          API REST (FastAPI + SQLAlchemy + SQLite)
│   ├── app/          Código de la API
│   ├── bot/          Componente bot_ofertas (scraping de ofertas + Telegram)
│   ├── tests/        Pruebas (pytest)
│   └── main.py       Punto de entrada
└── frontend/         SPA (React 18 + TypeScript + Vite)
```

## Requisitos previos

| Herramienta | Versión recomendada |
|-------------|---------------------|
| Python      | 3.11 o superior (probado con 3.13) |
| Node.js     | 18 o superior (probado con 22) |
| npm         | Viene con Node.js |
| Git         | Cualquier versión reciente |

Opcional: un bot de Telegram creado con [@BotFather](https://t.me/BotFather), si quieres probar la vinculación y las notificaciones.

---

## Backend (FastAPI)

> **Importante:** ejecuta todos los comandos del backend desde `product/backend`. La base de datos (`app.db`) y la carpeta de imágenes (`backend/uploads`) usan rutas relativas al directorio actual.

### 1. Crear y activar el entorno virtual

Desde la raíz del repositorio:

**Windows (PowerShell)**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Linux / macOS**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Instalar dependencias

```bash
cd product/backend
pip install -r requirements.txt -r bot/requirements.txt
pip install pytest httpx   # solo si vas a correr las pruebas
```

### 3. Crear la carpeta de imágenes subidas

Si la carpeta no existe, la API falla al arrancar:

```powershell
# Windows
New-Item -ItemType Directory -Force backend/uploads
```
```bash
# Linux / macOS
mkdir -p backend/uploads
```

### 4. Variables de entorno (opcionales)

| Variable             | Para qué sirve                                        | Valor por defecto           |
|----------------------|-------------------------------------------------------|-----------------------------|
| `JWT_SECRET_KEY`     | Clave para firmar los tokens JWT                      | `DEV_SECRET_KEY_CHANGE_ME`  |
| `FRONTEND_URL`       | URL del frontend usada en los enlaces de notificaciones | `http://localhost:5173`   |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram (vinculación y notificaciones) | *(sin valor: Telegram queda deshabilitado)* |

**Windows (PowerShell)**
```powershell
$env:JWT_SECRET_KEY = "una-clave-secreta"
$env:TELEGRAM_BOT_TOKEN = "token-de-BotFather"
```

**Linux / macOS**
```bash
export JWT_SECRET_KEY="una-clave-secreta"
export TELEGRAM_BOT_TOKEN="token-de-BotFather"
```

> Sin `TELEGRAM_BOT_TOKEN` la API funciona igual, pero `GET /api/v1/telegram/estado` responde `503`.

### 5. Ejecutar la API

```bash
uvicorn main:app --reload --port 8000
```
o bien:
```bash
python main.py
```

- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/api/v1/health

La base de datos SQLite (`app.db`) y sus migraciones se crean solas al arrancar.

### 6. Pruebas del backend

```bash
python -m pytest tests -q
```

Pruebas del bot (no necesitan red):
```bash
cd bot
python -m pytest tests -q
```

---

## Frontend (React + Vite)

### 1. Instalar dependencias

```bash
cd product/frontend
npm install
```

### 2. Ejecutar en modo desarrollo

```bash
npm run dev
```

- App: http://localhost:5173

Vite redirige las peticiones a `/api` hacia `http://localhost:8000`, así que **el backend tiene que estar corriendo** para que la app funcione.

### 3. Otros comandos

| Comando           | Descripción                               |
|-------------------|-------------------------------------------|
| `npm run build`   | Compila TypeScript y genera `dist/`       |
| `npm run preview` | Sirve localmente la versión compilada     |
| `npm test`        | Ejecuta las pruebas con Vitest            |

---

## Inicio rápido (dos terminales)

**Terminal 1: backend**
```powershell
.\.venv\Scripts\Activate.ps1
cd product/backend
uvicorn main:app --reload --port 8000
```

**Terminal 2: frontend**
```powershell
cd product/frontend
npm run dev
```

Luego abre http://localhost:5173.

---

## Bot de ofertas (opcional, CLI)

El componente `bot_ofertas` también se puede usar por consola. Desde `product/backend/bot`:

```bash
python -m bot_ofertas verificar                         # prueba cada tienda activa
python -m bot_ofertas recolectar --exportar ofertas.json
python -m bot_ofertas listar
python -m bot_ofertas telegram-verificar                # requiere TELEGRAM_BOT_TOKEN
```

Más detalles en [product/backend/bot/README.md](product/backend/bot/README.md) y en el contrato de la API: [product/backend/CONTRATO_API.md](product/backend/CONTRATO_API.md).
