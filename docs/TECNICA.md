# Cómo está hecho Entre apuntes

## Arquitectura

Es un sitio estático: el navegador descarga HTML, CSS, JavaScript y un catálogo JSON desde GitHub Pages. JavaScript lee el catálogo y construye las vistas. Buscar y filtrar ocurre en el navegador; no envía las búsquedas a un servidor propio.

| Tecnología | Función |
| --- | --- |
| HTML | Estructura, navegación, formularios y diálogo de las fichas. |
| CSS | Diseño adaptable, temas, foco visible y ajustes de movimiento/contraste. |
| JavaScript nativo | Búsqueda, filtros, rutas por fragmento, calendario y fichas. |
| JSON | Datos de materias, recursos, fechas y enlaces. |
| Git y GitHub | Historial de cambios, issues, ramas y pull requests. |
| GitHub Pages | Publicación del sitio estático desde `main`. |
| GitHub Actions | Validación automática en cada push y pull request. |
| Python 3 | Valida el catálogo y permite servirlo localmente para desarrollo. |
| Node.js | Comprueba sintaxis y ejecuta las pruebas con módulos incorporados. |
| Google Drive | Aloja los documentos y ofrece su vista previa bajo demanda. |

No hay framework, proceso de compilación, paquetes npm/pip de aplicación, base de datos, API propia ni inicio de sesión propio. Python y Node.js son herramientas de desarrollo: quien visita el sitio no necesita instalarlas. PDF.js no forma parte de esta implementación.

## Mapa de archivos

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Entrada de Pages: redirige a `dist/` conservando fragmento y consulta. |
| `dist/index.html` | Estructura base y carga de estilos y scripts. |
| `dist/app.js` | Vistas, navegación, búsqueda, calendario y fichas. |
| `dist/styles.css` | Diseño y variables de color de ambos temas. |
| `dist/theme.js` | Preferencia de tema antes de cargar los estilos. |
| `dist/catalog.json` | Contenido revisado del catálogo. |
| `tools/validate.py` | Integridad de datos, enlaces y referencias. |
| `tools/test.js` | Pruebas de recurrencias, búsqueda y preferencias de tema. |
| `.github/workflows/validate.yml` | Validaciones automáticas. |
| `.nojekyll` | Publicación de los archivos sin procesamiento de Jekyll. |

## Datos y navegación

Las rutas usan fragmentos (`#inicio`, `#materiales`, `#agenda`, `#materia/arquitectura`, `#proyecto`). No requieren redirecciones del servidor. Las rutas de archivos son relativas para funcionar bajo el subdirectorio del proyecto en Pages.

El catálogo separa `subjects`, `resources`, `events`, `schedules` y `classes`. Cada archivo de Drive tiene un ID único; puede aparecer en varias materias sin duplicarse. El README explica los campos y sus criterios de revisión.

Las fechas semanales conservan su intervalo. Los horarios se presentan en `America/Argentina/Cordoba` (UTC−3). No se infieren feriados, suspensiones ni fechas de entrega a partir de una semana.

## Tema, privacidad y servicios externos

El tema sigue `prefers-color-scheme` y permite una elección manual. Sólo se guarda esa preferencia en `localStorage`, con la clave `entre-apuntes-theme`; el sitio funciona si el navegador bloquea ese almacenamiento.

El código del proyecto no incorpora analítica, publicidad ni rastreadores propios. GitHub y los servicios externos pueden tratar datos de conexión según sus políticas. Drive se carga dentro de una ficha sólo cuando se pulsa «Ver documento aquí». Abrir Meet, Moodle o Drive implica visitar esos servicios y usar sus permisos o cuentas. No se guardan credenciales en el repositorio.

No hay sincronización automática con Drive ni modo sin conexión. El sitio mantiene enlaces, no copias de los PDF. La disponibilidad del catálogo no asegura la disponibilidad de Drive, Moodle o Meet.

## Desarrollo y verificación

Desde la raíz del repositorio, con Python 3 y Node.js instalados:

```sh
python3 -m http.server 8080 --directory dist
```

Abrir `http://localhost:8080`. Para validar:

```sh
python3 tools/validate.py
node --check dist/app.js
node --check dist/theme.js
node tools/test.js
```

Para cambios visuales, revisar escritorio y pantalla angosta, ambos temas, teclado, foco, menú y diálogos. La comprobación con lector de pantalla sigue pendiente; no se declara certificación de accesibilidad.

## Publicación y recuperación

La configuración actual de Pages publica desde `main`, raíz del repositorio. Un cambio integrado inicia la publicación de Pages; el workflow de validación se ejecuta por separado y no constituye por sí mismo una barrera de publicación. Revisar ambos resultados en Actions. Para evitar publicar cambios sin revisar, trabajar en una rama y un pull request; la protección de ramas no fue configurada por este proyecto.

Si una actualización falla, corregirla con un nuevo commit o revertir el commit problemático conservando el historial. El alojamiento no requiere servidor de aplicación. El costo y los límites de GitHub y Google dependen de sus planes y condiciones; la arquitectura no implica disponibilidad ilimitada.
