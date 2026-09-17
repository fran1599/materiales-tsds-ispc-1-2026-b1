# Entre apuntes · TSDS ISPC

Biblioteca estudiantil para primer año de Desarrollo de Software, cohorte 2026, comisión B1. Conserva las comisiones y autorías que documenta cada fuente, incluso cuando el material es general o de otra comisión. No es un sitio oficial del ISPC.

## Sitio y publicación

Sitio estático en `dist/`: HTML, CSS y JavaScript sin dependencias, base de datos ni servicios pagos. Los documentos permanecen en Drive. Funciona en subdirectorios de GitHub Pages.

Este repositorio ya tiene GitHub Pages configurado para publicar desde `main`. `index.html` en la raíz abre `dist/` y conserva los enlaces de navegación. `.nojekyll` evita procesar los archivos como un blog. No hace falta cambiar la configuración de Pages. El workflow `Validar catálogo y sitio` comprueba el catálogo y el código en cada push y pull request; la publicación sigue a cargo del proceso de Pages existente.

Para trabajar localmente:

```sh
python3 -m http.server 8080 --directory dist
```

Abrir `http://localhost:8080`. No abrir el HTML como archivo local, porque el navegador puede impedir la lectura de `catalog.json`.

## Revisión del 17/09/2026

- Carpeta de origen: [Abierto y compartido](https://drive.google.com/drive/folders/1SEoZF34NoR8Pd94RRTO3wcoEzgYSTSoZ).
- 92 archivos inventariados; 88 incorporados con una ficha por identificador de Drive.
- Los 82 recursos anteriores siguen en la carpeta compartida. Se actualizaron sus ubicaciones de origen.
- Se incorporaron las seis clases asincrónicas de Arquitectura, tras descargar y revisar visualmente sus 33 páginas. Son guías generales con consignas sin resolver, no entregas estudiantiles.
- Quedan cuatro archivos pendientes: dos accesos directos cuyo destino no pudo leerse y dos documentos cuya procedencia requiere confirmación. Los detalles privados de revisión no se publican en el repositorio.
- 10 espacios curriculares y una sección institucional. Inglés I, Competencias Comunicacionales II y Ética no tienen todavía documentos generales incorporados.
- 22 entradas de agenda documental y seis horarios semanales tomados de las capturas proporcionadas. Las capturas no se publican.

Dos recursos del Módulo Programador pertenecen a Programación I y Base de Datos a la vez; mantienen una sola ficha. No sumar los contadores de materias para calcular archivos únicos.

## Uso y accesibilidad

Búsqueda sin distinción de tildes, filtros por materia/tipo/unidad, fichas y enlaces individuales a Drive. Horarios y Meet están en la agenda general y en «Clases y encuentros» de cada materia. El calendario permite cambiar de semana; se presenta como lista en pantallas pequeñas.

El tema sigue `prefers-color-scheme` del dispositivo y admite elegir Claro, Oscuro o Automático. La elección se conserva en el navegador cuando el almacenamiento está disponible. Se contemplan foco visible, navegación por teclado, cierre con Escape, aislamiento del menú móvil, reducción de movimiento y colores forzados. Los PDF externos conservan sus propias limitaciones de accesibilidad; algunos son imágenes.

El sitio no sustituye Moodle ni confirma cambios docentes. No ofrece acceso sin conexión. La vista de Drive se carga solamente al pedirla; puede requerir permisos o una sesión en Google. Los enlaces de Moodle requieren acceso al aula. Los Meet se transcribieron de las capturas: no se ingresó a reuniones para probarlos.

## Actualizaciones desde Drive

La incorporación es revisada, no automática. Un nuevo barrido debe comparar el inventario por ID, detectar altas, cambios, movimientos y documentos que ya no están en la carpeta compartida. Antes de publicar, leer cada nuevo documento y excluir trabajos personales, entregas grupales y documentación interna de representación. No basta con el nombre o la ubicación para determinar su procedencia.

Editar `dist/catalog.json`:

- `resources`: ID y enlace individual observado, título, nombre original, descripción, materias, unidad/eje, tipo, etiquetas, formato, período, ubicación y fecha/alcance de revisión. No copiar los originales al repositorio.
- `subjects`: período, comisión, docentes, notas y documento fuente. Separar una nueva cursada con un identificador nuevo; no sobrescribir la anterior. Distinguir autoría de manuales y docencia de una comisión.
- `events`: fuente documental por ID, inicio y fin. Conservar las semanas como intervalos; registrar una hora de entrega sólo cuando esté explícita.
- `schedules`: día de semana ISO (lunes=1), horas en Argentina, primera ocurrencia observada, límite de repetición o `null`, enlace Meet, aula y grabaciones cuando se conocen, fuente y notas. `validFrom` es la fecha observada en la captura, no el inicio real de la cursada. `until` limita la recurrencia, no implica una clase ese día. No se calculan feriados ni suspensiones automáticamente.
- `classes`: accesos a encuentros, aulas o grabaciones con materia y descripción de procedencia.
- `updated` y `collection`: fecha y alcance del inventario. Mantener los totales de revisión consistentes.

Para incorporar novedades pasadas en el chat, registrar también su fuente, fecha y comisión. Revisar el diff antes del commit: no subir capturas, notas de revisión privadas, datos personales ni material pendiente por accidente.

## Verificación

```sh
python3 tools/validate.py
node --check dist/app.js
node --check dist/theme.js
node tools/test.js
```

Los controles cubren identificadores, enlaces, fechas, relaciones entre materias y recursos, recurrencias de horarios, búsqueda y preferencias de tema. Complementar con revisión visual de escritorio y pantalla angosta, temas claro/oscuro, teclado, fichas y navegación. No certifican permisos externos ni exactitud académica del contenido.

## Visor

La vista previa usa un iframe de Google Drive bajo demanda. No requiere proxy ni backend. PDF.js podría utilizarse si se alojaran los PDF en un origen compatible; los enlaces compartidos de Drive no garantizan las condiciones necesarias. Por ahora se mantiene el enlace original de cada archivo.

### Resultado de la comprobación publicada

Portada, calendario, cambio de semana, búsqueda, ficha de una clase recuperada, cierre con Escape y modo oscuro comprobados en el navegador de escritorio. La prueba visual específica a 320 píxeles no pudo ejecutarse por una restricción del navegador de esta sesión; queda pendiente, al igual que una auditoría con lector de pantalla. El diseño adaptable y los controles de teclado están implementados, pero no se declara una certificación de accesibilidad.
