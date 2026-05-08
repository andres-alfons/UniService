export function calcularEstrellas(puntuaciones) {
  if (!Array.isArray(puntuaciones) || puntuaciones.length === 0) return "☆☆☆☆☆";
  const prom =
    puntuaciones.reduce((a, b) => a + Number(b), 0) / puntuaciones.length;
  const llenas = Math.min(5, Math.max(0, Math.round(prom)));
  return "★".repeat(llenas) + "☆".repeat(5 - llenas);
}

export function promedioEstrellas(estrellas) {
  if (!Array.isArray(estrellas) || estrellas.length === 0) return 0;
  return estrellas.reduce((a, b) => a + Number(b), 0) / estrellas.length;
}

export function truncar(texto, max = 90) {
  if (!texto) return "";
  return texto.length > max ? texto.substring(0, max) + "..." : texto;
}

export function normalizar(texto) {
  return (texto || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
