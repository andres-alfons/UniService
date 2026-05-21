import { useState, useEffect } from "react";

const API = "/api";

export default function SeccionCategorias({ onRefresh }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nueva, setNueva] = useState("");
  const [agregando, setAgregando] = useState(false);

  const cargarCategorias = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/services`);
      const servicios = await res.json();
      const serviciosArr = Array.isArray(servicios) ? servicios : [];

      const mapa = {};
      serviciosArr.forEach((s) => {
        const nombre = s.nombre_categoria || "Sin categoría";
        if (!mapa[nombre]) {
          mapa[nombre] = {
            id: nombre,
            nombre: nombre,
            icono: s.icono?.startsWith("bi-") ? s.icono : "bi-pin",
            servicios: 0,
          };
        }
        mapa[nombre].servicios++;
      });

      setCategorias(Object.values(mapa));
    } catch {
      setCategorias([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const eliminar = async (nombre) => {
    const cat = categorias.find((c) => c.nombre === nombre);
    if (cat && cat.servicios > 0) {
      alert(
        `No se puede eliminar "${nombre}" porque tiene ${cat.servicios} servicios asociados.`
      );
      return;
    }
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;
    setCategorias((prev) => prev.filter((c) => c.nombre !== nombre));
  };

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="admin-section__pre admin-section__pre--info">
            Configuración
          </p>
          <h2 className="admin-section__title">Categorías</h2>
        </div>
      </div>

      {cargando ? (
        <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px" }}>
          Cargando categorías...
        </p>
      ) : categorias.length === 0 ? (
        <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px" }}>
          No hay categorías registradas.
        </p>
      ) : (
        <div className="admin-category-grid">
          {categorias.map((c) => (
            <div key={c.id} className="admin-category-card">
              <div className="admin-category-card__header">
                <span className="admin-category-card__icon">
                  <i className={`bi ${c.icono}`}></i>
                </span>
                {c.servicios === 0 && (
                  <button
                    className="admin-category-card__delete"
                    onClick={() => eliminar(c.nombre)}
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="admin-category-card__name">{c.nombre}</p>
              <p className="admin-category-card__count">
                {c.servicios} servicios activos
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
