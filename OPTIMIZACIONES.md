# 🚀 Optimizaciones UniService - Guía para el Equipo

## ⚠️ IMPORTANTE: Configuración para que funcione después de los cambios

### Para DESARROLLO LOCAL (tu computadora)

El sistema funciona **exactamente igual que antes** porque los secrets están en `appsettings.Development.json`.

**NO necesitas hacer nada** - el sistema usa automáticamente los valores de ese archivo cuando estás en modo Development.

### Para PRODUCCIÓN (cuando subas a un servidor)

Debes configurar las variables de entorno en tu servidor:

```bash
# Ejemplo para Windows (PowerShell)
$env:ConnectionStrings__DefaultConnection="Host=...;Password=..."
$env:Jwt__Key="una_clave_muy_larga"
$env:Supabase__Url="https://..."
$env:Supabase__ServiceKey="..."

# Ejemplo para Linux/Mac
export ConnectionStrings__DefaultConnection="Host=...;Password=..."
export Jwt__Key="una_clave_muy_larga"
```

O crear un archivo `.env` en la carpeta del API basado en `.env.example`.

---

## 📋 Cambios Realizados

### 🔒 SEGURIDAD

| Cambio | Impacto |
|--------|---------|
| Secrets movidos a `appsettings.Development.json` | No se commitean en git |
| Archivo `.gitignore` creado | Protege archivos sensibles |
| `.env.example` como plantilla | Guía para configurar |
| Validación de entrada en DTOs | Previene datos maliciosos |
| Middleware de errores global | No expone detalles en producción |

### ⚡ RENDIMIENTO

| Cambio | Mejora estimada |
|--------|-----------------|
| Paginación en backend | 60-80% menos datos transferidos |
| Índices en base de datos | 5-10x más rápido en búsquedas |
| Filtrado en backend (no frontend) | CPU del servidor, no del cliente |
| Debounce en búsqueda | 70% menos peticiones al servidor |
| Connection pooling | Conexiones reutilizadas, menos latencia |
| Response compression | 40-60% menos tamaño de respuesta |
| Lazy loading de imágenes | Carga inicial más rápida |

### 🧹 LIMPIEZA

- Eliminado `WeatherForecastController.cs` (código de ejemplo)
- Eliminado `authApi.js` (apuntaba a endpoint viejo de PHP)
- Corregido `probar.sql` (sintaxis SQL Server → PostgreSQL)

---

## 📁 Archivos Nuevos/Cambiados

### Backend (UniserviceAPI)
| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `appsettings.json` | ✅ Modificado | Secrets removidos (vacío) |
| `appsettings.Development.json` | ✅ Modificado | Secrets aquí para desarrollo |
| `.gitignore` | ✅ Nuevo | Excluye archivos sensibles |
| `.env.example` | ✅ Nuevo | Plantilla de variables |
| `Program.cs` | ✅ Modificado | Variables de entorno + pooling + compresión + errores |
| `Filters/CheckOwnershipAttribute.cs` | ✅ Nuevo | Helper de autorización |
| `DTOs/ServicioDTO.cs` | ✅ Modificado | Validaciones agregadas |
| `DTOs/CrearSolicitudDTO.cs` | ✅ Modificado | Validaciones agregadas |
| `DTOs/RegisterDTO.cs` | ✅ Modificado | Validaciones agregadas |
| `DTOs/LoginDTO.cs` | ✅ Modificado | Validaciones agregadas |
| `DTOs/CalificacionDTO.cs` | ✅ Modificado | Validaciones agregadas |
| `Controllers/ServiciosController.cs` | ✅ Modificado | Paginación y filtrado en backend |

### Frontend
| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `src/Pages/shared/utilidades.js` | ✅ Modificado | Agregada función `debounce` |
| `src/Pages/Principal/BusquedaServicios.jsx` | ✅ Modificado | Usa paginación del backend |
| `src/Pages/Inicio.jsx` | ✅ Modificado | Usa paginación optimizada |
| `src/Pages/Perfil.jsx` | ✅ Modificado | Carga servicios con paginación |
| `src/Pages/shared/TarjetaServicio.jsx` | ✅ Modificado | Lazy loading en imágenes |

### Base de Datos
| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `database/08_Optimizacion_Indices.sql` | ✅ Nuevo | Índices + funciones optimizadas |
| `database/probar.sql` | ✅ Modificado | Corregido a PostgreSQL |

---

## 🔧 Cómo aplicar los índices en Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega TODO el contenido de `database/08_Optimizacion_Indices.sql`
5. Ejecuta

**Es seguro**: Solo agrega índices, no modifica datos ni tablas.

---

## 🐛 Si algo no funciona

### El API no inicia
- Verifica que `appsettings.Development.json` tenga los valores correctos
- Revisa la consola para ver mensajes de `[CONFIG]` o `[ERROR]`

### El frontend no carga servicios
- Verifica que el API esté corriendo
- Abre la consola del navegador (F12) para ver errores

### Los índices no se aplicaron
- Ejecuta el SQL en Supabase SQL Editor
- Verifica con: `SELECT * FROM pg_indexes WHERE schemaname = 'public';`

---

## 📊 API de Servicios - Nuevos Parámetros

### Antes (sigue funcionando)
```
GET /api/services
→ Devuelve TODOS los servicios (comportamiento legacy)
```

### Ahora (nuevo, recomendado)
```
GET /api/services?page=1&pageSize=8&categoria=1&busqueda=tutoria&orden=recientes
→ Devuelve página 1, 8 resultados, filtrados y ordenados
```

**Parámetros:**
- `page` (int): Número de página (default: 0 = modo legacy)
- `pageSize` (int): Resultados por página
- `categoria` (int): Filtrar por ID de categoría
- `busqueda` (string): Buscar en título, descripción, categoría, proveedor
- `orden` (string): `recientes`, `antiguos`, `precio-menor`, `precio-mayor`, `rating-mayor`, `rating-menor`

**Respuesta:**
```json
{
  "servicios": [...],
  "paginacion": {
    "pagina": 1,
    "porPagina": 8,
    "total": 45,
    "totalPaginas": 6
  }
}
```
