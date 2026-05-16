import { useState, useEffect, useCallback } from "react";
import { CANTIDAD_POR_PAGINA, CHIPS_CATEGORIA } from "../shared/constantes";
import { normalizar, promedioEstrellas } from "../shared/utilidades";
import TarjetaServicio from "../shared/TarjetaServicio";

export default function SeccionBuscar({ serviciosTotales }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActual, setCategoriaActual] = useState("todos");
  const [orden, setOrden] = useState("recientes");
  const [mostrados, setMostrados] = useState(CANTIDAD_POR_PAGINA);
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    aplicarFiltros(busqueda, categoriaActual, orden, CANTIDAD_POR_PAGINA);
    setMostrados(CANTIDAD_POR_PAGINA);
  }, [serviciosTotales]);

  const aplicarFiltros = useCallback(
    (texto, cat, ord, limite) => {
      let filtrados = [...serviciosTotales].filter((s) => {
        const q = normalizar(texto);
        const coincideTexto =
          !q ||
          normalizar(s.titulo).includes(q) ||
          normalizar(s.descripcion).includes(q) ||
          normalizar(s.nombre_categoria).includes(q) ||
          normalizar(s.proveedor).includes(q);

        const coincideCat =
          cat === "todos" ||
          normalizar(s.nombre_categoria).includes(normalizar(cat));

        return coincideTexto && coincideCat;
      });

      switch (ord) {
        case "precio-menor":
          filtrados.sort(
            (a, b) => Number(a.precio_hora || 0) - Number(b.precio_hora || 0),
          );
          break;
        case "precio-mayor":
          filtrados.sort(
            (a, b) => Number(b.precio_hora || 0) - Number(a.precio_hora || 0),
          );
          break;
        case "rating-mayor":
          filtrados.sort(
            (a, b) =>
              promedioEstrellas(b.estrellas) - promedioEstrellas(a.estrellas),
          );
          break;
        case "rating-menor":
          filtrados.sort(
            (a, b) =>
              promedioEstrellas(a.estrellas) - promedioEstrellas(b.estrellas),
          );
          break;
        case "antiguos":
          filtrados.sort(
            (a, b) =>
              new Date(a.fecha_publicacion || 0) -
              new Date(b.fecha_publicacion || 0),
          );
          break;
        default:
          filtrados.sort(
            (a, b) =>
              new Date(b.fecha_publicacion || 0) -
              new Date(a.fecha_publicacion || 0),
          );
      }

      setResultados(filtrados.slice(0, limite));
    },
    [serviciosTotales],
  );

  const handleBusqueda = (e) => {
    const val = e.target.value;
    setBusqueda(val);
    aplicarFiltros(val, categoriaActual, orden, mostrados);
  };

  const handleCategoria = (cat, e) => {
    document
      .querySelectorAll("#filtros-categorias .chip")
      .forEach((b) => b.classList.remove("activo"));
    e.target.classList.add("activo");
    setCategoriaActual(cat);
    aplicarFiltros(busqueda, cat, orden, mostrados);
  };

  const handleOrden = (e) => {
    const val = e.target.value;
    setOrden(val);
    aplicarFiltros(busqueda, categoriaActual, val, mostrados);
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
    aplicarFiltros(busqueda, categoriaActual, nuevo, mostrados);
  };

  const handleMostrarMas = () => {
    const nuevo = mostrados + CANTIDAD_POR_PAGINA;
    setMostrados(nuevo);
    aplicarFiltros(busqueda, categoriaActual, orden, nuevo);
  };

  return (
    <section className="seccion seccion-oscura" id="buscar">
      <div className="bg-canvas bg-canvas-grid-lines" />
      <header
        className="seccion"
        style={{ paddingBottom: 0, paddingTop: 0, background: "transparent" }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <p className="label-seccion reveal">Marketplace Universitario</p>
          <h1 className="reveal delay-1" style={{ fontSize: "2.5rem" }}>
            Todos los <span className="acento">servicios</span>
          </h1>
          <div
            className="search-container reveal delay-2"
            style={{ maxWidth: "700px", margin: "30px auto" }}
          >
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

      <div
        className="container chips-container-enhanced"
        id="filtros-categorias"
        style={{ marginBottom: "24px" }}
      >
        {CHIPS_CATEGORIA.map((chip) => (
          <button
            key={chip.valor}
            className={`chip-enhanced${categoriaActual === chip.valor ? " activo" : ""}`}
            onClick={(e) => handleCategoria(chip.valor, e)}
            type="button"
          >
            <i className={`bi ${chip.icono}`}></i> {chip.label}
          </button>
        ))}
      </div>

      <div className="container">
        <div className="sort-bar reveal">
          <p className="texto-muted">
            Resultados:{" "}
            <strong className="texto-claro">{resultados.length}</strong>
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

        <div className="cards-grid" id="contenedor-explorar">
          {resultados.length === 0 ? (
            <p
              className="texto-muted"
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "32px 0",
              }}
            >
              No se encontraron servicios.
            </p>
          ) : (
            resultados.map((s) => (
              <TarjetaServicio key={s.id_servicio} servicio={s} linkBase="/login?id=" />
            ))
          )}
        </div>

        <div
          id="contenedor-boton"
          style={{ textAlign: "center", marginTop: "32px" }}
        >
          {resultados.length >= mostrados && (
            <button
              type="button"
              className="btn btn-verde"
              onClick={handleMostrarMas}
            >
              Mostrar más servicios
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
