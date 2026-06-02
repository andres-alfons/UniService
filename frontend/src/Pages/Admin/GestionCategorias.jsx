import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/apiFetch";

const API = "/api";

export default function SeccionCategorias({ onRefresh }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nueva, setNueva] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [modal, setModal] = useState(null);

  const cargarCategorias = async () => {
    setCargando(true);
    try {
      const { data: servicios } = await apiFetch(`${API}/services`);
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
      setModal({
        tipo: "error",
        titulo: "No se puede eliminar",
        mensaje: `No se puede eliminar "${nombre}" porque tiene ${cat.servicios} servicios asociados.`,
      });
      return;
    }
    setModal({
      tipo: "confirm",
      titulo: "Eliminar categoría",
      mensaje: `¿Eliminar la categoría "${nombre}"?`,
      onConfirm: () => {
        setCategorias((prev) => prev.filter((c) => c.nombre !== nombre));
        if (window.registrarLogAdmin) {
          window.registrarLogAdmin("Eliminó categoría", nombre);
        }
        setModal({ tipo: "success", titulo: "Categoría eliminada", mensaje: `"${nombre}" ha sido eliminada.` });
      },
    });
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

      {modal && (
        <AdminModal modal={modal} onClose={() => setModal(null)} />
      )}
    </section>
  );
}

function AdminModal({ modal, onClose }) {
  const isConfirm = modal.tipo === "confirm";
  const isSuccess = modal.tipo === "success";
  const isError = modal.tipo === "error";

  const icon = isConfirm
    ? <i className="bi bi-question-circle-fill" style={{ fontSize: "2.5rem", color: "#f59e0b" }}></i>
    : isSuccess
    ? <i className="bi bi-check-circle-fill" style={{ fontSize: "2.5rem", color: "#10b981" }}></i>
    : <i className="bi bi-x-circle-fill" style={{ fontSize: "2.5rem", color: "#ef4444" }}></i>;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-icon">{icon}</div>
        <h3 className="admin-modal-title">{modal.titulo}</h3>
        <p className="admin-modal-message">{modal.mensaje}</p>
        <div className="admin-modal-actions">
          {isConfirm ? (
            <>
              <button className="admin-btn-action admin-btn-action--ghost" onClick={onClose}>
                Cancelar
              </button>
              <button className="admin-btn-action admin-btn-action--danger" onClick={() => { onClose(); modal.onConfirm(); }}>
                Confirmar
              </button>
            </>
          ) : (
            <button className="admin-btn-action admin-btn-action--success" onClick={onClose}>
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
