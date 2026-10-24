# Navegación experimental v2

La ruta [v2](https://fran1599.github.io/materiales-tsds-ispc-1-2026-b1/v2/) permite comparar una navegación por tarea con la [versión anterior](https://fran1599.github.io/materiales-tsds-ispc-1-2026-b1/dist/#inicio).

La portada y cada materia separan entregas, materiales e información de cursada. El selector de materia conserva la sección activa; los enlaces de Meet y Calendar permanecen visibles al entrar en una materia. Las ayudas se despliegan con clic, toque o teclado.

Las fechas se leen del catálogo compartido `../dist/catalog.json`. La v2 no constituye una nueva revisión documental ni una sincronización con Moodle: conserva las fuentes y su fecha de revisión. Los períodos se muestran como rangos. Las actividades terminadas pasan a “Fechas anteriores”, usando el día de Argentina. La ausencia de próximas fechas registradas no implica ausencia de obligaciones.

“Sugerir corrección” prepara un texto con materia, actividad, fecha, fuente y página consultada. El visitante puede editarlo, copiarlo o continuar en GitHub para enviarlo. No se crea una issue automáticamente; GitHub requiere cuenta y la publicación es pública.

Se ofrecen ocho temas: sistema, claro, oscuro, sepia y neón azul, rojo, verde y gris. La preferencia se guarda localmente bajo `entre-apuntes-v2-theme`; el modo sistema responde a los cambios del dispositivo. Las animaciones respetan la preferencia de movimiento reducido.

## Desarrollo y aportes

HTML, CSS y JavaScript nativos, sin framework, backend ni compilación. GitHub Pages sirve los archivos. Para probar localmente, ejecutar `python3 -m http.server 8000` desde la raíz y abrir `http://localhost:8000/v2/`. No abrir directamente con file://, porque se carga el catálogo mediante fetch.

Editar la presentación en `v2/`. Las actualizaciones de materiales y fechas deben realizarse en el catálogo compartido siguiendo las reglas del README principal, con fuente verificable y sin trabajos personales o grupales. Enviar un pull request o una issue con contexto y evidencia oficial.

Verificaciones: `node --check v2/app.js`, `node --check v2/theme.js` y `node tools/test-v2.js`. La prueba cubre las rutas de todas las materias, filtros, enlaces seguros, fechas y recurrencias de Calendar y contexto de correcciones. Revisar además teclado, temas y pantallas estrechas al cambiar estilos.

El código y la documentación propios están cubiertos por la licencia MIT del repositorio. Los materiales educativos de terceros conservan sus derechos y quedan excluidos de esa licencia.



## Filtros y calendario de entregas

En la biblioteca general aparece un filtro de materia, combinable con búsqueda, unidad y tipo. Al entrar a una materia desde la navegación lateral se aplica ese contexto y se omite el filtro redundante. Todas las fichas cerradas muestran sus materias, incluidas las compartidas.

Entregas ofrece Lista, Mes y Semana, con navegación anterior/siguiente, Hoy y salto a una fecha. Mes y Semana muestran todos los eventos registrados del período, incluidos los anteriores. La semana comienza el lunes; las barras abarcan las fechas inicial y final inclusive. Una fuente que indica de lunes a viernes ocupa esos cinco días, sin extenderse al fin de semana. Los períodos que cruzan semanas se continúan en barras con flechas y las coincidencias ocupan filas distintas. No se inventan horarios ni fechas de cierre.

Cada barra abre un detalle con la fuente, las notas y la acción de corrección. El calendario usa CSS Grid y JavaScript nativos, sin bibliotecas externas. En pantallas pequeñas tiene desplazamiento horizontal para conservar las siete columnas y mantiene disponible la vista de lista. Las pruebas incluyen intervalos inclusivos, cruces de semana/mes/año, superposiciones y filtrado por materia.

## Fechas de ABP y coloquios · 24/10/2026

La sección “Fechas y entregas” distingue tres dimensiones: entregas y defensas de Aprendizaje Basado en Proyectos (ABP), coloquios promocionales y el calendario general de evidencias. Las tarjetas de ABP pueden representar una fecha confirmada, un período general o una fecha todavía pendiente de publicación.

Las planillas de defensa del Módulo Programador B.1 y Arquitectura B muestran los turnos por grupo dentro de un detalle plegable. Se publican nombres de proyectos o números de grupo, no nóminas de estudiantes. Los accesos a Meet y la fuente se conservan por tarjeta. “Agregar a Calendar” aparece sólo cuando la fuente informa tanto la hora inicial como la final; no se inventa la duración de un coloquio.

El cronograma institucional de coloquios de noviembre se mantiene separado de las mesas finales para estudiantes regulares y libres de diciembre. La inscripción a coloquios abre el 02/11/2026 y cierra 48 horas hábiles antes de cada horario, según la fuente institucional. Inglés I no se incorpora como evento confirmado porque el documento aclara que la fecha mostrada en SIU Guaraní es administrativa y remite a otro cronograma por comisión.

