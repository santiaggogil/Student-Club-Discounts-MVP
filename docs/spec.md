<!-- spec v1.0 aprobado 2026-11-02T18:15:56+00:00 · artefacto art_d20ed1eb77c1 · sha 00a49033764b -->
# SPEC — Plataforma web de ofertas de alimentos para estudiantes universitarios de Manizales

**Versión:** v1.0 (borrador v0.2) · **Estado:** Aprobada y congelada

## 1. Objetivo
Proporcionar a la comunidad universitaria de Manizales una plataforma web colaborativa (red social) y un sistema automatizado de extracción de promociones de supermercados y alertas por Telegram, permitiendo descubrir, calificar, publicar y mapear ofertas de alimentos de manera eficiente.

## 2. Contexto
El proyecto surge para mitigar el costo de alimentación de los estudiantes universitarios en Manizales. Combina un feed social de ofertas compartidas por usuarios, un bot de web scraping para consultar promociones en supermercados locales, una vista de mapa para ubicar tiendas y un bot de Telegram para notificaciones instantáneas a seguidores y alertas de fallo al operador.

## 3. Alcance
- Registro e inicio de sesión seguro (con correo verificado de cualquier dominio o usuario único) y gestión de perfil público/privado.
- Publicación guiada en 3 pasos, edición, eliminación y visualización de ofertas comunitarias en feed ordenado por relevancia o recientes.
- Sistema de calificación de 1 a 5 estrellas para validar la relevancia de ofertas.
- Funcionalidades sociales de seguimiento entre usuarios y filtrado de feed por usuarios seguidos.
- Extracción automatizada diaria (3:00 a.m.) de promociones en supermercados (Éxito, Carulla, Olímpica, Jumbo) utilizando el paquete integrado bot_ofertas.
- Visualización en mapa interactivo de las ofertas vigentes procedentes de supermercados en Manizales.
- Vinculación con bot de Telegram mediante código de un solo uso para recibir alertas de publicaciones de usuarios seguidos.
- Alertas automáticas vía Telegram al operador en menos de 5 minutos ante fallos de scraping.
- Moderación de contenidos: reporte de publicaciones, auto-ocultamiento por umbral de reportes y cola de moderación.
- Administración de usuarios con sanciones progresivas (3 días, 2 semanas, baneo definitivo) y bloqueo de reingreso por correo.
- Panel de administración para supervisión y gestión (activación/desactivación y ejecución manual) de las fuentes del bot.
- Interfaz web responsive (mobile-first) accesible desde celulares y computadores.

## 4. Actores
| ID | Actor | Descripción | Fuente |
|---|---|---|---|
| ACT-01 | Visitante | Usuario no autenticado que navega por la plataforma web desde un móvil o computador. | historias-de-usuario.md (HU-01, HU-02) |
| ACT-02 | Estudiante / Cazador de ofertas | Usuario autenticado en la plataforma que puede publicar ofertas, calificar, seguir a otros usuarios y recibir notificaciones. | historias-de-usuario.md (HU-01 a HU-16, HU-20, HU-21, HU-23, HU-24, HU-26, HU-33) |
| ACT-03 | Operador del bot | Encargado técnico que recibe alertas sobre fallos en el proceso de scraping de supermercados para realizar correcciones. | historias-de-usuario.md (HU-19) |
| ACT-04 | Administrador | Usuario con privilegios elevados que gestiona la moderación de publicaciones, sanciones a usuarios e inspección/control del bot. | historias-de-usuario.md (HU-27 a HU-32, HU-34) |

## 5. Hechos confirmados
| ID | Hecho | Fuente |
|---|---|---|
| HEC-01 | El equipo de desarrollo consolidó 30 historias de usuario agrupadas en 9 épicas como fuente de verdad funcional del MVP. | historias-de-usuario.md (Sección 1) |
| HEC-02 | Existe un componente integrado `bot_ofertas` escrito en Python que realiza web scraping respetando robots.txt y gestiona vinculaciones y alertas en Telegram. | bot-de-ofertas-y-notificaciones-telegram-componente-existente |
| HEC-03 | Las fuentes soportadas por el bot son cadenas VTEX (Éxito, Carulla, Olímpica, Jumbo), estando la fuente D1 desactivada temporalmente. | bot-de-ofertas-y-notificaciones-telegram-componente-existente y respuesta del usuario en la conversación |
| HEC-04 | Se determinó que la recolección automática del bot se ejecutará una vez al día a las 3:00 a. m. | respuesta del usuario en la conversación |
| HEC-05 | Las ofertas comunitarias expiradas quedan ocultas automáticamente del feed principal. | respuesta del usuario en la conversación |
| HEC-06 | El mapa de ofertas está restringido exclusivamente a ofertas de supermercados procesadas por el bot. | respuesta del usuario en la conversación |
| HEC-07 | La duración de la sesión web activa se definió en 30 minutos. | historias-de-usuario.md (HU-02) y respuesta del usuario en la conversación |
| HEC-08 | La recuperación de contraseña para usuarios registrados únicamente con apodo/usuario (sin correo) queda fuera del MVP. | respuesta del usuario en la conversación |

## 6. Necesidades de los usuarios
| ID | Actor | Necesidad | Fuente |
|---|---|---|---|
| NEC-01 | ACT-01 | Registrarse e iniciar sesión de manera rápida y accesible desde cualquier navegador sin obligatoriedad de correo institucional. | historias-de-usuario.md (HU-01, HU-02) |
| NEC-02 | ACT-02 | Publicar ofertas con foto, precio, ubicación, vigencia y descripción mediante un proceso guiado ágil en 3 pasos. | historias-de-usuario.md (HU-05) |
| NEC-03 | ACT-02 | Visualizar y filtrar un feed de ofertas ordenado por relevancia o frescura, validado mediante calificaciones de 1 a 5 estrellas. | historias-de-usuario.md (HU-09, HU-11, HU-12, HU-15) |
| NEC-04 | ACT-02 | Consultar promociones de supermercados en un mapa interactivo para comparar ubicaciones y precios en Manizales. | historias-de-usuario.md (HU-20, HU-21) |
| NEC-05 | ACT-02 | Vincular su cuenta con Telegram sin dar su número telefónico para recibir alertas de publicaciones de usuarios que sigue. | historias-de-usuario.md (HU-23, HU-24) |
| NEC-06 | ACT-03 | Recibir notificaciones inmediatas en Telegram cuando el bot sufra un fallo en el scraping de alguna fuente para intervenir a tiempo. | historias-de-usuario.md (HU-19) |
| NEC-07 | ACT-04 | Disponer de herramientas de moderación (cola de reportes, ocultamiento automático, sanciones progresivas) e inspección de fuentes del bot para garantizar la integridad y calidad del servicio. | historias-de-usuario.md (HU-27 a HU-32) |

## 7. Requisitos funcionales
### RF-001 — Registro de usuario con correo o nombre de usuario
El sistema debe permitir a un visitante registrarse proporcionando un correo electrónico o un nombre de usuario único junto con una contraseña segura.

- **Actor:** Visitante · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-01
- **Fuente:** historias-de-usuario.md (HU-01)

**Criterios de aceptación**
- **AC-001** — *Dado* un correo válido y no registrado, y una contraseña que cumple la política, *cuando* envío el formulario de registro, *entonces* se crea la cuenta, recibo un mensaje para verificar mi correo y al verificarlo accedo a la plataforma.
- **AC-002** — *Dado* un usuario único y una contraseña que cumple la política, *cuando* elijo registrarme sin correo y envío el formulario, *entonces* se crea la cuenta y accedo a la plataforma.
- **AC-003** — *Dado* un correo o usuario ya registrado, *cuando* intento registrarme, *entonces* no se crea una cuenta duplicada y veo un error claro sin que se borren los demás campos.
- **AC-004** — *Dado* un correo con formato inválido, *cuando* envío el formulario, *entonces* se rechaza con un mensaje claro.
- **AC-005** — *Dado* una contraseña que incumple la política (mínimo 10 caracteres con mayúsculas, minúsculas y números), *cuando* envío el formulario, *entonces* se rechaza y se indica el requisito que falta.
- **AC-006** — *Dado* que se audita la base de datos, *cuando* se almacena la información, *entonces* ninguna contraseña aparece en texto plano.
- **AC-007** — *Dado* que uso un celular, *cuando* accedo al formulario, *entonces* el formulario se ve y funciona correctamente (mobile-first).

### RF-002 — Inicio y cierre de sesión
El sistema debe permitir a un usuario registrado iniciar y cerrar sesión de forma segura.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-02
- **Fuente:** historias-de-usuario.md (HU-02)

**Criterios de aceptación**
- **AC-008** — *Dado* credenciales correctas (correo o usuario, y contraseña), *cuando* inicio sesión, *entonces* accedo a la plataforma autenticado.
- **AC-009** — *Dado* credenciales incorrectas, *cuando* intento iniciar sesión, *entonces* se rechaza el acceso con un mensaje genérico que no revela si falló el correo, el usuario o la contraseña.
- **AC-010** — *Dado* una sesión web iniciada, *cuando* regreso de visitar un establecimiento dentro de los 30 minutos, *entonces* puedo valorar la publicación sin iniciar sesión de nuevo.
- **AC-011** — *Dado* una sesión que supera los 30 minutos, *cuando* intento usar una función protegida, *entonces* debo iniciar sesión de nuevo.
- **AC-012** — *Dado* una sesión activa, *cuando* cierro sesión, *entonces* la sesión se invalida y ya no puedo acceder a funciones protegidas sin autenticarme.
- **AC-013** — *Dado* un visitante sin sesión, *cuando* intenta publicar, calificar o seguir, *entonces* es redirigido al inicio de sesión.

### RF-003 — Gestión y edición de información del perfil
El sistema debe permitir a los usuarios autenticados consultar y actualizar los datos de su perfil, incluyendo apodo o nombre, foto de perfil y biografía en texto plano.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-03
- **Fuente:** historias-de-usuario.md (HU-03)

**Criterios de aceptación**
- **AC-014** — *Dado* un usuario autenticado, *cuando* modifica su apodo o nombre, su foto de perfil o su biografía con datos válidos y guarda los cambios, *entonces* el perfil se actualiza y la nueva información se ve reflejada en el sistema.
- **AC-015** — *Dado* un usuario autenticado que ingresa un dato inválido al editar su perfil, *cuando* intenta guardar los cambios, *entonces* el sistema no aplica ningún cambio y muestra un mensaje indicando el error específico.
- **AC-016** — *Dado* el campo de biografía del perfil, *cuando* un usuario ingresa texto para su biografía, *entonces* el sistema solo admite e interpreta dicho contenido como texto plano.

### RF-004 — Visualización de perfil público y privacidad de seguidores
El sistema debe permitir visualizar los datos públicos del perfil de otros usuarios y ofrecer al propietario del perfil la opción de configurar si su lista de seguidores es pública o privada.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-03
- **Fuente:** historias-de-usuario.md (HU-03) y decisión de usuario

**Criterios de aceptación**
- **AC-017** — *Dado* un usuario que consulta un perfil, *cuando* accede a la vista del perfil, *entonces* el sistema muestra el apodo o nombre, la foto de perfil, la biografía, el contador de seguidores y el contador de seguidos.
- **AC-018** — *Dado* un usuario autenticado que configura la privacidad de sus seguidores, *cuando* la define como privada, *entonces* otros usuarios no pueden ver su lista detallada de seguidores; si la defino como pública, otros usuarios sí pueden verla.
- **AC-019** — *Dado* un usuario que navega por la plataforma, *cuando* abre el perfil de otro usuario, *entonces* ve los datos públicos de dicho usuario pero no se le permite editarlos bajo ninguna condición.

### RF-005 — Recuperación de contraseña mediante enlace enviado por correo electrónico
El sistema debe permitir a los usuarios registrados solicitar el restablecimiento de su contraseña mediante un enlace temporal y de un solo uso enviado a su correo electrónico registrado.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-04
- **Fuente:** historias-de-usuario.md (HU-04) y decisión de usuario

**Criterios de aceptación**
- **AC-020** — *Dado* un correo electrónico registrado en la plataforma, *cuando* el usuario solicita restablecer su contraseña, *entonces* recibe en su correo electrónico un enlace de un solo uso con una fecha/hora de vencimiento.
- **AC-021** — *Dado* un correo electrónico no registrado en el sistema, *cuando* un usuario solicita el restablecimiento de contraseña, *entonces* el mensaje mostrado por la interfaz no revela si la cuenta existe o no.
- **AC-022** — *Dado* un enlace de restablecimiento válido y no expirado, *cuando* el usuario define una nueva contraseña que cumple con la política de seguridad y la guarda, *entonces* puede iniciar sesión exitosamente con la nueva contraseña y el enlace queda inhabilitado para usos futuros.
- **AC-023** — *Dado* un enlace de restablecimiento vencido o que ya ha sido utilizado previamente, *cuando* el usuario intenta acceder o guardar una contraseña con él, *entonces* el sistema rechaza la solicitud y permite al usuario solicitar un nuevo enlace de recuperación.

### RF-006 — Publicación guiada de ofertas comunitarias en 3 pasos
El sistema debe permitir a Estudiante / Cazador de ofertas publicar promociones de alimentos mediante un flujo asistido de 3 pasos (1. Foto, 2. Precio, ubicación y vigencia, 3. Descripción breve), asociándolas a su cuenta y mostrándolas de forma inmediata en el feed de ofertas.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-05
- **Fuente:** historias-de-usuario.md (HU-05)

**Criterios de aceptación**
- **AC-024** — *Dado* el paso 1 del flujo de publicación, *cuando* el usuario decide adjuntar una foto de la oferta, *entonces* puede elegir una foto existente desde la galería o tomar una nueva directamente con la cámara del dispositivo.
- **AC-025** — *Dado* el paso 2 del flujo de publicación, *cuando* el usuario avanza para ingresar los datos principales, *entonces* ingresa el precio, la ubicación y la vigencia de la oferta.
- **AC-026** — *Dado* el paso 3 del flujo de publicación, *cuando* el usuario llega al último paso, *entonces* escribe una descripción breve de la promoción.
- **AC-027** — *Dado* un usuario autenticado que completa los 3 pasos con datos válidos, *cuando* publica la oferta, *entonces* la oferta queda registrada en el sistema, asociada a su autor y visible de inmediato en el feed.
- **AC-028** — *Dado* un campo obligatorio vacío en cualquier paso, *cuando* intento avanzar de paso o publicar, *entonces* se bloquea el avance, se indica claramente el campo faltante y no se pierde la información ingresada previamente.
- **AC-029** — *Dado* una imagen en un formato común de Android, iOS o PC, *cuando* la subo durante el paso 1, *entonces* se acepta y se comprime automáticamente a aproximadamente 2 MB sin guardar datos binarios en la base de datos relacional.
- **AC-030** — *Dado* una imagen en un formato no permitido, *cuando* intento subirla, *entonces* se rechaza el archivo y se muestra un mensaje explicativo claro.
- **AC-031** — *Dado* que la carga o el procesamiento de la imagen falla, *cuando* publico la oferta, *entonces* no se crea la oferta en la base de datos y se avisa al usuario sin perder el texto ni los datos digitados.
- **AC-032** — *Dado* que el usuario confirma la publicación, *cuando* el sistema procesa la solicitud, *entonces* la respuesta es inmediata y no espera a que finalice el proceso de envío de notificaciones en segundo plano.

### RF-007 — Gestión de fecha de vigencia y expiración de ofertas
El sistema debe permitir a Estudiante / Cazador de ofertas indicar la fecha y hora límite de validez de una oferta, marcándola automáticamente como expirada y ocultándola del feed principal cuando se cumple dicha vigencia.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-06
- **Fuente:** historias-de-usuario.md (HU-06) y decisiones del proyecto

**Criterios de aceptación**
- **AC-033** — *Dado* una oferta con fecha y hora de vencimiento especificada, *cuando* llega ese momento exacto en el tiempo, *entonces* el sistema la marca automáticamente como expirada.
- **AC-034** — *Dado* una oferta que ha sido marcada como expirada, *cuando* un usuario abre o actualiza el feed principal de ofertas, *entonces* la oferta expirada no aparece en el listado del feed.
- **AC-035** — *Dado* una oferta vigente, *cuando* un usuario la visualiza en la plataforma, *entonces* su vigencia exacta es claramente visible tanto en la tarjeta del feed como en la vista detallada.

### RF-008 — Edición y eliminación de publicaciones propias
El sistema debe permitir a Estudiante / Cazador de ofertas modificar o eliminar únicamente las publicaciones creadas por su propia cuenta, impidiendo cualquier intento de edición o eliminación por parte de usuarios no autores.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-08
- **Fuente:** historias-de-usuario.md (HU-08)

**Criterios de aceptación**
- **AC-036** — *Dado* el autor de una publicación, *cuando* la edita ingresando datos válidos y confirma los cambios, *entonces* los cambios se reflejan de forma actualizada en el feed y en el detalle de la publicación.
- **AC-037** — *Dado* el autor de una publicación, *cuando* la elimina del sistema, *entonces* la publicación deja de mostrarse de inmediato en el feed y en búsquedas.
- **AC-038** — *Dado* un usuario que no es el autor de una publicación, *cuando* intenta modificarla o eliminarla, *entonces* el sistema deniega la acción y no permite la modificación ni el borrado.

### RF-009 — Visualización y paginación del feed de ofertas
El sistema debe permitir a los usuarios visualizar un feed paginado de ofertas publicadas por la comunidad y el bot, mostrando tarjetas detalladas y cargando información por tandas.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-09
- **Fuente:** historias-de-usuario.md (HU-09)

**Criterios de aceptación**
- **AC-039** — *Dado* que existen ofertas publicadas en la plataforma, *cuando* el usuario abre el feed de ofertas, *entonces* cada tarjeta de oferta muestra la foto, la descripción, la ubicación, el autor y la calificación promedio.
- **AC-040** — *Dado* un feed con múltiples ofertas, *cuando* el usuario realiza scroll o cambia de página, *entonces* las ofertas se cargan por tandas de manera progresiva.
- **AC-041** — *Dado* que no existen ofertas disponibles para mostrar, *cuando* el usuario abre el feed de ofertas, *entonces* el sistema muestra un mensaje explícito de estado vacío.
- **AC-042** — *Dado* una conexión móvil promedio, *cuando* el usuario abre el feed de ofertas, *entonces* el contenido se carga completamente en un tiempo inferior a 2 segundos.

### RF-010 — Calificación de ofertas
El sistema debe permitir a los usuarios autenticados calificar ofertas publicadas por otros usuarios con un puntaje de 1 a 5 estrellas, pudiendo modificar su voto y recalculando la calificación promedio de la publicación.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-11
- **Fuente:** historias-de-usuario.md (HU-11)

**Criterios de aceptación**
- **AC-043** — *Dado* un usuario autenticado, *cuando* califica la oferta de otro usuario con una puntuación de 1 a 5 estrellas (1 = poco, 5 = excelente), *entonces* su calificación queda registrada en el sistema y el puntaje promedio de la oferta se actualiza de inmediato.
- **AC-044** — *Dado* un usuario autenticado que ya calificó una oferta previamente, *cuando* modifica su calificación, *entonces* el valor de su voto se actualiza garantizando una sola calificación por usuario/publicación y se corrige el promedio resultante.
- **AC-045** — *Dado* un usuario autenticado visualizando su propia publicación, *cuando* intenta calificarla, *entonces* el sistema prohíbe la acción y no registra ninguna calificación.
- **AC-046** — *Dado* un visitante no autenticado (sin sesión), *cuando* intenta calificar una oferta, *entonces* el sistema interrumpe la acción y le solicita iniciar sesión.

### RF-011 — Ordenamiento del feed por relevancia y fecha
El sistema debe permitir ordenar las publicaciones del feed según su nivel de relevancia (combinación de calificación promedio y vigencia) o cronológicamente por la fecha de publicación mediante un selector de ordenamiento.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-12
- **Fuente:** historias-de-usuario.md (HU-12)

**Criterios de aceptación**
- **AC-047** — *Dado* un conjunto de ofertas con distintas calificaciones, *cuando* el usuario abre o selecciona la opción 'más relevantes' en el feed, *entonces* las ofertas se muestran ordenadas de mayor a menor calificación promedio considerando adicionalmente su vigencia.
- **AC-048** — *Dado* una oferta cuya calificación promedio cambia producto de nuevas valoraciones, *cuando* el usuario recarga el feed, *entonces* la posición de la oferta en el ranking refleja inmediatamente su nueva calificación.
- **AC-049** — *Dado* el selector de orden del feed, *cuando* el usuario selecciona la opción 'más recientes', *entonces* el feed se ordena de forma cronológica descendente según la fecha de publicación.

### RF-012 — Gestión de seguimiento entre cazadores de ofertas
El sistema debe permitir a los usuarios autenticados seguir y dejar de seguir a otros usuarios desde sus perfiles públicos con un solo clic para construir su red de confianza.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-13
- **Fuente:** historias-de-usuario.md (HU-13)

**Criterios de aceptación**
- **AC-050** — *Dado* el perfil de otro usuario, *cuando* el usuario autenticado presiona la opción 'Seguir', *entonces* la relación de seguimiento queda registrada en la plataforma y el botón cambia a 'Dejar de seguir'.
- **AC-051** — *Dado* un usuario que ya sigue a otro cazador de ofertas, *cuando* intenta seguirlo nuevamente, *entonces* el sistema impide la creación de una segunda relación o registro duplicado.
- **AC-052** — *Dado* un usuario que sigue a otro cazador de ofertas, *cuando* presiona la opción 'Dejar de seguir', *entonces* la relación de seguimiento se elimina de la plataforma y el botón regresa al estado 'Seguir'.
- **AC-053** — *Dado* un usuario autenticado visualizando su propio perfil, *cuando* inspecciona las opciones del perfil, *entonces* el sistema no le permite seguirse a sí mismo ni muestra la opción activa para hacerlo.

### RF-013 — Ver listas de seguidores y seguidos
El sistema debe permitir al usuario autenticado consultar sus listas de seguidores y seguidos, navegar al perfil de un usuario seleccionado para gestionarlo (o dejar de seguirlo), y respetar la configuración de privacidad de seguidores en perfiles ajenos.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-14
- **Fuente:** historias-de-usuario.md (HU-14)

**Criterios de aceptación**
- **AC-054** — *Dado* mi perfil de usuario, *cuando* abro la sección 'Seguidores' o 'Siguiendo', *entonces* veo las listas correspondientes con los usuarios pertenecientes a cada categoría.
- **AC-055** — *Dado* una lista de seguidores o seguidos, *cuando* selecciono un usuario de la lista, *entonces* el sistema me me redirige a su perfil y me permite dejar de seguirlo directamente desde allí.
- **AC-056** — *Dado* el perfil de otro usuario configurado con seguidores privados, *cuando* lo abro, *entonces* el sistema no me muestra su lista de seguidores.

### RF-014 — Filtrar feed por usuarios seguidos
El sistema debe permitir al usuario autenticado aplicar un filtro en el feed de ofertas para visualizar de manera exclusiva las publicaciones de las personas a las que sigue.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-15
- **Fuente:** historias-de-usuario.md (HU-15)

**Criterios de aceptación**
- **AC-057** — *Dado* el filtro 'Siguiendo' en el feed de ofertas, *cuando* lo activo, *entonces* el sistema muestra únicamente las ofertas publicadas por usuarios a los que actualmente sigo.
- **AC-058** — *Dado* un usuario que no sigue a nadie, *cuando* activo el filtro 'Siguiendo', *entonces* el sistema muestra un mensaje informativo invitando a buscar y seguir a otros usuarios.

### RF-015 — Descubrir y clasificar cazadores de ofertas
El sistema debe permitir al usuario explorar un ranking o listado de usuarios (cazadores de ofertas) ordenados por la calificación acumulada de sus publicaciones para facilitar su descubrimiento y seguimiento.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Baja · **Origen:** documento · **Historias:** HU-16
- **Fuente:** historias-de-usuario.md (HU-16)

**Criterios de aceptación**
- **AC-059** — *Dado* el listado de cazadores de ofertas, *cuando* accedo a él, *entonces* los perfiles aparecen ordenados descendentemente por la calificación acumulada de sus ofertas.
- **AC-060** — *Dado* un perfil dentro del listado de cazadores, *cuando* lo selecciono, *entonces* puedo ver sus detalles y presionar la opción para seguirlo.

### RF-016 — Extracción automática periódica de ofertas de supermercados
El sistema debe ejecutar de forma automatizada y periódica el proceso de extracción de promociones desde los catálogos de supermercados soportados (Éxito, Carulla, Olímpica, Jumbo) normalizando los datos extraídos y previniendo registros duplicados.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-17
- **Fuente:** historias-de-usuario.md (HU-17) y decisiones del usuario en la conversación

**Criterios de aceptación**
- **AC-061** — *Dado* el programador de tareas del sistema, *cuando* llega la hora configurada (3:00 a. m. en horario no pico), *entonces* el bot extrae automáticamente las promociones de las cadenas de supermercados configuradas.
- **AC-062** — *Dado* una oferta extraída del catálogo web, *cuando* es procesada por el bot, *entonces* se guarda en el sistema con producto, precio, tienda, fecha de vigencia y fuente original de forma normalizada.
- **AC-063** — *Dado* una oferta que ya fue registrada previamente en el sistema, *cuando* el bot la vuelve a extraer en la misma corrida, *entonces* el sistema detecta la existencia previa y no la duplica.
- **AC-064** — *Dado* la ejecución del bot de web scraping, *cuando* realiza peticiones HTTP a los sitios de los supermercados, *entonces* respeta el archivo robots.txt, los términos de uso y aplica límites de frecuencia entre peticiones.
- **AC-065** — *Dado* la necesidad de agregar una nueva cadena de supermercados al scraper, *cuando* se requiere su integración, *entonces* el sistema permite agregarla mediante cambios acotados a un módulo o archivo de configuración por sitio.

### RF-017 — Continuidad del servicio ante fallos en fuentes de extracción
El sistema debe garantizar la continuidad de la plataforma web, el feed social y la extracción de fuentes de supermercados restantes cuando una fuente en particular presente fallos o cambios de estructura, preservando las ofertas previamente extraídas que sigan vigentes y reintentando según la política configurada.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-18
- **Fuente:** historias-de-usuario.md (HU-18)

**Criterios de aceptación**
- **AC-066** — *Dado* que una cadena presenta un fallo o cambio de estructura, *cuando* corre la extracción, *entonces* se registra el error y se conservan sus ofertas anteriores que sigan vigentes.
- **AC-067** — *Dado* el fallo de una fuente, *cuando* se ejecuta el proceso de extracción, *entonces* la extracción de las cadenas restantes termina con éxito.
- **AC-068** — *Dado* el fallo de una fuente, *cuando* los usuarios navegan por la plataforma, *entonces* el feed social y la navegación web siguen funcionando con normalidad.
- **AC-069** — *Dado* una falla temporal, *cuando* se detecta la falla en la extracción, *entonces* el sistema reintenta la extracción según la política definida.

### RF-018 — Notificación de alertas de fallos en la extracción al operador
El sistema debe emitir una alerta vía Telegram al operador del bot en menos de 5 minutos al detectar bloqueos o cambios de estructura HTML durante el scraping de una cadena, adjuntando el JSON crudo y reintentando en caso de caídas temporales de red.

- **Actor:** Operador del bot · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-19
- **Fuente:** historias-de-usuario.md (HU-19)

**Criterios de aceptación**
- **AC-070** — *Dado* un bloqueo o cambio de HTML en una cadena, *cuando* el sistema detecta la anomalía, *entonces* envía una alerta al Telegram del operador en menos de 5 minutos, adjuntando el JSON crudo.
- **AC-071** — *Dado* una caída temporal de red, *cuando* falla el envío de la alerta al operador, *entonces* el sistema reintenta hasta lograrlo.

### RF-019 — Visualización del mapa interactivo de ofertas de supermercados
El sistema debe permitir a los usuarios visualizar en un mapa interactivo las tiendas de cadena de Manizales con ofertas vigentes recopiladas por el bot, conservando ofertas vigentes si la recolección falló y mostrando un aviso cuando no haya datos disponibles.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-20
- **Fuente:** historias-de-usuario.md (HU-20)

**Criterios de aceptación**
- **AC-072** — *Dado* ofertas extraídas de supermercados, *cuando* el estudiante abre el mapa, *entonces* cada marcador corresponde a una tienda e indica sus ofertas.
- **AC-073** — *Dado* que no hay ofertas vigentes de supermercados, *cuando* el estudiante abre el mapa, *entonces* ve un aviso de que no hay datos disponibles.
- **AC-074** — *Dado* que la última recolección de una cadena falló, *cuando* el estudiante abre el mapa, *entonces* el mapa conserva sus ofertas vigentes anteriores.
- **AC-075** — *Dado* una conexión móvil promedio, *cuando* el estudiante carga el mapa, *entonces* el mapa carga en menos de 2 segundos.

### RF-020 — Consulta de detalle y comparación de ofertas por tienda en el mapa
El sistema debe permitir al usuario seleccionar un marcador de tienda en el mapa para ver el detalle de sus ofertas (producto, precio, vigencia y fuente) y posibilitar la visualización de dichas ofertas en una tabla ordenada para comparar precios.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-21
- **Fuente:** historias-de-usuario.md (HU-21)

**Criterios de aceptación**
- **AC-076** — *Dado* un marcador de tienda en el mapa, *cuando* el estudiante lo toca, *entonces* ve el producto, precio, vigencia y fuente de cada oferta de esa tienda.
- **AC-077** — *Dado* el listado de ofertas de una tienda seleccionada, *cuando* el estudiante solicita la vista comparativa, *entonces* puede verlo también como tabla ordenada para comparar precios.

### RF-021 — Vinculación y desvinculación de cuenta con bot de Telegram
El sistema debe permitir a los usuarios autenticados vincular su cuenta con el bot de Telegram mediante un código o enlace de un solo uso con vencimiento, sin solicitar el número telefónico, y desvincularla en cualquier momento.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-23
- **Fuente:** historias-de-usuario.md (HU-23)

**Criterios de aceptación**
- **AC-078** — *Dado* un usuario autenticado, *cuando* solicita vincular Telegram, *entonces* recibe un código o enlace único con vencimiento.
- **AC-079** — *Dado* un código válido enviado al bot (por ejemplo con /start), *cuando* el bot procesa la solicitud, *entonces* la cuenta queda asociada y tanto el bot como la web muestran la confirmación “Vinculado”.
- **AC-080** — *Dado* un código inválido, vencido o ya usado, *cuando* se intenta procesar en el bot, *entonces* la vinculación se rechaza, el bot indica cómo generar uno nuevo y la web permite pedirlo.
- **AC-081** — *Dado* un usuario vinculado, *cuando* lo solicita, *entonces* puede desvincular su cuenta en cualquier momento.
- **AC-082** — *Dado* el proceso completo de vinculación o desvinculación, *cuando* el usuario interactúa con la plataforma o el bot, *entonces* en ningún momento se solicita el número telefónico.

### RF-022 — Notificación por Telegram de ofertas publicadas por usuarios seguidos
El sistema debe enviar de forma automática y regulada una alerta por Telegram a los seguidores que tengan su cuenta vinculada cuando un usuario publique una oferta, garantizando que los fallos del servicio externo no afecten la publicación web.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-24
- **Fuente:** historias-de-usuario.md (HU-24)

**Criterios de aceptación**
- **AC-083** — *Dado* que sigo a un autor y tengo Telegram vinculado, *cuando* el autor publica una oferta, *entonces* recibo una alerta con autor, resumen y enlace a la publicación en menos de 1 minuto.
- **AC-084** — *Dado* que no sigo al autor (o dejé de seguirlo), *cuando* el autor publica una oferta, *entonces* no recibo ninguna alerta.
- **AC-085** — *Dado* que no tengo Telegram vinculado, *cuando* un seguido publica una oferta, *entonces* no se genera error y la publicación se completa con normalidad.
- **AC-086** — *Dado* un autor con muchos seguidores (p. ej. 50), *cuando* publica una oferta, *entonces* los envíos se regulan para respetar el límite de 30 mensajes por segundo de Telegram.
- **AC-087** — *Dado* que Telegram falla o no responde, *cuando* se publica una oferta, *entonces* el autor recibe confirmación inmediata y el envío se reintenta según la política definida.

### RF-023 — Reporte de publicaciones sospechosas o engañosas
El sistema debe permitir a los usuarios autenticados reportar publicaciones sospechosas, engañosas o inapropiadas indicando un motivo, impidiendo la duplicación de reportes por el mismo usuario.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-26
- **Fuente:** historias-de-usuario.md (HU-26)

**Criterios de aceptación**
- **AC-088** — *Dado* una publicación, *cuando* la reporto indicando un motivo, *entonces* el reporte llega a la cola visible para el administrador.
- **AC-089** — *Dado* que ya reporté una publicación, *cuando* intento reportarla de nuevo, *entonces* no se duplica mi reporte.

### RF-024 — Moderación de publicaciones reportadas y auditoría de retiros
El sistema debe permitir a los administradores revisar la cola de reportes y retirar publicaciones inapropiadas o falsas, registrando auditoría de cada eliminación y denegando el acceso a usuarios no administradores.

- **Actor:** Administrador · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-27
- **Fuente:** historias-de-usuario.md (HU-27)

**Criterios de aceptación**
- **AC-090** — *Dado* un administrador autenticado, *cuando* revisa una publicación reportada y aprueba su retiro, *entonces* deja de verse en el feed.
- **AC-091** — *Dado* una eliminación, *cuando* es realizada por un administrador, *entonces* queda registro de quién eliminó qué y cuándo.
- **AC-092** — *Dado* un usuario sin rol de administrador, *cuando* intenta moderar, *entonces* se le deniega.

### RF-025 — Auto-ocultamiento de publicaciones por umbral de reportes
El sistema debe permitir a Administrador configurar un umbral N de reportes que oculte automáticamente las publicaciones que alcancen dicha cifra, enviándolas a la cola de moderación.

- **Actor:** Administrador · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-28
- **Fuente:** historias-de-usuario.md (HU-28)

**Criterios de aceptación**
- **AC-093** — *Dado* un umbral de N reportes configurado, *cuando* una publicación acumula N reportes, *entonces* se oculta automáticamente del feed.
- **AC-094** — *Dado* una publicación con N-1 reportes, *cuando* un usuario navega por el feed, *entonces* sigue visible.
- **AC-095** — *Dado* una publicación auto-ocultada, *cuando* el administrador accede a la cola de moderación, *entonces* aparece en la cola del administrador para su decisión final (restaurar o eliminar).

### RF-026 — Aplicación de sanciones progresivas a usuarios
El sistema debe permitir a Administrador suspender o bloquear cuentas de usuarios mediante sanciones progresivas (3 días, 2 semanas y baneo definitivo), requiriendo obligatoriamente categoría y motivo.

- **Actor:** Administrador · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-29
- **Fuente:** historias-de-usuario.md (HU-29)

**Criterios de aceptación**
- **AC-096** — *Dado* una infracción, *cuando* aplico una suspensión indicando categoría y motivo, *entonces* el usuario queda restringido, se registra la traza y se le envía una notificación detallada.
- **AC-097** — *Dado* un intento de sancionar sin la categoría obligatoria, *cuando* el administrador procesa la sanción, *entonces* el sistema lo rechaza.
- **AC-098** — *Dado* un usuario sancionado, *cuando* se aplican sanciones sucesivas, *entonces* la sanción avanza en el orden Activo → Suspendido 3 días → Suspendido 2 semanas → Baneado.
- **AC-099** — *Dado* un usuario suspendido o baneado, *cuando* intenta iniciar sesión, *entonces* se le bloquea el acceso.

### RF-027 — Bloqueo de reingreso a usuarios baneados por correo electrónico
El sistema debe permitir a Administrador e impedir a Visitante con una cuenta previamente baneada registrarse nuevamente utilizando la misma dirección de correo electrónico.

- **Actor:** Administrador · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-30
- **Fuente:** historias-de-usuario.md (HU-30)

**Criterios de aceptación**
- **AC-100** — *Dado* un usuario baneado, *cuando* intenta registrarse con el mismo correo, *entonces* el registro se bloquea.
- **AC-101** — *Dado* un usuario baneado, *cuando* intenta registrarse con un correo distinto, *entonces* el registro no se bloquea, porque el control es solo por correo.

### RF-028 — Supervisión del estado de las fuentes del bot
El sistema debe permitir a Administrador consultar un panel de control con el estado de ejecución, fecha y resultado detallado de cada fuente configurada en el bot de scraping.

- **Actor:** Administrador · **Prioridad:** Media · **Origen:** documento · **Historias:** HU-31
- **Fuente:** historias-de-usuario.md (HU-31)

**Criterios de aceptación**
- **AC-102** — *Dado* un administrador autenticado, *cuando* abre el panel, *entonces* ve por cada cadena la fecha y el resultado de la última ejecución (éxito o error).
- **AC-103** — *Dado* una ejecución fallida, *cuando* el administrador inspecciona el estado de la fuente, *entonces* se muestra como fallida con el detalle del error.
- **AC-104** — *Dado* que no hay ejecuciones registradas, *cuando* el administrador consulta el panel, *entonces* el panel lo indica.
- **AC-105** — *Dado* un usuario sin rol de administrador, *cuando* intenta acceder al panel, *entonces* no puede acceder al panel.

### RF-029 — Gestión manual y activación de fuentes del bot de scraping
El sistema debe permitir al Administrador activar, desactivar y ejecutar manualmente la extracción de ofertas de cualquiera de las fuentes de supermercados configuradas.

- **Actor:** Administrador · **Prioridad:** Baja · **Origen:** documento · **Historias:** HU-32
- **Fuente:** historias-de-usuario.md (HU-32)

**Criterios de aceptación**
- **AC-106** — *Dado* una fuente activa, *cuando* el Administrador la desactiva, *entonces* el bot deja de extraerla y conserva sus datos anteriores.
- **AC-107** — *Dado* una fuente, *cuando* el Administrador lanzo una ejecución manual, *entonces* se ejecuta de inmediato y su resultado aparece en el panel.

### RF-030 — Soporte multidispositivo y usabilidad guiada
El sistema debe permitir a los usuarios acceder a la plataforma web desde navegadores móviles o de escritorio y guiar la publicación de ofertas en 3 pasos.

- **Actor:** Estudiante / Cazador de ofertas · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-33
- **Fuente:** historias-de-usuario.md (HU-33)

**Criterios de aceptación**
- **AC-108** — *Dado* una pantalla móvil o de escritorio, *cuando* el usuario navega por la plataforma, *entonces* el diseño (mobile-first) se adapta sin pérdida de funcionalidad.
- **AC-109** — *Dado* los navegadores Chrome, Firefox, Edge y Safari en sus versiones actuales, *cuando* el usuario interactúa con la plataforma, *entonces* todas las funciones operan correctamente.
- **AC-110** — *Dado* un usuario nuevo sin capacitación, *cuando* publica una oferta, *entonces* lo logra en los 3 pasos del flujo guiado.

### RF-031 — Capacidad operativa, disponibilidad y respaldo del sistema
El sistema debe garantizar la capacidad operativa, disponibilidad mínima en piloto y mecanismos de respaldo y restauración para la base de datos e imágenes.

- **Actor:** Administrador · **Prioridad:** Alta · **Origen:** documento · **Historias:** HU-34
- **Fuente:** historias-de-usuario.md (HU-34)

**Criterios de aceptación**
- **AC-111** — *Dado* una carga de 300 usuarios y 50 interacciones diarias, *cuando* la plataforma opera en producción, *entonces* no hay degradación del servicio.
- **AC-112** — *Dado* un aumento de usuarios, notificaciones o fuentes del bot, *cuando* crece la demanda, *entonces* se puede escalar sin rediseñar la arquitectura.
- **AC-113** — *Dado* el periodo piloto, *cuando* se evalúa la continuidad del servicio, *entonces* la disponibilidad es de al menos 95 %.
- **AC-114** — *Dado* el respaldo periódico, *cuando* se requiere recuperar el sistema, *entonces* se pueden restaurar la base de datos y las imágenes.

## 8. Requisitos no funcionales
| ID | Atributo | Descripción | Métrica | Pendiente | Fuente |
|---|---|---|---|---|---|
| RNF-001 | Rendimiento | El feed de ofertas y el mapa interactivo deben cargar completamente en un tiempo acotado bajo conexiones móviles promedios. | Carga menor a 2 segundos en conexión móvil promedio. | — | historias-de-usuario.md (HU-09, HU-20, Requisitos de calidad) |
| RNF-002 | Seguridad | Las contraseñas de los usuarios deben ser almacenadas utilizando un algoritmo de hashing seguro. | Hashing con bcrypt o equivalente; 0% de contraseñas en texto plano. | — | historias-de-usuario.md (HU-01, Requisitos de calidad) |
| RNF-003 | Seguridad | La plataforma debe proteger la transferencia de datos y prevenir vulnerabilidades web estándar. | Uso obligatorio de HTTPS; protecciones activas contra Inyección SQL, XSS y CSRF; control de acceso basado en roles. | — | historias-de-usuario.md (Requisitos de calidad) |
| RNF-004 | Gestión de imágenes | Las imágenes subidas deben optimizarse para reducir el consumo de ancho de banda sin guardar datos binarios en la base de datos relacional. | Compresión automática a ~2 MB; formatos aceptados comunes en Android/iOS/PC; almacenamiento en sistema de archivos o storage externo. | — | historias-de-usuario.md (HU-05, Requisitos de calidad) |
| RNF-005 | Privacidad | El sistema debe cumplir con la normativa colombiana de protección de datos personales. | Cumplimiento de la Ley 1581 de 2012 mediante aviso de privacidad y casilla de consentimiento explícito en el registro. | — | historias-de-usuario.md (Requisitos de calidad) |
| RNF-006 | Confiabilidad | El fallo de componentes externos (fuentes de scraping o API de Telegram) no debe interrumpir el funcionamiento central del feed social ni de la web. | Aislamiento de fallos 100%: disponibilidad del feed y navegación web ininterrumpida ante caídas del bot o Telegram. | — | historias-de-usuario.md (HU-18, Requisitos de calidad) |
| RNF-007 | Observabilidad | El sistema debe registrar eventos del sistema para auditar errores, ejecuciones y moderación. | Registro de logs estructurados para errores de aplicación, ejecuciones del bot y acciones de moderadores. | — | historias-de-usuario.md (HU-27, Requisitos de calidad) |
| RNF-008 | Portabilidad y Usabilidad | La interfaz web debe ser responsive y adaptarse a múltiples navegadores y dispositivos sin requerir instalaciones nativas. | Diseño mobile-first compatible con versiones actuales de Chrome, Firefox, Edge y Safari. | — | historias-de-usuario.md (HU-33, Requisitos de calidad) |
| RNF-009 | Disponibilidad | El servicio debe mantener un nivel alto de disponibilidad durante la fase piloto. | Disponibilidad del servicio de al menos 95 % durante el periodo piloto. | — | historias-de-usuario.md (HU-34) |
| RNF-010 | Capacidad | El sistema debe soportar la carga operativa prevista para el piloto sin degradar los tiempos de respuesta. | Soporte de al menos 300 usuarios activos y 50 interacciones/publicaciones diarias sin degradación del servicio. | — | historias-de-usuario.md (HU-34) |
| RNF-011 | Rendimiento en Notificaciones | El envío masivo de notificaciones por Telegram debe respetar las restricciones de tasa impuestas por la plataforma externa. | Control de tasa máximo de 30 mensajes por segundo en notificaciones a seguidores. | — | historias-de-usuario.md (HU-24) |

## 9. Reglas de negocio
| ID | Regla | Fuente |
|---|---|---|
| BR-001 | La contraseña debe tener un mínimo de 10 caracteres, incluyendo mayúsculas, minúsculas y números. | historias-de-usuario.md (HU-01) |
| BR-002 | La sesión web tiene una duración de 30 minutos de inactividad o tiempo transcurrido. | historias-de-usuario.md (HU-02) |
| BR-003 | La biografía del perfil de usuario únicamente acepta texto plano. Cualquier etiqueta HTML, formato enriquecido o script enviado debe ser rechazado o sanitizado automáticamente. | historias-de-usuario.md (HU-03) |
| BR-004 | La lista de seguidores del usuario se oculta o visualiza a terceros de acuerdo con la opción explícita de privacidad (pública o privada) configurada por el titular de la cuenta. | historias-de-usuario.md (HU-03) y decisión de usuario |
| BR-005 | Los enlaces de recuperación de contraseña son tokens estrictamente de un solo uso y poseen un tiempo de vigencia limitado. Tras ser utilizados o expirar, pierden toda validez. | historias-de-usuario.md (HU-04) |
| BR-006 | Por motivos de seguridad y prevención de enumeración de usuarios, la respuesta visual ante una solicitud de recuperación de contraseña debe ser idéntica independientemente de si el correo está registrado o no. | historias-de-usuario.md (HU-04) |
| BR-007 | Las cuentas registradas exclusivamente con apodo/nombre de usuario y sin correo electrónico asociado quedan fuera del alcance del mecanismo de recuperación de contraseña en la versión MVP. | historias-de-usuario.md (HU-04) y decisión de usuario |
| BR-008 | Las ofertas cuya fecha y hora de vigencia hayan expirado deben ser excluidas automáticamente del feed principal de promociones. | historias-de-usuario.md (HU-06) y decisión del proyecto |
| BR-009 | Solo el autor original de una publicación o un Administrador del sistema tienen permisos para modificar o eliminar una oferta comunitaria existente. | historias-de-usuario.md (HU-08) |
| BR-010 | El registro de una nueva oferta en la base de datos debe ser una operación asíncrona respecto al despacho de notificaciones a seguidores para asegurar una respuesta web inmediata. | historias-de-usuario.md (HU-05) |
| BR-011 | Las ofertas cuyo periodo de vigencia haya expirado deben ocultarse automáticamente del feed de la comunidad y del ranking de relevancia. | Decisión de usuario en la conversación |
| BR-012 | Un usuario no puede calificar sus propias publicaciones ni establecer una relación de seguimiento hacia su propia cuenta. | historias-de-usuario.md (HU-11, HU-13) |
| BR-013 | Cada usuario autenticado puede emitir únicamente una calificación por oferta (de 1 a 5 estrellas). Si el usuario emite una nueva valoración sobre la misma oferta, esta reemplaza a la anterior. | historias-de-usuario.md (HU-11) |
| BR-014 | El mapa interactivo de la plataforma mostrará únicamente las ofertas y puntos de venta extraídos por el bot automatizado; las ofertas comunitarias de usuarios quedan excluidas de dicha vista geográfica. | Decisión de usuario en la conversación |
| BR-015 | La visibilidad de la lista de seguidores es configurable por cada usuario. Si el usuario marca sus seguidores como privados, ningún otro usuario podrá ver dicha lista en su perfil. | historias-de-usuario.md (HU-14) y decisiones del usuario en la conversación |
| BR-016 | El posicionamiento en el listado de cazadores de ofertas se calcula agregando las calificaciones positivas acumuladas en todas las publicaciones históricas vigentes publicadas por dicho usuario. | historias-de-usuario.md (HU-16) |
| BR-017 | La ejecución automatizada del bot de extracción se realizará diariamente una vez al día a las 3:00 a. m. intentando procesar las cadenas Éxito, Carulla, Olímpica y Jumbo. | bot-de-ofertas-y-notificaciones-telegram-componente-existente y decisiones del usuario en la conversación |
| BR-018 | El mapa interactivo de ofertas mostrará exclusivamente puntos de venta y promociones recopiladas por el bot de supermercados, excluyendo ofertas publicaciones comunitarias. | respuesta del usuario en la conversación |
| BR-019 | La falla o fallo de parsing de una cadena de supermercados no debe interferir con la recolección de otras cadenas ni invalidar las ofertas anteriores no vencidas de la cadena afectada. | historias-de-usuario.md (HU-18) |
| BR-020 | Toda alerta por fallo de extracción generada hacia el operador del bot debe ser entregada en un plazo máximo de 5 minutos desde la detección del evento. | historias-de-usuario.md (HU-19) |
| BR-021 | La vinculación de Telegram se realiza mediante tokens o enlaces temporales de un solo uso, garantizando que en ningún momento se solicite ni se almacene el número telefónico del usuario. | historias-de-usuario.md (HU-23) |
| BR-022 | El envío de notificaciones por Telegram se procesa de forma asíncrona a un máximo de 30 mensajes por segundo. Un fallo en Telegram no debe impedir ni retrasar la confirmación de la publicación en la web. | historias-de-usuario.md (HU-24) |
| BR-023 | Un usuario no puede duplicar reportes sobre la misma publicación; sólo se permite un reporte por usuario por contenido. | historias-de-usuario.md (HU-26) |
| BR-024 | Las funciones de moderación y retiro de contenido están restringidas exclusivamente al rol de Administrador. Toda eliminación debe generar un registro inmutable con identificador de administrador, publicación afectada y timestamp. | historias-de-usuario.md (HU-27) |
| BR-025 | Una publicación que alcanza el umbral N de reportes activos es retirada inmediatamente del feed público y colocada en estado de revisión dentro de la cola de moderación. | historias-de-usuario.md (HU-28) |
| BR-026 | La aplicación de una sanción requiere obligatoriamente una categoría predefinida y un motivo descriptivo. La escala de progresión estándar es: Suspensión por 3 días → Suspensión por 2 semanas → Baneo definitivo. | historias-de-usuario.md (HU-29) |
| BR-027 | El bloqueo de reingreso para cuentas en estado Baneado se evalúa de manera estricta y exclusiva sobre la dirección de correo electrónico registrada. | historias-de-usuario.md (HU-30) y decisión de usuario |
| BR-028 | El panel de estado e inspección de ejecuciones del bot de scraping es accesible únicamente para usuarios que posean el rol de Administrador. | historias-de-usuario.md (HU-31) |
| BR-029 | Al desactivar una fuente de scraping, las ejecuciones programadas ignorarán dicha fuente, pero toda la información de ofertas previamente recopilada permanecerá intacta y visible. | historias-de-usuario.md (HU-32) |
| BR-030 | Los respaldos periódicos del sistema deben incluir tanto la base de datos relacional como el almacenamiento de archivos de imágenes para garantizar una restauración completa e íntegra. | historias-de-usuario.md (HU-34) |

## 10. Flujos principales y alternativos
### FL-01 — Registro de usuario (principal)
1. Visitante accede al formulario
2. Ingresa datos
3. Sistema valida formato y unicidad
4. Sistema envía verificación (si aplica)
5. Usuario verifica
6. Acceso concedido
*Requisitos:* RF-001

### FL-02 — Edición de perfil y privacidad (principal)
1. El usuario autenticado ingresa a la sección de configuración de su perfil.
2. El usuario modifica su apodo, foto de perfil o biografía en texto plano.
3. El usuario selecciona la opción de privacidad para la visibilidad de sus seguidores (pública o privada).
4. El usuario presiona la opción para guardar los cambios.
5. El sistema valida los datos ingresados y actualiza la información del perfil en la plataforma.
*Requisitos:* RF-003, RF-004

### FL-03 — Restablecimiento de contraseña por correo (principal)
1. El usuario no autenticado o registrado accede a la pantalla de recuperación de contraseña.
2. El usuario ingresa su dirección de correo electrónico y confirma el envío.
3. El sistema procesa la solicitud y muestra un mensaje genérico de confirmación al usuario.
4. Si el correo existe en el sistema, la plataforma genera un token único con vencimiento y envía el enlace por correo.
5. El usuario abre el enlace recibido en su correo electrónico antes de que expire.
6. El usuario ingresa y confirma su nueva contraseña cumpliendo las políticas de seguridad.
7. El sistema actualiza la contraseña de la cuenta, invalida el token y permite al usuario iniciar sesión con su nueva clave.
*Requisitos:* RF-005

### FL-04 — Intento de recuperación con enlace inválido o expirable (excepcion)
1. El usuario hace clic en un enlace de recuperación de contraseña que ya expiró o fue utilizado.
2. El sistema valida la firma y estado del token y detecta que no es válido.
3. El sistema notifica al usuario que el enlace no es válido o ha caducado.
4. El sistema ofrece un acceso directo para solicitar un nuevo enlace de restablecimiento.
*Requisitos:* RF-005

### FL-05 — Publicación asistida de oferta comunitaria (principal)
1. El Estudiante / Cazador de ofertas inicia la creación de oferta desde la web.
2. Paso 1: Selecciona una foto desde la galería o la toma con la cámara. El sistema valida el formato y comprime la imagen a ~2 MB.
3. Paso 2: El usuario ingresa precio, ubicación y fecha/hora de vigencia.
4. Paso 3: El usuario redacta una breve descripción y presiona 'Publicar'.
5. El sistema valida que todos los campos requeridos estén completos, guarda la oferta asignando la autoría al usuario autenticado y la despliega inmediatamente en el feed.
6. El sistema encola en segundo plano las notificaciones sin bloquear la respuesta web.
*Requisitos:* RF-006

### FL-06 — Ocultamiento automático de oferta por término de vigencia (excepcion)
1. El tiempo transcurre hasta alcanzar o superar la fecha y hora de vencimiento especificada en una oferta.
2. El sistema actualiza el estado de la oferta a expirada.
3. Cualquier consulta posterior al feed de ofertas filtra y excluye la oferta expirada.
*Requisitos:* RF-007

### FL-07 — Edición o eliminación de oferta por el autor (principal)
1. El autor navega a su publicación y selecciona 'Editar' o 'Eliminar'.
2. Si selecciona 'Editar', modifica los campos necesarios y confirma; el sistema valida los datos y actualiza la oferta en el feed.
3. Si selecciona 'Eliminar', confirma la remoción; el sistema quita la oferta del feed y la desactiva.
*Requisitos:* RF-008

### FL-08 — Navegación y alternancia de ordenamiento en el feed (principal)
1. El usuario accede a la sección principal del feed de la plataforma.
2. El sistema consulta las ofertas vigentes no expiradas y aplica el criterio de orden predeterminado ('más relevantes').
3. El usuario visualiza la primera tanda de tarjetas con la información básica (foto, descripción, ubicación, autor, calificación).
4. El usuario interactúa con el selector de orden y escoge 'más recientes'.
5. El sistema recarga la lista mostrando las ofertas ordenadas cronológicamente por fecha de publicación.
6. El usuario hace scroll hacia abajo y el sistema carga la siguiente tanda de ofertas.
*Requisitos:* RF-009, RF-011

### FL-09 — Calificación de una oferta por un usuario autenticado (principal)
1. El usuario autenticado visualiza una tarjeta de oferta publicada por otro cazador de ofertas.
2. El usuario selecciona la cantidad de estrellas a asignar (entre 1 y 5).
3. El sistema valida que el usuario autenticado no sea el autor de la oferta.
4. El sistema registra o actualiza el voto del usuario y recomputa el promedio global de estrellas de la publicación.
5. El sistema actualiza la interfaz mostrando el nuevo puntaje promedio.
*Requisitos:* RF-010

### FL-10 — Seguimiento y cancelación de seguimiento a un usuario (principal)
1. El usuario autenticado navega hasta el perfil de otro cazador de ofertas.
2. El usuario hace clic en el botón 'Seguir'.
3. El sistema verifica que la relación no exista previamente y que no sea un autoseguimiento.
4. El sistema almacena la relación de seguimiento y cambia la etiqueta del botón a 'Dejar de seguir'.
5. En un momento posterior, el usuario pulsa 'Dejar de seguir'.
6. El sistema remueve el registro de seguimiento y restaura la etiqueta del botón a 'Seguir'.
*Requisitos:* RF-012

### FL-11 — Consultar lista de seguidores/seguidos y gestionar conexiones (principal)
1. El usuario autenticado ingresa a su perfil o al perfil de otro usuario.
2. El usuario selecciona la pestaña 'Seguidores' o 'Siguiendo'.
3. El sistema evalúa si la lista es accesible según las reglas de privacidad.
4. Si es accesible, el sistema despliega la lista de usuarios.
5. El usuario selecciona a un usuario de la lista y realiza acciones como ver perfil o dejar de seguir.
*Requisitos:* RF-013

### FL-12 — Filtrar feed por ofertas de usuarios seguidos (principal)
1. El usuario autenticado ingresa a la vista principal del feed de ofertas.
2. El usuario activa la pestaña o filtro 'Siguiendo'.
3. El sistema valida si el usuario sigue a al menos una cuenta.
4. Si sigue a usuarios, consulta y presenta únicamente publicaciones de dichos creadores.
5. Si no sigue a nadie, el sistema muestra un estado vacío informativo incentivando a descubrir cazadores.
*Requisitos:* RF-014

### FL-13 — Explorar ranking de mejores cazadores de ofertas (principal)
1. El usuario navega a la sección de descubrimiento de cazadores de ofertas.
2. El sistema recupera los usuarios ordenados descendentemente por su puntaje o calificación acumulada.
3. El usuario revisa los perfiles del ranking y presiona el botón 'Seguir' en los de su interés.
*Requisitos:* RF-015

### FL-14 — Ejecución programada diaria de scraping de ofertas (principal)
1. A las 3:00 a. m., el programador de tareas activa el bot `bot_ofertas`.
2. El bot consulta el archivo `robots.txt` y los parsers configurados para las cadenas (Éxito, Carulla, Olímpica, Jumbo).
3. El bot realiza peticiones respetando tiempos de espera y extrae promociones vigentes.
4. El bot valida si cada oferta ya existe en la base de datos para no duplicar.
5. Las ofertas no duplicadas se guardan normalizadas en el sistema.
*Requisitos:* RF-016

### FL-15 — Consulta e interacción de ofertas de supermercado mediante el mapa (principal)
1. El usuario navega hacia la sección del mapa interactivo.
2. El sistema recupera los puntos de venta con ofertas de supermercado vigentes y los renderiza como marcadores.
3. El usuario selecciona un marcador específico correspondiente a una tienda.
4. El sistema despliega el detalle de promociones vigentes de la tienda (producto, precio, vigencia, fuente).
5. El usuario opcionalmente cambia a la vista de tabla ordenada para realizar la comparación de precios.
*Requisitos:* RF-019, RF-020

### FL-16 — Manejo de excepciones durante la extracción de ofertas y alerta al operador (excepcion)
1. El bot de ofertas inicia la ejecución programada de scraping.
2. Una fuente de supermercado responde con error, bloqueo o cambio de estructura HTML.
3. El sistema captura la excepción, conserva las ofertas previas aún vigentes de dicha fuente y continúa con las demás cadenas.
4. El sistema estructura una alerta de fallo incluyendo el JSON crudo del error.
5. El sistema envía la notificación vía Telegram al operador del bot en menos de 5 minutos.
6. En caso de fallo de red en el canal de Telegram, el sistema reintenta el envío en cola hasta su entrega satisfactoria.
*Requisitos:* RF-017, RF-018

### FL-17 — Vinculación y desvinculación con Telegram (principal)
1. El usuario autenticado solicita vincular Telegram desde la web.
2. El sistema genera un código o enlace único con tiempo de vencimiento.
3. El usuario envía el código al bot de Telegram.
4. El bot valida el código, asocia la cuenta y confirma 'Vinculado' en el bot y en la web.
5. El usuario puede solicitar desvincular su cuenta en cualquier momento desde la web.
*Requisitos:* RF-021

### FL-18 — Envío de alerta por publicación de usuario seguido (principal)
1. Un usuario publica una oferta en la plataforma web.
2. El sistema confirma la publicación al autor de inmediato.
3. El sistema identifica a los seguidores con Telegram vinculado.
4. El sistema envía las alertas por Telegram regulando la tasa a 30 mensajes/segundo.
5. Los seguidores reciben el mensaje con autor, resumen y enlace.
*Requisitos:* RF-022

### FL-19 — Reporte de contenido sospechoso (principal)
1. El usuario visualiza una publicación sospechosa o inapropiada.
2. El usuario hace clic en reportar e indica el motivo.
3. El sistema verifica que no existe reporte previo del mismo usuario.
4. El reporte es enviado a la cola de moderación del administrador.
*Requisitos:* RF-023

### FL-20 — Moderación de contenido por el administrador (principal)
1. El administrador accede a la cola de reportes.
2. El administrador revisa la publicación reportada y aprueba su retiro.
3. El sistema oculta la publicación del feed.
4. El sistema registra el evento de moderación con autor, fecha e ID de publicación.
*Requisitos:* RF-024

### FL-21 — Ocultamiento automático por acumulación de reportes (principal)
1. Un usuario envía un reporte sobre una publicación.
2. El sistema incrementa el contador de reportes de la publicación.
3. El sistema compara el total de reportes acumulados contra el umbral N configurado.
4. Al alcanzar N reportes, el sistema cambia el estado de la publicación a 'Auto-ocultada' y la retira del feed público.
5. El sistema indexa la publicación en la cola de moderación del Administrador.
*Requisitos:* RF-025

### FL-22 — Aplicación de sanción progresiva a usuario (principal)
1. El Administrador selecciona a un usuario en el panel de moderación.
2. El Administrador selecciona la categoría de la infracción e ingresa el motivo descriptivo.
3. El Administrador confirma el nivel de sanción a aplicar (3 días, 2 semanas o Baneo definitivo).
4. El sistema actualiza el estado de la cuenta, registra la traza de auditoría y notifica al usuario con los detalles de la sanción.
5. Si el usuario intenta autenticarse o hacer peticiones autenticadas, el sistema le deniega el acceso.
*Requisitos:* RF-026

### FL-23 — Verificación de bloqueo de correo al registrarse (principal)
1. El Visitante ingresa sus datos e email en el formulario de registro.
2. El sistema valida si la dirección de correo se encuentra asociada a una cuenta con estado Baneado.
3. Si está baneado, el sistema rechaza el registro y muestra un mensaje de restricción.
4. Si no está baneado, el sistema continúa con el flujo estándar de registro.
*Requisitos:* RF-027

### FL-24 — Supervisión del estado de las fuentes de scraping (principal)
1. El Administrador ingresa a la sección de supervisión del bot.
2. El sistema consulta el historial de ejecuciones por cada cadena (Éxito, Carulla, Olímpica, Jumbo).
3. El sistema despliega la fecha/hora de última ejecución, el resultado (éxito/fallo) y los detalles técnicos del error en caso de falla.
*Requisitos:* RF-028

### FL-25 — Ejecución manual de una fuente del bot (principal)
1. El Administrador ingresa al panel de control de fuentes del bot.
2. El Administrador selecciona una fuente específica y presiona la opción 'Ejecutar manualmente'.
3. El sistema inicia el proceso de scraping inmediatamente para la fuente seleccionada.
4. El sistema actualiza el panel mostrando el estado y el resultado de la ejecución.
*Requisitos:* RF-029

### FL-26 — Desactivación de una fuente del bot (alternativo)
1. El Administrador ingresa al panel de fuentes.
2. El Administrador cambia el estado de una fuente activa a 'Inactiva'.
3. El sistema guarda el cambio y omite esta fuente en las siguientes ejecuciones automáticas programadas.
*Requisitos:* RF-029

### FL-27 — Publicación guiada de ofertas en dispositivos móviles y de escritorio (principal)
1. El Estudiante / Cazador de ofertas presiona el botón para publicar una oferta desde un navegador móvil o de escritorio.
2. El sistema muestra el Paso 1 (Fotografía de la oferta) y el usuario sube/captura la imagen.
3. El sistema muestra el Paso 2 (Precio, ubicación y fecha de vigencia) y el usuario ingresa la información.
4. El sistema muestra el Paso 3 (Descripción breve y confirmación) y el usuario finaliza la publicación.
5. El sistema publica la oferta en el feed y notifica al usuario.
*Requisitos:* RF-030

## 11. Casos límite
| ID | Caso | Requisitos | Tratamiento |
|---|---|---|---|
| CL-01 | Intento de registro con usuario ya existente. | RF-001 | Mostrar error claro sin limpiar campos del formulario. |
| CL-02 | Expiración de sesión durante una interacción. | RF-002 | Redirigir al usuario al inicio de sesión tras superar los 30 minutos. |
| CL-03 | Ingreso de formato de biografía con caracteres especiales o código ejecutable (XSS/HTML). | RF-003 | El sistema procesa y almacena el contenido únicamente como texto plano, sanitizando o codificando caracteres especiales para evitar inyecciones o renderizado web indeseado. |
| CL-04 | Uso reiterado de un enlace de recuperación de contraseña finalizado. | RF-005 | El sistema rechaza la petición, invalida la sesión de recuperación actual y orienta al usuario para generar una nueva solicitud. |
| CL-05 | Solicitud de recuperación de contraseña de usuario sin correo electrónico registrado. | RF-005 | Debido a la exclusión del MVP para este tipo de cuentas, el sistema indica al usuario que la cuenta no cuenta con correo asociado y debe contactar soporte o administración. |
| CL-06 | Fallo en la subida de la imagen durante el paso 1 o al presionar publicar. | RF-006 | El sistema cancela el proceso de guardado de la oferta, notifica el error de imagen al usuario y conserva todos los campos de texto previamente completados para evitar el reingreso manual. |
| CL-07 | Intento de edición o eliminación de oferta por parte de un usuario no autor mediante manipulación directa de la URL o peticiones a la API. | RF-008 | El backend valida la identidad del solicitante contra el id del autor original de la oferta; si no coinciden, rechaza la solicitud retornando un error HTTP 403 Forbidden. |
| CL-08 | Expiración de la oferta mientras un usuario navega activamente sobre su vista de detalle. | RF-007 | La oferta muestra un indicador visual de que su tiempo ha finalizado y al recargar la página o volver al feed ya no figurará en la lista general. |
| CL-09 | Intento de interacción social (calificar o seguir) sobre la propia cuenta o contenido del usuario. | RF-010, RF-012 | El sistema deshabilita visualmente los controles de calificación en publicaciones propias y oculta el botón de seguimiento en el perfil propio. En caso de invocaciones directas por API, el backend rechaza la petición con una respuesta de error adecuada. |
| CL-10 | Intento de calificación por parte de un visitante no autenticado. | RF-010 | Al presionar la barra de estrellas en cualquier oferta, el sistema bloquea el registro de la puntuación y despliega de inmediato una ventana modal indicando que se requiere iniciar sesión. |
| CL-11 | Feed sin publicaciones o con todas las ofertas vencidas. | RF-009 | El sistema renderiza un componente de estado vacío informando que actualmente no hay promociones activas e invitando a la comunidad a publicar nuevas ofertas. |
| CL-12 | Usuario consulta el perfil de un cazador de ofertas que tiene configurada la privacidad de seguidores como 'Privado'. | RF-013 | El sistema oculta la pestaña/lista de seguidores y muestra una etiqueta indicando que la lista de seguidores es privada. |
| CL-13 | Usuario activa el filtro 'Siguiendo' en el feed pero la lista de usuarios seguidos no ha publicado ofertas activas o vigentes. | RF-014 | El sistema despliega un mensaje aclaratorio indicando que los usuarios seguidos no tienen ofertas vigentes publicadas actualmente. |
| CL-14 | El sitio web de una cadena de supermercados (ej. Éxito o Carulla) se encuentra fuera de servicio o no responde durante la corrida de las 3:00 a. m. | RF-016 | El scraper captura la excepción de conexión, registra el fallo en el log del sistema, notifica al operador si aplica y continua con la extracción de las demás cadenas soportadas sin interrumpir la app. |
| CL-15 | Ausencia total de ofertas de supermercado vigentes al momento de abrir el mapa. | RF-019 | El sistema renderiza el mapa sin marcadores y despliega una alerta visual clara informando que no existen ofertas de supermercados disponibles actualmente. |
| CL-16 | Fallo persistente en la conexión hacia la API de Telegram al notificar una alerta de extracción al operador. | RF-018 | El sistema almacena el mensaje y el payload JSON crudo en un buzón de reintentos con reintentos exponenciales hasta restablecer la conexión y garantizar la entrega. |
| CL-17 | Uso de código de vinculación de Telegram vencido o invalido | RF-021 | El bot rechaza el código, explica cómo generar uno nuevo y la web ofrece la opción de solicitar otro código. |
| CL-18 | Fallo o timeout en la API de Telegram durante envío de notificaciones | RF-022 | La publicación web se realiza sin error para el autor y el envío de la notificación se reintenta según la política establecida. |
| CL-19 | Intento de moderación por parte de un usuario no administrador | RF-024 | El sistema deniega el acceso con error de autorización y no permite modificar la cola de reportes. |
| CL-20 | Recepción concurrente de múltiples reportes sobre la misma publicación superando el umbral N. | RF-025 | El sistema garantiza la ejecución atómica del incremento de reportes y cambia el estado a auto-ocultada en la primera transacción que iguale o supere el umbral N. |
| CL-21 | Intento de enviar un formulario de sanción sin seleccionar la categoría obligatoria. | RF-026 | El sistema bloquea la acción en el frontend/backend, indicando que la categoría de infracción es un campo obligatorio. |
| CL-22 | Registro con un correo electrónico baneado utilizando variaciones de mayúsculas o minúsculas. | RF-027 | El sistema normaliza la dirección de correo a minúsculas antes de la verificación contra la lista de usuarios baneados. |
| CL-23 | Consulta del panel de supervisión de fuentes cuando el bot aún no ha realizado ninguna ejecución. | RF-028 | El sistema presenta un estado informativo 'Sin ejecuciones registradas' para cada una de las cadenas configuradas. |
| CL-24 | Solicitud de ejecución manual sobre una fuente que ya está ejecutando un proceso de scraping en curso. | RF-029 | El sistema deshabilita la opción o notifica al Administrador que la fuente ya se encuentra en ejecución, evitando llamadas concurrentes sobre el mismo sitio. |
| CL-25 | Fallo de conexión o interrupción durante el proceso de restauración desde un respaldo periódicamente generado. | RF-031 | El sistema debe ejecutar la restauración dentro de una transacción o estado seguro, revirtiendo cambios si ocurre una falla y alertando al Administrador. |

## 12. Restricciones
| ID | Restricción | Confirmada | Fuente |
|---|---|---|---|
| RES-01 | El módulo de extracción de ofertas debe utilizar la arquitectura e interfaz del paquete existente `bot_ofertas` en Python y la biblioteca BeautifulSoup4. | Sí | bot-de-ofertas-y-notificaciones-telegram-componente-existente |
| RES-02 | Las notificaciones externas se realizarán exclusivamente a través del Bot API de Telegram utilizando la variable de entorno TELEGRAM_BOT_TOKEN. | Sí | bot-de-ofertas-y-notificaciones-telegram-componente-existente |
| RES-03 | El bot de web scraping debe cumplir con las políticas de cada sitio web respetando el archivo `robots.txt` e identificándose con User-Agent propio. | Sí | historias-de-usuario.md (HU-17) y bot-de-ofertas-y-notificaciones-telegram-componente-existente |
| RES-04 | El bloqueo de reingreso para usuarios baneados se aplicará de forma estricta únicamente por la dirección de correo electrónico. | Sí | historias-de-usuario.md (HU-30) y decisión de usuario |
| RES-05 | El mapa interactivo de ofertas mostrará de forma exclusiva los puntos de venta y ofertas recopiladas por el bot de supermercados. | Sí | respuesta del usuario en la conversación |
| RES-06 | La publicación de ofertas por parte de los usuarios debe ceñirse estrictamente al flujo asistido de 3 pasos (1. Foto, 2. Precio, ubicación y vigencia, 3. Descripción breve). | Sí | historias-de-usuario.md (HU-05) y decisión de usuario |

## 13. Dependencias
| ID | Dependencia | Fuente |
|---|---|---|
| DEP-01 | API de Telegram (Telegram Bot API) para el envío de alertas instantáneas y procesamiento de comandos de vinculación (/start). | historias-de-usuario.md (HU-23, HU-24) y bot-de-ofertas-y-notificaciones-telegram-componente-existente |
| DEP-02 | Disponibilidad y accesibilidad de los buscadores públicos de catálogo web de las cadenas Éxito, Carulla, Olímpica y Jumbo. | bot-de-ofertas-y-notificaciones-telegram-componente-existente |
| DEP-03 | Archivos de configuración locales `fuentes.json` y `sedes.json` con datos geográficos (latitud y longitud) precisos de las sedes físicas en Manizales. | bot-de-ofertas-y-notificaciones-telegram-componente-existente |

## 14. Fuera de alcance
- Desarrollo de aplicaciones móviles nativas para iOS o Android.
- Mecanismos de recuperación de contraseña para cuentas registradas exclusivamente con nombre de usuario (sin correo).
- Visualización de ofertas comunitarias creadas por usuarios dentro del mapa de ofertas (reservado únicamente para supermercados).
- Exigencia de correo institucional para el registro de usuarios.
- Bloqueo o identificación de reingreso de usuarios baneados por ID de dispositivo o huella digital de hardware.
- Procesamiento e historias descartadas previamente por el equipo (HU-07, HU-10, HU-22, HU-25 y HU-35).

## 15. Supuestos
| ID | Supuesto | Motivo |
|---|---|---|
| SUP-01 | Se asume que los administradores completarán las coordenadas geográficas (latitud, longitud) en `sedes.json` para la visualización correcta de las tiendas en el mapa. | El componente existente especifica que `sedes.json` no incluye coordenadas por defecto. |
| SUP-02 | Se asume que la mayoría de los usuarios objetivo (estudiantes) disponen de un dispositivo inteligente con acceso a navegador web y conexión a datos. | La plataforma está diseñada mobile-first y no contempla aplicaciones nativas. |
| SUP-03 | Se asume que las cadenas de supermercados no implementarán mecanismos agresivos Anti-Bot (ej. Captcha) en sus catálogos públicos durante las horas no pico. | El scraper realiza peticiones con esperas respetando robots.txt mediante biblioteca estándar y BeautifulSoup. |

## 16. Preguntas abiertas y decisiones pendientes
| ID | Pregunta | Responsable | Impacto | Bloqueante |
|---|---|---|---|---|
| OPEN-Q-001 | ¿Cuál es la fórmula o ponderación exacta entre la calificación promedio y la cercanía al vencimiento (vigencia) para el ordenamiento del feed por relevancia? | Producto / Negocio | Afecta la posición exacta de las tarjetas en la vista de ofertas más relevantes. | No |
| OPEN-Q-002 | ¿Cuál es la política detallada de reintentos (número de reintentos y tiempo de espera) ante fallos en la entrega de notificaciones por Telegram? | Equipo de Desarrollo | Define la gestión del almacenamiento en cola de notificaciones pendientes. | No |
| OPEN-Q-003 | ¿Puede un administrador saltar los niveles intermedios de la sanción progresiva (suspensión de 3 días / 2 semanas) y aplicar un baneo definitivo directo ante infracciones graves? | Producto / Negocio | Afecta la flexibilidad del panel de administración en la aplicación de disciplina a usuarios. | No |

## 17. Propuestas del agente (no aprobadas)
| ID | Propuesta | Motivo |
|---|---|---|
| PROP-01 | Incluir en el panel de administración una opción para editar directamente las coordenadas (latitud/longitud) de las sedes en `sedes.json` sin tocar código. | Facilita al administrador la actualización de ubicaciones de supermercados para el mapa. |

## 18. Trazabilidad con las historias de usuario
| Historia | Requisitos | Criterios |
|---|---|---|
| HU-01 | RF-001 | 7 |
| HU-02 | RF-002 | 6 |
| HU-03 | RF-003, RF-004 | 6 |
| HU-04 | RF-005 | 4 |
| HU-05 | RF-006 | 9 |
| HU-06 | RF-007 | 3 |
| HU-08 | RF-008 | 3 |
| HU-09 | RF-009 | 4 |
| HU-11 | RF-010 | 4 |
| HU-12 | RF-011 | 3 |
| HU-13 | RF-012 | 4 |
| HU-14 | RF-013 | 3 |
| HU-15 | RF-014 | 2 |
| HU-16 | RF-015 | 2 |
| HU-17 | RF-016 | 5 |
| HU-18 | RF-017 | 4 |
| HU-19 | RF-018 | 2 |
| HU-20 | RF-019 | 4 |
| HU-21 | RF-020 | 2 |
| HU-23 | RF-021 | 5 |
| HU-24 | RF-022 | 5 |
| HU-26 | RF-023 | 2 |
| HU-27 | RF-024 | 3 |
| HU-28 | RF-025 | 3 |
| HU-29 | RF-026 | 4 |
| HU-30 | RF-027 | 2 |
| HU-31 | RF-028 | 4 |
| HU-32 | RF-029 | 2 |
| HU-33 | RF-030 | 3 |
| HU-34 | RF-031 | 4 |
| HU-07 | Excluida | Descartada por decisión del equipo en la consolidación inicial de historias. |
| HU-10 | Excluida | Descartada por decisión del equipo en la consolidación inicial de historias. |
| HU-22 | Excluida | Descartada por decisión del equipo en la consolidación inicial de historias. |
| HU-25 | Excluida | Descartada por decisión del equipo en la consolidación inicial de historias. |
| HU-35 | Excluida | Descartada por decisión del equipo en la consolidación inicial de historias. |

## 18b. Trazabilidad de requisitos
| Requisito | Historias | Origen | Fuente | Criterios | Flujos |
|---|---|---|---|---|---|
| RF-001 | HU-01 | documento | historias-de-usuario.md (HU-01) | AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007 | FL-01 |
| RF-002 | HU-02 | documento | historias-de-usuario.md (HU-02) | AC-008, AC-009, AC-010, AC-011, AC-012, AC-013 | — |
| RF-003 | HU-03 | documento | historias-de-usuario.md (HU-03) | AC-014, AC-015, AC-016 | FL-02 |
| RF-004 | HU-03 | documento | historias-de-usuario.md (HU-03) y decisión de usuario | AC-017, AC-018, AC-019 | FL-02 |
| RF-005 | HU-04 | documento | historias-de-usuario.md (HU-04) y decisión de usuario | AC-020, AC-021, AC-022, AC-023 | FL-03, FL-04 |
| RF-006 | HU-05 | documento | historias-de-usuario.md (HU-05) | AC-024, AC-025, AC-026, AC-027, AC-028, AC-029, AC-030, AC-031, AC-032 | FL-05 |
| RF-007 | HU-06 | documento | historias-de-usuario.md (HU-06) y decisiones del proyecto | AC-033, AC-034, AC-035 | FL-06 |
| RF-008 | HU-08 | documento | historias-de-usuario.md (HU-08) | AC-036, AC-037, AC-038 | FL-07 |
| RF-009 | HU-09 | documento | historias-de-usuario.md (HU-09) | AC-039, AC-040, AC-041, AC-042 | FL-08 |
| RF-010 | HU-11 | documento | historias-de-usuario.md (HU-11) | AC-043, AC-044, AC-045, AC-046 | FL-09 |
| RF-011 | HU-12 | documento | historias-de-usuario.md (HU-12) | AC-047, AC-048, AC-049 | FL-08 |
| RF-012 | HU-13 | documento | historias-de-usuario.md (HU-13) | AC-050, AC-051, AC-052, AC-053 | FL-10 |
| RF-013 | HU-14 | documento | historias-de-usuario.md (HU-14) | AC-054, AC-055, AC-056 | FL-11 |
| RF-014 | HU-15 | documento | historias-de-usuario.md (HU-15) | AC-057, AC-058 | FL-12 |
| RF-015 | HU-16 | documento | historias-de-usuario.md (HU-16) | AC-059, AC-060 | FL-13 |
| RF-016 | HU-17 | documento | historias-de-usuario.md (HU-17) y decisiones del usuario en la conversación | AC-061, AC-062, AC-063, AC-064, AC-065 | FL-14 |
| RF-017 | HU-18 | documento | historias-de-usuario.md (HU-18) | AC-066, AC-067, AC-068, AC-069 | FL-16 |
| RF-018 | HU-19 | documento | historias-de-usuario.md (HU-19) | AC-070, AC-071 | FL-16 |
| RF-019 | HU-20 | documento | historias-de-usuario.md (HU-20) | AC-072, AC-073, AC-074, AC-075 | FL-15 |
| RF-020 | HU-21 | documento | historias-de-usuario.md (HU-21) | AC-076, AC-077 | FL-15 |
| RF-021 | HU-23 | documento | historias-de-usuario.md (HU-23) | AC-078, AC-079, AC-080, AC-081, AC-082 | FL-17 |
| RF-022 | HU-24 | documento | historias-de-usuario.md (HU-24) | AC-083, AC-084, AC-085, AC-086, AC-087 | FL-18 |
| RF-023 | HU-26 | documento | historias-de-usuario.md (HU-26) | AC-088, AC-089 | FL-19 |
| RF-024 | HU-27 | documento | historias-de-usuario.md (HU-27) | AC-090, AC-091, AC-092 | FL-20 |
| RF-025 | HU-28 | documento | historias-de-usuario.md (HU-28) | AC-093, AC-094, AC-095 | FL-21 |
| RF-026 | HU-29 | documento | historias-de-usuario.md (HU-29) | AC-096, AC-097, AC-098, AC-099 | FL-22 |
| RF-027 | HU-30 | documento | historias-de-usuario.md (HU-30) | AC-100, AC-101 | FL-23 |
| RF-028 | HU-31 | documento | historias-de-usuario.md (HU-31) | AC-102, AC-103, AC-104, AC-105 | FL-24 |
| RF-029 | HU-32 | documento | historias-de-usuario.md (HU-32) | AC-106, AC-107 | FL-25, FL-26 |
| RF-030 | HU-33 | documento | historias-de-usuario.md (HU-33) | AC-108, AC-109, AC-110 | FL-27 |
| RF-031 | HU-34 | documento | historias-de-usuario.md (HU-34) | AC-111, AC-112, AC-113, AC-114 | — |

## 19. Historial de cambios
- v0.2: Definición inicial del marco de la SPEC recopilando alcance, RNF, dependencias, supuestos y restricciones basados en las 30 HU y el componente de scraping existente.
- v0.2: SPEC generada por lotes: marco + 9 lotes de historias de usuario.
