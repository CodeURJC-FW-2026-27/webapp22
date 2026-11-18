# webapp22
## Práctica 1

**MUSIX**

| Name  | Adress | Github |
| :-------------:|:-------------:| :-------------: |
|David Esteban Bernardo|d.estebanb.2022@alumnos.urjc.es|Daviid24x| 
|Cristobal Justo Rustarazo|c.justo.2019@alumnos.urjc.es|cristobalJR|


## **Funcionalidad**

### Entidades

**Entidad principal: `Album`**

Atributos:
* `album_title`
* `artist`
* `record_price`
* `cover_image`
* `description` 
* `release_date`
* `format` <!-- lp,vinilo,digital,cd -->

**Entidad secundaria: `Album Review`**

Atributos:
* `nickname`
* `review_date`
* `opinion`
* `rating` <!-- 1 a 5 estrellas -->

### Imágenes

Cada disco (`Album`) tendrá asociada una única imagen de portada (`cover_image`).

### Buscador, filtrado o categorización

Se podrán filtrar los albumes por título (`album_title`). Además, los discos estarán asociados a un formato (`format`), que permitirá organizarlos o consultarlos por artista.

## Documentación práctica 1

### Capturas de pantalla de las páginas

#### Página principal

![Página principal - captura 1](images_readme/P1/index1.png)

![Página principal - captura 2](images_readme/P1/index2.png)

#### Página de detalle

![Página de detalle - captura 1](images_readme/P1/detail1.png)

![Página de detalle - captura 2](images_readme/P1/detail2.png)

#### Página de nuevo elemento

![Página de nuevo elemento](images_readme/P1/new-element.png)

### Participación de los miembros

#### David Esteban Bernardo

**Tareas realizadas:** Participé en la maquetación del catálogo de álbumes con el sistema de Bootstrap, en la página de detalle y sus reseñas, y en el formulario para añadir álbumes. También trabajé en los estilos responsive, cambién la interfaz a español, la actualización de las imágenes.

**Cinco commits más significativos:**
1. [Refactor branding from VINYL DEVS to MUSIX, update navigation links and create new album addition page](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/6ff2a4b586468ea60d427d9c26cdd888eb3852e0)
2. [Web in spanish](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/0cb42e45dd3a6943fbfef4b35a38daa22b39f943)
3. [Add album detail page layout and review section styling](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/19c232760ec635f44f4f4b1578d9c9e29d83908e)
4. [Add album images and enhance index.html and style.css for album display](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/3da13a26758c8d70db35cc1572616d5cd2277807)
5. [Enhance styling for album forms and details, update layout for responsiveness](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/ef75ba0fd167d741ffeef1669ae8d1f39375bc1c)

**Cinco ficheros con mayor participación:**
1. [index.html](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/index.html)
2. [detail.html](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/detail.html)
3. [style.css](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/style/style.css)
4. [new-element.html](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/new-element.html)
5. [README.md](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/README.md)

#### Cristóbal Justo Rustarazo

**Tareas realizadas:** Me encargué de crear la estructura inicial del proyecto, con los tres archivos HTML, sus metadatos y dependencias, la hoja de estilos y el README inicial. Añadí el pie de página común con el horario, el enlace para volver arriba y sus estilos. También desarrollé la página de detalle del álbum, incluyendo portada, información y botones de acción, y el formulario de creación de álbumes con sus siete campos, selector de formato y botones de guardar y cancelar.

**Cinco commits más significativos:**
1. [album creation form](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/26c7b632e3f1a018fe2be8ac9ddcd02cadf82d78)
2. [add shared footer](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/6bf4e4c350c8fcdc5a33a5a85a20baae2591e16f)
3. [add search bar](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/2f07ebb468fea95cb8217e2da5f2120798ff6213)
4. [add album detail layout](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/472a1daf49c59b6ff8cd4154734e03fdc98d1e9e)
5. [initial project structure](https://github.com/CodeURJC-FW-2026-27/webapp22/commit/f821e0815611637a67e728b1fb41abc5730c33ca)

**Cinco ficheros con mayor participación:**
1. [index.html](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/index.html)
2. [detail.html](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/detail.html)
3. [style.css](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/style/style.css)
4. [new-element.html](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/new-element.html)
5. [README.md](https://github.com/CodeURJC-FW-2026-27/webapp22/blob/main/README.md)

## Práctica 2

### Instrucciones de ejecución

#### Requisitos previos

- Node.js 22.x y npm.
- MongoDB Server 6.0 o posterior..
- Git para clonar el repositorio.

#### Descargar el código

```bash
git clone https://github.com/CodeURJC-FW-2026-27/webapp22.git
cd webapp22
```

#### Instalar dependencias y configurar

Desde la carpeta del proyecto, instala las dependencias:

```bash
npm install
```


#### Iniciar MongoDB

Antes de arrancar la aplicación, asegúrate de que el servidor de MongoDB está en ejecución en `mongodb://127.0.0.1:27017`. Puedes iniciarlo y abrir la conexión de esta forma:

* **Como servicio en Windows (terminal como Administrador):**
  ```powershell
  net start MongoDB
  ```

#### Ejecutar la aplicación

Inicia el servidor con:

```bash
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador. Para desarrollo con reinicio automático:

```bash
npm run watch
```

### Descripción de ficheros

| Fichero | Responsabilidad |
|---|---|
| `package.json` | Define los scripts de ejecución y las dependencias de la aplicación. |
| `package-lock.json` | Fija las versiones concretas de las dependencias para instalaciones reproducibles. |
| `src/app.js` | Configura e inicia Express, registra el middleware y conecta la aplicación con MongoDB. |
| `src/albums.js` | Gestiona la conexión con MongoDB y las operaciones de consulta, alta, edición y borrado de álbumes y reseñas. |
| `src/router.js` | Define las rutas de la aplicación y coordina las operaciones, validaciones y vistas. |
| `src/defaultModel.js` | Prepara datos comunes para las vistas, como el nombre del sitio, los filtros y la búsqueda. |
| `src/errors.js` | Gestiona errores no controlados y muestra una respuesta de error común. |
| `src/formats.js` | Define los formatos de álbum disponibles y sus etiquetas. |
| `src/seed.js` | Carga los álbumes de demostración en MongoDB y restaura sus portadas cuando es necesario. |
| `src/uploads.js` | Valida y guarda las portadas subidas, gestiona los archivos de imagen y los límites de carga. |
| `src/validation.js` | Define las reglas y valida los datos recibidos para álbumes y reseñas. |
| `views/index.html` | Muestra el catálogo de álbumes y la paginación. |
| `views/detail.html` | Muestra los datos de un álbum y sus reseñas, con acciones para gestionarlos. |
| `views/new-element.html` | Formulario compartido para crear y editar álbumes. |
| `views/review-form.html` | Formulario compartido para crear y editar reseñas. |
| `views/edit-review.html` | Página que presenta el formulario compartido para editar una reseña. |
| `views/header.html` | Cabecera compartida con navegación, búsqueda y filtros por formato. |
| `views/footer.html` | Pie compartido con horario y enlace para volver al inicio de la página. |
| `views/confirmation.html` | Presenta el resultado de una operación realizada correctamente. |
| `views/error.html` | Presenta los errores usando la plantilla de resultado compartida. |
| `views/result-page.html` | Plantilla parcial común para mostrar mensajes y un enlace de retorno. |
| `public/styles/style.css` | Contiene los estilos de las páginas y componentes de la aplicación. |
| `data/albums.json` | Contiene los álbumes y las reseñas iniciales para cargar datos de demostración. |
| `data/images/*.png` | Portadas originales usadas para inicializar o restaurar las imágenes de demostración. |
| `uploads/` | Almacena las portadas disponibles para la aplicación, incluidas las cargadas por los usuarios. |

### Vídeo demostrativo

### Participación de miembros

#### David Esteban Bernardo

**Tareas realizadas:** [describir las tareas realizadas]

**Cinco commits más significativos:**
1. [mensaje del commit](URL)
2. [mensaje del commit](URL)
3. [mensaje del commit](URL)
4. [mensaje del commit](URL)
5. [mensaje del commit](URL)

**Cinco ficheros con mayor participación:**
1. [fichero]
2. [fichero]
3. [fichero]
4. [fichero]
5. [fichero]

#### Cristóbal Justo Rustarazo

**Tareas realizadas:** [describir las tareas realizadas]

**Cinco commits más significativos:**
1. [mensaje del commit](URL)
2. [mensaje del commit](URL)
3. [mensaje del commit](URL)
4. [mensaje del commit](URL)
5. [mensaje del commit](URL)

**Cinco ficheros con mayor participación:**
1. [fichero]
2. [fichero]
3. [fichero]
4. [fichero]
5. [fichero]
