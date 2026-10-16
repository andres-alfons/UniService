// El tablero: búsqueda, filtro por categoría, orden y los volantes reales de la API.
import { useEffect, useRef, useState } from "react";
import { CHIPS_CATEGORIA } from "../shared/constantes";
import { listarServicios } from "../shared/servicios";
import Volante, { VolanteCargando } from "./Volante";

const ORDENES = [
  ["recientes", "Más recientes"],
  ["precio-menor", "Menor precio"],
  ["precio-mayor", "Mayor precio"],
  ["rating-mayor", "Mejor calificados"],
];

const porPagina = () => (window.innerWidth < 860 ? 8 : 12);

export default function Explorador({ categoria, onCategoria, linkBase }) {
  const [busqueda, setBusqueda] = useState("");
  const [consulta, setConsulta] = useState("");
  const [orden, setOrden] = useState("recientes");
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState({ servicios: [], total: 0, totalPaginas: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const seccionRef = useRef(null);
  const paginaAnterior = useRef(1);

  // La búsqueda se envía cuando el usuario deja de escribir.
  useEffect(() => {
    const t = setTimeout(() => setConsulta(busqueda), 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => setPagina(1), [consulta, categoria, orden]);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    listarServicios({ pagina, porPagina: porPagina(), categoria, busqueda: consulta, orden })
      .then((d) => {
        if (!vigente) return;
        setDatos(d);
        setError("");
      })
      .catch(() => vigente && setError("No pudimos cargar los servicios. Revisa tu conexión e inténtalo de nuevo."))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [pagina, categoria, consulta, orden]);

  // Al pasar de página se vuelve al principio del tablero (no al cargar ni al filtrar).
  useEffect(() => {
    if (pagina > 1 || paginaAnterior.current > 1) {
      if (pagina !== paginaAnterior.current) seccionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    paginaAnterior.current = pagina;
  }, [pagina]);

  const nombreCategoria = CHIPS_CATEGORIA.find((c) => c.valor === categoria)?.label;

  return (
    <section className="us-campo us-campo--papel" id="buscar" ref={seccionRef} aria-labelledby="buscar-titulo">
      <div className="us-ancho">
        <div className="us-explorador-cabeza">
          <h2 id="buscar-titulo" className="us-titulo" data-revela>
            Lo que hay en la cartelera
          </h2>
          <form className="us-buscador" role="search" onSubmit={(e) => e.preventDefault()} data-revela style={{ "--i": 1 }}>
            <label htmlFor="us-busqueda">Busca por tema, materia o nombre</label>
            <div className="us-buscador-fila">
              <input
                id="us-busqueda"
                type="search"
                value={busqueda}
                maxLength={100}
                placeholder="Cálculo, logo, habitación…"
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
                {ORDENES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="us-filtros" role="group" aria-label="Filtrar por categoría">
          {CHIPS_CATEGORIA.map((c) => (
            <button
              key={c.valor}
              type="button"
              className="us-filtro"
              aria-pressed={(categoria || "todos") === c.valor}
              onClick={() => onCategoria(c.valor === "todos" ? null : c.valor)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="us-resultados" aria-live="polite">
          {cargando
            ? "Buscando…"
            : `${datos.total} ${datos.total === 1 ? "servicio" : "servicios"}${nombreCategoria && categoria ? ` en ${nombreCategoria}` : ""}${consulta ? ` para “${consulta}”` : ""}`}
        </p>

        {error ? (
          <div className="us-vacio" role="alert">
            <strong>No cargó la cartelera</strong>
            <p>{error}</p>
          </div>
        ) : !cargando && datos.servicios.length === 0 ? (
          <div className="us-vacio">
            <strong>Nadie lo ofrece todavía</strong>
            <p>Prueba con otra palabra o quita el filtro de categoría. Si sabes hacerlo, puedes ser el primero en publicarlo.</p>
          </div>
        ) : (
          <div className="us-tablero" data-ui aria-busy={cargando}>
            {cargando && datos.servicios.length === 0
              ? Array.from({ length: 8 }, (_, i) => <VolanteCargando key={i} />)
              : datos.servicios.map((s) => <Volante key={s.id_servicio} servicio={s} linkBase={linkBase} />)}
          </div>
        )}

        {datos.totalPaginas > 1 && (
          <nav className="us-paginas" aria-label="Páginas">
            <button type="button" onClick={() => setPagina((p) => p - 1)} disabled={pagina <= 1 || cargando}>
              Anterior
            </button>
            <span>Página {pagina} de {datos.totalPaginas}</span>
            <button type="button" onClick={() => setPagina((p) => p + 1)} disabled={pagina >= datos.totalPaginas || cargando}>
              Siguiente
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
