// Constantes compartidas: paginación, categorías, modalidades, íconos, colores y APIs
export const CANTIDAD_POR_PAGINA = 8;

// Lista de categorías disponibles para filtrar servicios
export const CATEGORIAS = [
  { valor: "", label: "Todas las categorías" },
  { valor: "tutorias", label: "Tutorías" },
  { valor: "ensayos", label: "Ensayos y redacción" },
  { valor: "proyectos", label: "Proyectos" },
  { valor: "programacion", label: "Programación" },
  { valor: "diseno", label: "Diseño" },
  { valor: "arriendo", label: "Arriendo de habitaciones" },
  { valor: "otros", label: "Otros servicios" },
  { valor: "Diseño", label: "Diseños" },
];

// Opciones de modalidad y disponibilidad para los formularios
export const MODALIDADES = ["Presencial", "Virtual", "Mixta"];
export const DISPONIBILIDAD = [
  "Entre semana",
  "Fines de semana",
  "Siempre disponible",
];

// Chips de categorías para la sección de filtros rápidos con iconos Bootstrap
export const CHIPS_CATEGORIA = [
  { label: "Todos", valor: "todos", icono: "bi-grid-3x3-gap-fill" },
  { label: "Tutorías", valor: "tutorias", icono: "bi-book" },
  { label: "Ensayos", valor: "ensayos", icono: "bi-pencil" },
  { label: "Proyectos", valor: "proyectos", icono: "bi-folder" },
  { label: "Programación", valor: "programacion", icono: "bi-code" },
  { label: "Diseño", valor: "diseno", icono: "bi-palette" },
  { label: "Arriendo", valor: "arriendo", icono: "bi-house" },
];

// Estado inicial del formulario de publicación de servicio
export const initialPublicar = {
  titulo: "",
  descripcion: "",
  categoria: "",
  precio: "",
  universidad: "",
  contacto: "",
  modalidad: "",
  disponibilidad: "",
};

// Mapa de nombres de categoría a iconos Bootstrap
export const mapaIconos = {
  tutorias: "bi-book",
  ensayos: "bi-pencil",
  proyectos: "bi-folder",
  programacion: "bi-code",
  diseno: "bi-palette",
  arriendo: "bi-house",
  otros: "bi-globe2",
};

// Mapa de nombres de categoría a IDs numéricos para la API
export const mapaCategoriaId = {
  tutorias: 1,
  ensayos: 2,
  proyectos: 3,
  programacion: 4,
  diseno: 5,
  arriendo: 6,
  otros: 7,
};

export const API_HOME = "/api/services";
export const API_USUARIO = "/api/users";
export const API_SOLICITUD = "/api/solicitudes";

// Iconos Bootstrap para cada tipo de modalidad
export const MAPA_ICONOS_MODALIDAD = {
  Presencial: "bi-building",
  Virtual: "bi-laptop",
  Mixta: "bi-arrow-repeat",
};

// Iconos Bootstrap para cada tipo de disponibilidad
export const MAPA_ICONOS_DISPONIBILIDAD = {
  "Entre semana": "bi-calendar-week",
  "Fines de semana": "bi-calendar-event",
  "Siempre disponible": "bi-clock",
};

// Configuración visual de badges según estado de la solicitud
export const BADGE = {
  Pendiente: { bg: "#FFF3CD", color: "#856404", texto: "Pendiente", icono: "bi-hourglass-split" },
  Aceptada: { bg: "#D1E7DD", color: "#0A5C36", texto: "Aceptada", icono: "bi-check-circle-fill" },
  Rechazada: { bg: "#F8D7DA", color: "#721C24", texto: "Rechazada", icono: "bi-x-circle-fill" },
};

// Mapa de nombre_categoria (display name) a iconos Bootstrap
export const ICONOS_POR_NOMBRE_CATEGORIA = {
  "Programación": "bi-code-slash",
  "Diseño": "bi-palette",
  "Tutorías": "bi-book",
  "Ensayos y redacción": "bi-pencil",
  "Proyectos": "bi-folder",
  "Arriendo de habitaciones": "bi-house",
  "Otros servicios": "bi-globe2",
};

// Colores distintivos para cada categoría de servicio (fondo, texto)
export const COLORES_CATEGORIA = {
  "Programación":         { bg: "rgba(96, 165, 250, 0.1)",  color: "#60a5fa" },
  "Diseño":               { bg: "rgba(244, 114, 182, 0.1)", color: "#f472b6" },
  "Tutorías":             { bg: "rgba(167, 139, 250, 0.1)", color: "#a78bfa" },
  "Ensayos y redacción":  { bg: "rgba(251, 191, 36, 0.1)",  color: "#fbbf24" },
  "Proyectos":            { bg: "rgba(52, 211, 153, 0.1)",  color: "#34d399" },
  "Arriendo de habitaciones": { bg: "rgba(251, 146, 60, 0.1)", color: "#fb923c" },
  "Otros servicios":      { bg: "rgba(148, 163, 184, 0.1)", color: "#94a3b8" },
};
