# Entre apuntes

Catálogo estudiantil de materiales de Desarrollo de Software del Instituto Superior Politécnico Córdoba. Revisión inicial: 17 de septiembre de 2026.

## Abrir y publicar

El sitio completo está en `dist/`. No utiliza servidor de aplicación, base de datos, servicios pagos ni dependencias de ejecución. Los documentos permanecen en Google Drive.

Esta versión también se publica mediante Sites. Su identidad está en `.openai/hosting.json`; no reutilizar ese archivo al crear otro proyecto.

Para usar GitHub Pages con el paquete portable:

1. Crear un repositorio público e incorporar `dist/` y el workflow incluido en `.github/workflows/pages.yml`.
2. En Settings → Pages, elegir GitHub Actions como fuente.
3. Ejecutar el workflow «Publicar biblioteca» o subir un cambio a la rama main.
4. Revisar el resultado de la ejecución; GitHub mostrará el enlace real. No se ha creado ni configurado un repositorio de GitHub para esta entrega.

GitHub Pages admite sitios estáticos en repositorios públicos con GitHub Free. Fuente: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

El código usa rutas relativas y navegación mediante fragmentos, por lo que admite subdirectorios de proyecto en GitHub Pages. No requiere reglas especiales de redirección.

## Contenido

- 82 archivos únicos. Dos documentos del Módulo Programador figuran tanto en Programación I como en Base de Datos, conservando una sola ficha por archivo.
- 9 espacios de cursada, incluidos dos sin material general disponible.
- 2 documentos institucionales incluidos en el total.
- 22 registros de agenda, con fuente individual y precisión diaria o semanal.
- Fichas, búsqueda por contenido descrito y filtros por materia, tipo y unidad.
- Vista de Drive cargada bajo demanda. Si Drive solicita acceso, se debe obtener del propietario.

Los trabajos personales, entregas grupales y documentación interna de representación no están en los archivos publicados ni en este repositorio. El registro de exclusiones y casos pendientes se conserva por separado. No publicar ese registro.

## Actualizar materiales

Editar `dist/catalog.json`. Revisar el contenido de cada documento antes de agregarlo: el nombre de archivo o la carpeta no bastan para determinar si puede compartirse.

Cada recurso incluye:

- `id`: identificador exacto del archivo de Drive, único.
- `url`: enlace individual observado en Drive.
- `title` y `originalName`: título amigable y nombre original.
- `description`: descripción fiel de lo que contiene, sin completar vacíos.
- `subjects`: referencias a los espacios curriculares.
- `edition`: período de la colección; no implica año de publicación de todos los apuntes.
- `unit`, `kind`, `tags` y `format`.
- `reviewedAt`, `access`, `review` y `sourcePath`.

En `subjects`, registrar comisión, docentes y período sólo cuando una fuente los confirme. Conservar las diferencias entre autoría de un manual y docencia de una comisión. Para una nueva cursada, agregar un identificador separado (por ejemplo, programacion-2027-b1), sin sobrescribir la cursada anterior.

En `events`, cada registro debe enlazar un recurso mediante `source`. Usar `start` y `end` para semanas; no convertir el viernes de una semana en una fecha límite supuestamente exacta. Registrar hora sólo si figura en la fuente.

En `classes`, agregar enlaces verificados con `subjects`, `title`, `description` y `url`. Precisar en la descripción fecha, comisión y si se trata de grabación o encuentro. No agregar enlaces de reunión privados sin revisión.

Actualizar `updated` y las fechas de revisión al revisar el catálogo. Las observaciones documentales específicas permanecen en las notas de cada materia.

No hay sincronización automática con Drive o Moodle: evita publicar accidentalmente documentos personales añadidos a las mismas carpetas. Tampoco hay edición compartida desde la interfaz.

## Visor y costo

El catálogo no descarga los PDF ni los sube a otro alojamiento. La ficha permite abrir el archivo o cargar su vista de Drive en un iframe, sólo al solicitarla. No se garantiza la vista previa para cada formato, cuenta o configuración de cookies.

PDF.js es una alternativa estática si se alojan los PDF en el mismo origen o en un origen que habilite las solicitudes necesarias. Un enlace compartido de Drive no garantiza esas condiciones. Por eso no se incorporó un proxy ni otro servidor.
Fuente técnica: https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions

El catálogo puede seguir disponible cuando Moodle cae, pero no reemplaza los permisos de Drive ni ofrece los documentos sin conexión. No modifica los archivos originales ni la configuración de acceso.

## Verificación

Ejecutar `python3 tools/validate.py` y `node --check dist/app.js`.

Se valida integridad del catálogo, identificadores, enlaces de origen, referencias de agenda, intervalos de fecha y existencia de los recursos locales. El control automático no certifica permisos de terceros, lectura de imágenes dentro de documentos, exactitud académica o cambios posteriores de fechas.
