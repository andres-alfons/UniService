// Funciones de utilidad compartidas: estrellas, texto y normalización

/**
 * Calcula y devuelve JSX/string de estrellas basado en el promedio de puntuaciones.
 * Acepta:
 *   - Array de números (p.ej. [4.2, 4.2, 4.2]) → promedia
 *   - Número o string numérico (p.ej. 4.2 o "4.2") → usa directamente como promedio
 *   - Cualquier otro valor → devuelve 5 estrellas vacías
 *
 * Muestra estrellas con media estrella (½) para mayor precisión.
 */
export function calcularEstrellas(puntuaciones) {
  let prom = 0;

  if (Array.isArray(puntuaciones) && puntuaciones.length > 0) {
    prom = puntuaciones.reduce((a, b) => a + Number(b), 0) / puntuaciones.length;
  } else if (typeof puntuaciones === "number" && !isNaN(puntuaciones)) {
    prom = puntuaciones;
  } else if (typeof puntuaciones === "string" && puntuaciones.trim() !== "") {
    const parsed = parseFloat(puntuaciones);
    if (!isNaN(parsed)) prom = parsed;
  } else {
    return "☆☆☆☆☆";
  }

  // Clamp entre 0 y 5
  prom = Math.min(5, Math.max(0, prom));

  const llenas = Math.floor(prom);
  const media = prom - llenas >= 0.25 && prom - llenas < 0.75; // media estrella
  const vacías = 5 - llenas - (media ? 1 : 0);

  return "★".repeat(llenas) + (media ? "⭐" : "") + "☆".repeat(Math.max(0, vacías));
}

// Calcula el promedio numérico de un arreglo de estrellas
export function promedioEstrellas(estrellas) {
  if (Array.isArray(estrellas) && estrellas.length > 0) {
    return estrellas.reduce((a, b) => a + Number(b), 0) / estrellas.length;
  }
  if (typeof estrellas === "number" && !isNaN(estrellas)) return estrellas;
  if (typeof estrellas === "string") {
    const p = parseFloat(estrellas);
    if (!isNaN(p)) return p;
  }
  return 0;
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

// Debounce: retrasa la ejecución de una función hasta que pase el tiempo especificado
export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
