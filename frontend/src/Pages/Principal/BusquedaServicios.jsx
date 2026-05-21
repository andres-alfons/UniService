// ─── BusquedaServicios.jsx ───────────────────────────────────────────────────
// Sección de búsqueda y exploración de servicios para usuarios autenticados.
// AHORA usa paginación y filtrado del BACKEND para mejor rendimiento.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { CANTIDAD_POR_PAGINA, CHIPS_CATEGORIA, API_HOME } from "../shared/constantes";
import { normalizar, promedioEstrellas, debounce } from "../shared/utilidades";
import TarjetaServicio from "../shared/TarjetaServicio";

export default function SeccionBuscar() {
  // Estado del buscador, categoría activa, orden y paginación
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActual, setCategoriaActual] = useState("todos");
  const [orden, setOrden] = useState("recientes");
  const [pagina, setPagina] = useState(1);
  
  // Datos del backend
  const [resultados, setResultados] = useState([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Ref para debounce
  const busquedaRef = useRef("");

  // Función para cargar servicios desde el backend con paginación
  const cargarServicios = useCallback(async (page, texto, cat, ord) => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        page: page,
        pageSize: CANTIDAD_POR_PAGINA,
        orden: ord,
      });

      if (cat !== "todos") params.append("categoria", cat);
      if (texto.trim()) params.append("busqueda", texto.trim());

      const res = await fetch(`${API_HOME}?${params.toString()}`);
      const data = await res.json();

      if (data.servicios) {
        // Respuesta paginada (nuevo)
        setResultados(data.servicios);
        setTotalResultados(data.paginacion.total);
        setTotalPaginas(data.paginacion.totalPaginas);
      } else if (Array.isArray(data)) {
        // Respuesta legacy (todos los servicios)
        setResultados(data);
        setTotalResultados(data.length);
        setTotalPaginas(Math.ceil(data.length / CANTIDAD_POR_PAGINA));
      }
    } catch (err) {
      console.error("Error cargando servicios:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    cargarServicios(1, "", "todos", "recientes");
  }, [cargarServicios]);

  // Función debounce para búsqueda por texto
  const cargarConDebounce = useRef(
    debounce((texto, cat, ord) => {
      setPagina(1);
      cargarServicios(1, texto, cat, ord);
    }, 400)
  ).current;

  // Maneja cambios en el campo de búsqueda por texto
  const handleBusqueda = (e) => {
    const val = e.target.value;
    setBusqueda(val);
    busquedaRef.current = val;
    cargarConDebounce(val, categoriaActual, orden);
  };

  // Maneja clics en los chips de categoría
  const handleCategoria = (cat) => {
    setCategoriaActual(cat);
    setPagina(1);
    cargarServicios(1, busquedaRef.current, cat, orden);
  };

  // Maneja cambios en el selector de ordenamiento
  const handleOrden = (e) => {
    const val = e.target.value;
    setOrden(val);
    setPagina(1);
    cargarServicios(1, busquedaRef.current, categoriaActual, val);
  };

  // Cargar más (siguiente página)
  const handleMostrarMas = () => {
    const nuevaPagina = pagina + 1;
    setPagina(nuevaPagina);
    cargarServicios(nuevaPagina, busquedaRef.current, categoriaActual, orden);
  };

  // Invertir el orden actual
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

  const resultadosMostrados = resultados.length;
  const hayMasResultados = pagina < totalPaginas;

  return (
    <section className="seccion seccion-oscura" id="buscar">
      <div className="bg-canvas bg-canvas-grid-lines" />
      <header className="seccion" style={{ paddingBottom: 0, paddingTop: 0, background: "transparent" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p className="label-seccion reveal">Marketplace Universitario</p>
          <h1 className="reveal delay-1" style={{ fontSize: "2.5rem" }}>
            Todos los <span className="acento">servicios</span>
          </h1>
          {/* Barra de búsqueda principal */}
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

      {/* Chips de filtro por categoría */}
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
        {/* Barra de ordenamiento con selector y botón para invertir */}
        <div className="sort-bar reveal">
          <p className="texto-muted">
            Resultados: <strong className="texto-claro">{totalResultados}</strong>
            {cargando && " (cargando...)"}
          </p>
          <div className="sort-group">
            <select
              className="sort-select"
              value={orden}
              onChange={handleOrden}
            >
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

        {/* Cuadrícula de resultados */}
        <div className="cards-grid" id="contenedor-explorar">
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

        {/* Botón "Mostrar más" */}
        <div id="contenedor-boton" style={{ textAlign: "center", marginTop: "32px" }}>
          {hayMasResultados && (
            <button 
              type="button" 
              className="btn btn-verde" 
              onClick={handleMostrarMas}
              disabled={cargando}
            >
              {cargando ? "Cargando..." : `Mostrar más (${totalResultados - resultadosMostrados} restantes)`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
