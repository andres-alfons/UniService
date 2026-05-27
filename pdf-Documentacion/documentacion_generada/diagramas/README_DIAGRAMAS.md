# Instrucciones para Visualizar los Diagramas UML

Los diagramas se entregaron en formato **PlantUML** (`.puml`), que es un lenguaje de texto para describir diagramas UML. Esto garantiza que puedas modificarlos fácilmente si cambia algo del proyecto y generar imágenes de alta calidad sin depender de software de diseño gráfico.

---

## Opcion 1 (Recomendada): Visualizador Online de PlantUML

La forma mas rapida y sin instalacion es usar el servidor oficial:

**Pagina web:** [https://www.plantuml.com/plantuml/uml/](https://www.plantuml.com/plantuml/uml/)

### Pasos:
1. Abre el enlace anterior.
2. Copia TODO el contenido del archivo `.puml` que quieras visualizar (por ejemplo, `clases.puml`).
3. Pegalo en el cuadro de texto del sitio web.
4. Presiona el boton de **Submit** o espera la renderizacion automatica.
5. Descarga la imagen generada (PNG/SVG) usando el boton derecho del mouse -> "Guardar imagen como...".

### Consejo:
Si el diagrama es muy grande y el texto se corta, usa la version **SVG** para obtener calidad vectorial infinita. En el mismo sitio hay un boton para cambiar el formato de salida.

---

## Opcion 2: Extension para Visual Studio Code

Si prefieres trabajar localmente y ver los diagramas mientras editas el codigo:

### Extension recomendada:
**Nombre:** `PlantUML` (por Jebbs)  
**ID:** `jebbs.plantuml`

### Pasos de instalacion:
1. Abre Visual Studio Code.
2. Ve a la pestana de Extensiones (icono de cuadritos en la barra lateral) o presiona `Ctrl+Shift+X`.
3. Busca `PlantUML` y selecciona la extension de **Jebbs**.
4. Instala la extension.
5. Para que funcione la vista previa, necesitas tener instalado **Java** (JRE 8 o superior) y, opcionalmente, **Graphviz**.
   - Descarga Java desde: https://www.oracle.com/java/technologies/downloads/
   - Descarga Graphviz desde: https://graphviz.org/download/
6. Abre cualquier archivo `.puml` de esta carpeta.
7. Presiona `Alt+D` (o click derecho -> "Preview Current Diagram") para ver el diagrama en tiempo real.

---

## Opcion 3: Plugin para JetBrains (Rider / WebStorm / IntelliJ)

Si usas alguno de estos IDEs:

1. Ve a **File > Settings > Plugins**.
2. Busca **"PlantUML integration"**.
3. Instala el plugin y reinicia el IDE.
4. Abre los archivos `.puml` y veras una pestana de vista previa al lado del codigo.

---

## Opcion 4: Renderizador Local con Node.js (Avanzado)

Si tienes Node.js instalado, puedes usar `node-plantuml`:

```bash
npm install -g node-plantuml
puml generate clases.puml -o clases.png
```

O usando `plantuml` via Java directamente:

```bash
java -jar plantuml.jar clases.puml
```

Descarga `plantuml.jar` desde: https://plantuml.com/download

---

## Lista de Diagramas Disponibles

| Archivo | Tipo de Diagrama | Descripcion |
|---------|------------------|-------------|
| `casos_de_uso.puml` | Casos de Uso | Actores principales y sus interacciones con el sistema |
| `actividades_publicar_servicio.puml` | Actividades | Flujo completo desde la publicacion hasta la aprobacion admin |
| `actividades_solicitar_servicio.puml` | Actividades | Flujo de contratacion, chat automatico y notificaciones |
| `actividades_reporte.puml` | Actividades | Proceso de reporte de usuarios/servicios y resolucion admin |
| `clases.puml` | Clases UML | Entidades del dominio, atributos y relaciones de la BD |
| `secuencia_login.puml` | Secuencia | Interaccion login con JWT, BCrypt y PostgreSQL |
| `secuencia_solicitud.puml` | Secuencia | Creacion de solicitud con SignalR, email y persistencia |
| `despliegue.puml` | Despliegue | Arquitectura de produccion: Vercel -> .NET API -> Supabase |

---

## Recomendacion Final

Para incluir los diagramas en tu documento academico final (Word/PDF), te sugerimos:

1. Visita [https://www.plantuml.com/plantuml/uml/](https://www.plantuml.com/plantuml/uml/)
2. Genera cada diagrama en formato **PNG** (buena calidad para documentos) o **SVG** (si el editor lo soporta).
3. Inserta las imagenes en las secciones correspondientes del documento:
   - Punto 7: Casos de Uso
   - Punto 8: Diagramas de Actividades
   - Punto 9: Diagrama de Clases
   - Punto 10: Diagramas de Secuencia
   - Punto 11: Diagrama de Despliegue

> **Consejo de presentacion:** En el documento Word, pon cada diagrama centrado, con titulo debajo (ej: "Figura 1. Diagrama de Casos de Uso") y referencialo en el texto ("Como se observa en la Figura 1..."). Esto cumple con las normas APA de figuras y tablas.
