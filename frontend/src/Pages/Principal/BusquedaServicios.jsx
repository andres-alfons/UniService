// ─── BusquedaServicios.jsx ───────────────────────────────────────────────────
// Sección de búsqueda y exploración de servicios para usuarios autenticados.
// Usa paginación con flechas, animación de desvanecimiento e indicador de páginas.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { CANTIDAD_POR_PAGINA, CHIPS_CATEGORIA, API_HOME } from "../shared/constantes";
import { normalizar, promedioEstrellas, debounce } from "../shared/utilidades";
import TarjetaServicio from "../shared/TarjetaServicio";

export default function SeccionBuscar() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActual, setCategoriaActual] = useState("todos");
  const [orden, setOrden] = useState("recientes");
  const [pagina, setPagina] = useState(1);

  const [resultados, setResultados] = useState([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [fadeClass, setFadeClass] = useState("fade-visible");

  const busquedaRef = useRef("");

  const cargarServicios = useCallback(async (page, texto, cat, ord) => {
    setCargando(true);
    setFadeClass("fade-exit");

    try {
      const params = new URLSearchParams({
        page: page,
        pageSize: CANTIDAD_POR_PAGINA(),
        orden: ord,
      });

      if (cat !== "todos") params.append("categoria", cat);
      if (texto.trim()) params.append("busqueda", texto.trim());

      const res = await fetch(`${API_HOME}?${params.toString()}`);
      const data = await res.json();

      if (data.servicios) {
        setResultados(data.servicios);
        setTotalResultados(data.paginacion.total);
        setTotalPaginas(data.paginacion.totalPaginas);
      } else if (Array.isArray(data)) {
        setResultados(data);
        setTotalResultados(data.length);
        setTotalPaginas(Math.ceil(data.length / CANTIDAD_POR_PAGINA()));
      }

      setTimeout(() => setFadeClass("fade-enter"), 50);
      setTimeout(() => setFadeClass("fade-visible"), 200);
    } catch (err) {
      console.error("Error cargando servicios:", err);
      setFadeClass("fade-visible");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarServicios(1, "", "todos", "recientes");
  }, [cargarServicios]);

  const cargarConDebounce = useRef(
    debounce((texto, cat, ord) => {
      setPagina(1);
      cargarServicios(1, texto, cat, ord);
    }, 400)
  ).current;

  const handleBusqueda = (e) => {
    const val = e.target.value;
    setBusqueda(val);
    busquedaRef.current = val;
    cargarConDebounce(val, categoriaActual, orden);
  };

  const handleCategoria = (cat) => {
    setCategoriaActual(cat);
    setPagina(1);
    cargarServicios(1, busquedaRef.current, cat, orden);
  };

  const handleOrden = (e) => {
    const val = e.target.value;
    setOrden(val);
    setPagina(1);
    cargarServicios(1, busquedaRef.current, categoriaActual, val);
  };

  const irPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas || cargando) return;
    setPagina(nuevaPagina);
    cargarServicios(nuevaPagina, busquedaRef.current, categoriaActual, orden);
  };

  const handleToggleOrden = () => {
    const pares = {
      recientes: "antiguos",
      antiguos: "recientes",
      "precio-menor": "precio-mayor",
      "precio-mayor": "precio-menor",
      "rating-mayor": "rating-menor",
      "rating-menor": "rating-mayor",
    };
    const nuevo = pares[orden] || "recientes";
    setOrden(nuevo);
    setPagina(1);
    cargarServicios(1, busquedaRef.current, categoriaActual, nuevo);
  };

  const generarPaginas = () => {
    const paginas = [];
    const maxVisible = 5;
    let inicio = Math.max(1, pagina - Math.floor(maxVisible / 2));
    const fin = Math.min(totalPaginas, inicio + maxVisible - 1);
    if (fin - inicio < maxVisible - 1) {
      inicio = Math.max(1, fin - maxVisible + 1);
    }

    if (inicio > 1) {
      paginas.push(1);
      if (inicio > 2) paginas.push("...");
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    if (fin < totalPaginas) {
      if (fin < totalPaginas - 1) paginas.push("...");
      paginas.push(totalPaginas);
    }

    return paginas;
  };

  return (
    <section className="seccion seccion-oscura" id="buscar">
      <div className="bg-canvas bg-canvas-grid-lines" />
      <header className="seccion" style={{ paddingBottom: 0, paddingTop: 0, background: "transparent" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p className="label-seccion reveal">Marketplace Universitario</p>
          <h1 className="reveal delay-1" style={{ fontSize: "2.5rem" }}>
            Todos los <span className="acento">servicios</span>
          </h1>
          <div className="search-container reveal delay-2" style={{ maxWidth: "700px", margin: "30px auto" }}>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder=" ¿Qué necesitas hoy? (Ej: Álgebra, Logo, Habitación...)"
                value={busqueda}
                onChange={handleBusqueda}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container chips-container-enhanced" id="filtros-categorias" style={{ marginBottom: "24px" }}>
        {CHIPS_CATEGORIA.map((chip) => (
          <button
            key={chip.valor}
            className={`chip-enhanced${categoriaActual === chip.valor ? " activo" : ""}`}
            onClick={() => handleCategoria(chip.valor)}
            type="button"
          >
            <i className={`bi ${chip.icono}`}></i> {chip.label}
          </button>
        ))}
      </div>

      <div className="container">
        <div className="sort-bar reveal">
          <p className="texto-muted">
            Resultados: <strong className="texto-claro">{totalResultados}</strong>
            {cargando && " (cargando...)"}
          </p>
          <div className="sort-group">
            <select className="sort-select" value={orden} onChange={handleOrden}>
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="precio-menor">Menor precio</option>
              <option value="precio-mayor">Mayor precio</option>
              <option value="rating-mayor">Mejor calificación</option>
              <option value="rating-menor">Peor calificación</option>
            </select>
            <button type="button" className="sort-toggle" onClick={handleToggleOrden} aria-label="Invertir orden">
              <i className="bi bi-arrow-down-up"></i>
            </button>
          </div>
        </div>

        <div className={`cards-grid ${fadeClass}`} id="contenedor-explorar">
          {cargando && resultados.length === 0 ? (
            <p className="texto-muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "32px 0" }}>
              Cargando servicios...
            </p>
          ) : resultados.length === 0 ? (
            <p className="texto-muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "32px 0" }}>
              No se encontraron servicios.
            </p>
          ) : (
            resultados.map((s) => (
              <TarjetaServicio key={s.id_servicio} servicio={s} />
            ))
          )}
        </div>

        {/* Navegación con flechas e indicador de páginas */}
        {totalPaginas > 1 && (
          <div className="paginacion-container">
            <button
              type="button"
              className="btn-pagina btn-pagina-arrow"
              onClick={() => irPagina(pagina - 1)}
              disabled={pagina <= 1 || cargando}
              aria-label="Página anterior"
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            <div className="paginas-numeros">
              {generarPaginas().map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="paginas-separador">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`btn-pagina-numero${pagina === p ? " activo" : ""}`}
                    onClick={() => irPagina(p)}
                    disabled={cargando}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              className="btn-pagina btn-pagina-arrow"
              onClick={() => irPagina(pagina + 1)}
              disabled={pagina >= totalPaginas || cargando}
              aria-label="Página siguiente"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}

        {totalPaginas > 0 && (
          <p className="paginas-info">
            Página {pagina} de {totalPaginas}
          </p>
        )}
      </div>
    </section>
  );
}
