export function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Badge({ estado }) {
  const label = estado?.toLowerCase() || "—";
  return (
    <span className={`admin-badge admin-badge--${label}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}
