/**
 * StarRating — Estrellas con relleno parcial via SVG clipPath.
 *
 * Props:
 *   rating  (number)  — valor entre 0 y 5, acepta decimales (ej. 4.4)
 *   size    (number)  — tamaño en px de cada estrella (default 18)
 *   color   (string)  — color de relleno (default "#F5A623")
 *   gap     (number)  — separación entre estrellas en px (default 2)
 *
 * Uso:
 *   <StarRating rating={4.4} />
 *   <StarRating rating={prom} size={22} />
 */
export default function StarRating({ rating = 0, size = 18, color = "#F5A623", gap = 2 }) {
  const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: `${gap}px` }}
      aria-label={`${safeRating.toFixed(1)} de 5 estrellas`}
      role="img"
    >
      {Array.from({ length: 5 }, (_, i) => {
        // Fracción de relleno para esta estrella: 0 = vacía, 1 = llena, 0.x = parcial
        const fill = Math.min(1, Math.max(0, safeRating - i));
        const id = `star-clip-${i}-${Math.random().toString(36).slice(2, 7)}`;

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <defs>
              {/* El clipPath controla cuánto de la estrella amarilla se ve */}
              <clipPath id={id}>
                <rect x="0" y="0" width={20 * fill} height="20" />
              </clipPath>
            </defs>

            {/* Estrella de fondo (gris / vacía) */}
            <path
              d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z"
              fill="#D1D5DB"
            />

            {/* Estrella de relleno (amarilla), recortada según fill) */}
            <path
              d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z"
              fill={color}
              clipPath={`url(#${id})`}
            />
          </svg>
        );
      })}
    </span>
  );
}