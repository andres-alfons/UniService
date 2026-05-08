export const CANTIDAD_POR_PAGINA = 8;

export const CATEGORIAS = [
  { valor: "", label: "Todas las categorías" },
  { valor: "tutorias", label: "📚 Tutorías" },
  { valor: "ensayos", label: "✍️ Ensayos y redacción" },
  { valor: "proyectos", label: "🗂️ Proyectos" },
  { valor: "programacion", label: "💻 Programación" },
  { valor: "diseno", label: "🎨 Diseño" },
  { valor: "arriendo", label: "🏠 Arriendo de habitaciones" },
  { valor: "otros", label: "🌐 Otros servicios" },
  { valor: "Diseño", label: "🖌️ Diseños" },
];

export const MODALIDADES = ["🏫 Presencial", "💻 Virtual", "🔄 Mixta"];
export const DISPONIBILIDAD = [
  "📆 Entre semana",
  "🎉 Fines de semana",
  "⏰ Siempre disponible",
];

export const CHIPS_CATEGORIA = [
  { label: "🌐 Todos", valor: "todos" },
  { label: "📚 Tutorías", valor: "tutorias" },
  { label: "✍️ Ensayos", valor: "ensayos" },
  { label: "🗂️ Proyectos", valor: "proyectos" },
  { label: "💻 Programación", valor: "programacion" },
  { label: "🎨 Diseño", valor: "diseno" },
  { label: "🏠 Arriendo", valor: "arriendo" },
];

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

export const mapaIconos = {
  tutorias: "📚",
  ensayos: "✍️",
  proyectos: "🗂️",
  programacion: "💻",
  diseno: "🎨",
  arriendo: "🏠",
  otros: "🌐",
};

export const mapaCategoriaId = {
  tutorias: 1,
  ensayos: 2,
  proyectos: 3,
  programacion: 4,
  diseno: 5,
  arriendo: 6,
  otros: 7,
};

export const API_HOME = "https://localhost:7237/api/Services";
export const API_USUARIO = "https://localhost:7237/api/Users";
export const API_SOLICITUD = "https://localhost:7237/api/Solicitudes";

export const BADGE = {
  Pendiente: { bg: "#FFF3CD", color: "#856404", texto: "⏳ Pendiente" },
  Aceptada: { bg: "#D1E7DD", color: "#0A5C36", texto: "✅ Aceptada" },
  Rechazada: { bg: "#F8D7DA", color: "#721C24", texto: "❌ Rechazada" },
};
