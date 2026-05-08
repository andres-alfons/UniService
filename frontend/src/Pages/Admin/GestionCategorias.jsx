import { useState } from "react";

export default function SeccionCategorias() {
  const [categorias, setCategorias] = useState([
    { id: 1, nombre: "Tutorías", icono: "📚", servicios: 34 },
    { id: 2, nombre: "Ensayos", icono: "✍️", servicios: 12 },
    { id: 3, nombre: "Proyectos", icono: "🗂️", servicios: 8 },
    { id: 4, nombre: "Programación", icono: "💻", servicios: 21 },
    { id: 5, nombre: "Diseño", icono: "🎨", servicios: 7 },
    { id: 6, nombre: "Arriendo", icono: "🏠", servicios: 5 },
    { id: 7, nombre: "Otros", icono: "🌐", servicios: 3 },
  ]);
  const [nueva, setNueva] = useState({ nombre: "", icono: "" });
  const [agregando, setAgregando] = useState(false);

  const agregar = () => {
    if (!nueva.nombre.trim()) return;
    setCategorias((prev) => [
      ...prev,
      {
        id: Date.now(),
        nombre: nueva.nombre,
        icono: nueva.icono || "📌",
        servicios: 0,
      },
    ]);
    setNueva({ nombre: "", icono: "" });
    setAgregando(false);
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    setCategorias((prev) => prev.filter((c) => c.id !== id));
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
        <button className="admin-btn-new" onClick={() => setAgregando(true)}>
          + Nueva categoría
        </button>
      </div>

      {agregando && (
        <div className="admin-category-form">
          <input
            className="admin-category-form__icon"
            type="text"
            placeholder="Emoji"
            value={nueva.icono}
            onChange={(e) => setNueva((p) => ({ ...p, icono: e.target.value }))}
          />
          <input
            className="admin-category-form__name"
            type="text"
            placeholder="Nombre"
            value={nueva.nombre}
            onChange={(e) =>
              setNueva((p) => ({ ...p, nombre: e.target.value }))
            }
          />
          <button
            className="admin-btn-action admin-btn-action--info"
            onClick={agregar}
          >
            Crear
          </button>
          <button
            className="admin-btn-action admin-btn-action--ghost"
            onClick={() => setAgregando(false)}
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="admin-category-grid">
        {categorias.map((c) => (
          <div key={c.id} className="admin-category-card">
            <div className="admin-category-card__header">
              <span className="admin-category-card__icon">{c.icono}</span>
              <button
                className="admin-category-card__delete"
                onClick={() => eliminar(c.id)}
              >
                ✕
              </button>
            </div>
            <p className="admin-category-card__name">{c.nombre}</p>
            <p className="admin-category-card__count">
              {c.servicios} servicios activos
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
