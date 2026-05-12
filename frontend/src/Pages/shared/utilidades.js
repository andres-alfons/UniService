// Funciones de utilidad compartidas: estrellas, texto y normalización

// Calcula y devuelve una cadena de estrellas ★/☆ basada en el promedio de puntuaciones
export function calcularEstrellas(puntuaciones) {
  if (!Array.isArray(puntuaciones) || puntuaciones.length === 0) return "☆☆☆☆☆";
  const prom =
    puntuaciones.reduce((a, b) => a + Number(b), 0) / puntuaciones.length;
  const llenas = Math.min(5, Math.max(0, Math.round(prom)));
  return "★".repeat(llenas) + "☆".repeat(5 - llenas);
}

// Calcula el promedio numérico de un arreglo de estrellas
export function promedioEstrellas(estrellas) {
  if (!Array.isArray(estrellas) || estrellas.length === 0) return 0;
  return estrellas.reduce((a, b) => a + Number(b), 0) / estrellas.length;
}

// Trunca un texto a una longitud máxima y agrega "..."
export function truncar(texto, max = 90) {
  if (!texto) return "";
  return texto.length > max ? texto.substring(0, max) + "..." : texto;
}

// Normaliza un texto: minúsculas, sin tildes ni diacríticos, sin espacios al inicio/final
export function normalizar(texto) {
  return (texto || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
