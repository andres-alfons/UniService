// Las categorías como un cartel: una por línea, enorme, con lo que hay hoy a la derecha.
// Al elegir una, el tablero de abajo se filtra por ella.
import { CHIPS_CATEGORIA } from "../shared/constantes";
import { precioCorto } from "./Volante";

const NOMBRES = {
  tutorias: "Tutorías",
  ensayos: "Ensayos",
  proyectos: "Proyectos",
  programacion: "Programación",
  diseno: "Diseño",
  arriendo: "Arriendo",
};

export default function Cartelera({ categorias, onElegir }) {
  const lineas = CHIPS_CATEGORIA.filter((c) => NOMBRES[c.valor]);

  const dato = (valor) => {
    const d = categorias[valor];
    if (!d) return "Cargando…";
    if (d.total === 0) return "Aún nadie lo ofrece";
    const desde = d.desde ? ` · desde ${precioCorto(d.desde.precio_hora, d.desde.unidad_precio)}` : "";
    return `${d.total} ${d.total === 1 ? "servicio" : "servicios"}${desde}`;
  };

  return (
    <section className="us-campo us-campo--verde" aria-label="Categorías de servicios">
      <ul className="us-cartelera us-ancho">
        {lineas.map((c, i) => (
          <li key={c.valor} data-revela style={{ "--i": i }}>
            <button type="button" onClick={() => onElegir(c.valor)}>
              <span className="us-cartelera-nombre">{NOMBRES[c.valor]}</span>
              <span className="us-cartelera-dato">{dato(c.valor)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
