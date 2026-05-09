export const MODALIDAD_MAP = { 0: "Presencial", 1: "Virtual", 2: "Mixta", "0": "Presencial", "1": "Virtual", "2": "Mixta", "Presencial": "Presencial", "Virtual": "Virtual", "Mixta": "Mixta" };
export const DISPONIBILIDAD_MAP = { 0: "Entre semana", 1: "Fines de semana", 2: "Siempre disponible", "0": "Entre semana", "1": "Fines de semana", "2": "Siempre disponible", "Entre semana": "Entre semana", "Fines de semana": "Fines de semana", "Siempre disponible": "Siempre disponible" };

export function mostrarModalidad(valor) {
  if (!valor && valor !== 0) return "Presencial";
  return MODALIDAD_MAP[valor] ?? valor ?? "Presencial";
}

export function mostrarDisponibilidad(valor) {
  if (!valor && valor !== 0) return "Entre semana";
  return DISPONIBILIDAD_MAP[valor] ?? valor ?? "Entre semana";
}

export const formatHora = (hora) => {
  if (!hora) return null;

  if (/^\d{2}:\d{2}$/.test(hora)) return `${hora}:00`;

  if (/^\d{2}:\d{2}:\d{2}$/.test(hora)) return hora;

  return null;
};

const COLORES_AVATAR = ["ag-azul", "ag-morado", "ag-verde", "ag-naranja"];

export function colorAvatar(nombre) {
  if (!nombre) return "ag-azul";
  return COLORES_AVATAR[nombre.charCodeAt(0) % COLORES_AVATAR.length];
}
