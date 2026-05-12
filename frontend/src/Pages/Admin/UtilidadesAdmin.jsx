// Utilidades compartidas para los componentes del panel de administración
// Contiene funciones de formateo y componentes reutilizables (Badge)

// Formatea una fecha al formato local colombiano (ej: "28 abr 2026")
export function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Componente Badge — Muestra una etiqueta visual con el estado (activo, suspendido, pendiente, etc.)
export function Badge({ estado }) {
  const label = estado?.toLowerCase() || "—";
  return (
    <span className={`admin-badge admin-badge--${label}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}
