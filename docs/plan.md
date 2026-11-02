<!-- plan v1.0 aprobado 2026-11-02T19:32:38+00:00 · artefacto art_ea6848f869f1 · sha 503e8fec6c19 -->
# Plan de implementación

Planificación del esqueleto ejecutable del proyecto (Monolito Modular con FastAPI y React+Vite). Se establece la estructura base, configuración de seguridad, persistencia inicial y componentes UI fundamentales para habilitar el desarrollo incremental de las historias de usuario.

## Secuencia de implementación
1. **TASK-BE-001** — Configuración base del proyecto FastAPI (backend)
2. **TASK-BE-002** — Implementación de seguridad y persistencia base (backend)
3. **TASK-FE-001** — Configuración base del proyecto React+Vite (frontend)
4. **TASK-FE-002** — Componentes UI base y estados (frontend)

## Tareas
### TASK-BE-001 — Configuración base del proyecto FastAPI
**Área:** backend · **Componente:** Core Social · **Prioridad:** 1 · **Estimación:** S

Inicializar el proyecto FastAPI con estructura de paquetes, dependencias, configuración de variables de entorno y punto de entrada principal. Endpoints técnicos: GET /api/v1/health.

- **Historias de usuario:** —
- **Pantallas:** —
- **Requisitos:** RF-001, RNF-003
- **Criterios de aceptación:** —
- **Endpoints:** —
- **Depende de:** —
- **Archivos sugeridos:** backend/main.py, backend/requirements.txt, backend/app/api/health.py

**Definición de terminado**
- La aplicación arranca correctamente
- El endpoint de salud es accesible
- La estructura de carpetas cumple con el contrato
- Estructura de carpetas según contrato técnico
- Archivo de dependencias configurado
- Endpoint de salud /api/v1/health responde 200 OK

### TASK-BE-002 — Implementación de seguridad y persistencia base
**Área:** backend · **Componente:** Core Social · **Prioridad:** 1 · **Estimación:** M

Configurar SQLAlchemy con SQLite, implementar hashing de contraseñas con bcrypt y middleware de autenticación JWT.

- **Historias de usuario:** —
- **Pantallas:** —
- **Requisitos:** RF-001, RF-002, RNF-002
- **Criterios de aceptación:** —
- **Endpoints:** —
- **Depende de:** TASK-BE-001
- **Archivos sugeridos:** backend/app/db/session.py, backend/app/services/auth.py, backend/app/db/base.py

**Definición de terminado**
- Pruebas unitarias de hashing pasan
- Conexión a base de datos verificada
- Middleware de autenticación configurado
- Base de datos SQLite inicializada
- Utilidad de hashing implementada
- Middleware de autenticación JWT base

### TASK-FE-001 — Configuración base del proyecto React+Vite
**Área:** frontend · **Componente:** Core Social · **Prioridad:** 1 · **Estimación:** S

Inicializar el proyecto frontend con React, TypeScript y Vite. Configurar layout base, navegación, cliente HTTP y tokens de estilo.

- **Historias de usuario:** —
- **Pantallas:** —
- **Requisitos:** RF-030, RNF-008
- **Criterios de aceptación:** —
- **Endpoints:** —
- **Depende de:** —
- **Archivos sugeridos:** frontend/src/main.tsx, frontend/src/services/api.ts, frontend/src/styles/tokens.css

**Definición de terminado**
- La aplicación compila y corre
- El layout base es responsive
- Cliente HTTP configurado con interceptores base
- Proyecto React+Vite configurado
- Cliente HTTP (axios) configurado en services/
- Tokens de estilo definidos

### TASK-FE-002 — Componentes UI base y estados
**Área:** frontend · **Componente:** Core Social · **Prioridad:** 2 · **Estimación:** M

Crear componentes reutilizables para formularios (con validación Zod) y estados de carga, vacío y error.

- **Historias de usuario:** —
- **Pantallas:** —
- **Requisitos:** RF-009, RF-030
- **Criterios de aceptación:** —
- **Endpoints:** —
- **Depende de:** TASK-FE-001
- **Archivos sugeridos:** frontend/src/components/FormInput.tsx, frontend/src/components/StatusStates.tsx

**Definición de terminado**
- Componentes probados en una página de prueba
- Validaciones de Zod funcionando
- Estados de UI visualmente correctos
- Componente de formulario base con validación
- Componentes de estado (Loading, Empty, Error)
- Integración de Zod

## Hitos
| Hito | Objetivo | Tareas |
|---|---|---|
| Esqueleto Ejecutable | Tener la infraestructura base de backend y frontend lista para implementar las historias de usuario. | TASK-BE-001, TASK-BE-002, TASK-FE-001, TASK-FE-002 |

## Riesgos y bloqueos
| Riesgo | Mitigación | Tareas |
|---|---|---|
| Bloqueo de scraping por supermercados | Respetar robots.txt y limitar frecuencia de peticiones según contrato. |  |

**Bloqueos:**
_Ninguno._

## Fuera del plan
- Las HU se implementan una por una con Implementar HU

## Trazabilidad requisito → tarea
| Requisito | Tareas |
|---|---|
| RF-001 | TASK-BE-001, TASK-BE-002 |
| RF-002 | TASK-BE-002 |
| RF-009 | TASK-FE-002 |
| RF-030 | TASK-FE-001, TASK-FE-002 |
| RNF-002 | TASK-BE-002 |
| RNF-003 | TASK-BE-001 |
| RNF-008 | TASK-FE-001 |
