// Funciones de utilidad compartidas: estrellas, texto y normalización

/**
 * Calcula el promedio numérico de estrellas.
 * Acepta array de números, número suelto, o string numérico.
 * Devuelve { promNum, prom } para usar con <StarRating rating={promNum} />.
 */
export function calcularEstrellas(puntuaciones) {
  let promNum = 0;

  if (Array.isArray(puntuaciones) && puntuaciones.length > 0) {
    promNum = puntuaciones.reduce((a, b) => a + Number(b), 0) / puntuaciones.length;
  } else if (typeof puntuaciones === "number" && !isNaN(puntuaciones)) {
    promNum = puntuaciones;
  } else if (typeof puntuaciones === "string" && puntuaciones.trim() !== "") {
    const parsed = parseFloat(puntuaciones);
    if (!isNaN(parsed)) promNum = parsed;
  }

  promNum = Math.min(5, Math.max(0, promNum));
  return { promNum, prom: promNum.toFixed(1) };
}

// Calcula el promedio numérico de un arreglo de estrellas (para usos simples)
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