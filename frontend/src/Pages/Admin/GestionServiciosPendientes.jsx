import { useState, useEffect } from "react";
import { formatFecha } from "./UtilidadesAdmin";

const API = "/api";

export default function SeccionServiciosPendientes({ onRefresh }) {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [accionandoId, setAccionandoId] = useState(null);
  const [modal, setModal] = useState(null);

  const cargarPendientes = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/services`);
      const data = await res.json();
      const servicios = Array.isArray(data) ? data : [];
      const filtrados = servicios.filter(
        (s) =>
          s.estado_servicio === "pendiente" ||
          s.estado === "pendiente" ||
          s.disponibilidad === "pendiente"
      );
      setPendientes(filtrados);
    } catch {
      setPendientes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const aprobar = async (id) => {
    const servicio = pendientes.find((s) => s.id_servicio === id);
    setModal({
      tipo: "confirm",
      titulo: "Aprobar servicio",
      mensaje: `¿Aprobar "${servicio?.titulo}" y publicarlo?`,
      onConfirm: async () => {
        setAccionandoId(id);
        try {
          await fetch(`${API}/services/${id}/aprobar`, { method: "PUT" });
          setPendientes((prev) => prev.filter((s) => s.id_servicio !== id));
          if (window.registrarLogAdmin) {
            window.registrarLogAdmin("Aprobó servicio", `${servicio?.titulo} (ID: ${id})`);
          }
          if (onRefresh) onRefresh();
          setModal({ tipo: "success", titulo: "Servicio aprobado", mensaje: `"${servicio?.titulo}" ha sido publicado correctamente.` });
        } catch (err) {
          setModal({ tipo: "error", titulo: "Error", mensaje: err.message });
        } finally {
          setAccionandoId(null);
        }
      },
    });
  };

  const rechazar = async (id) => {
    const servicio = pendientes.find((s) => s.id_servicio === id);
    setModal({
      tipo: "confirm",
      titulo: "Rechazar servicio",
      mensaje: `¿Rechazar "${servicio?.titulo}"? Esta acción eliminará el servicio.`,
      onConfirm: async () => {
        setAccionandoId(id);
        try {
          await fetch(`${API}/services/${id}/rechazar`, { method: "PUT" });
          setPendientes((prev) => prev.filter((s) => s.id_servicio !== id));
          if (window.registrarLogAdmin) {
            window.registrarLogAdmin("Rechazó servicio", `${servicio?.titulo} (ID: ${id})`);
          }
          setModal({ tipo: "success", titulo: "Servicio rechazado", mensaje: `"${servicio?.titulo}" ha sido rechazado.` });
        } catch (err) {
          setModal({ tipo: "error", titulo: "Error", mensaje: err.message });
        } finally {
          setAccionandoId(null);
        }
      },
    });
  };

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="admin-section__pre admin-section__pre--warning">
            Moderación
          </p>
          <h2 className="admin-section__title">Servicios Pendientes</h2>
          <p style={{ color: "var(--texto2)", fontSize: "0.85rem", marginTop: "4px" }}>
            Servicios que requieren aprobación antes de ser publicados
          </p>
        </div>
      </div>

      {cargando ? (
        <p style={{ color: "var(--texto2)", textAlign: "center", padding: "40px" }}>
          Cargando servicios pendientes...
        </p>
      ) : pendientes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <i
            className="bi bi-check-circle"
            style={{ fontSize: "3rem", color: "var(--color-success)" }}
          ></i>
          <h3 style={{ color: "var(--texto)", marginTop: "12px" }}>
            No hay servicios pendientes
          </h3>
          <p style={{ color: "var(--texto2)" }}>
            Todos los servicios han sido revisados
          </p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                {["Servicio", "Proveedor", "Categoría", "Precio/hr", "Fecha", "Acciones"].map(
                  (h) => (
                    <th key={h}>{h}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {pendientes.map((s) => (
                <tr key={s.id_servicio}>
                  <td>
                    <div className="admin-table__service-info">
                      <span className="admin-table__service-icon">
                        <i
                          className={`bi ${
                            s.icono?.startsWith("bi-") ? s.icono : "bi-pin"
                          }`}
                        ></i>
                      </span>
                      <div>
                        <p className="admin-table__service-name">{s.titulo}</p>
                        <p className="admin-table__id">ID #{s.id_servicio}</p>
                      </div>
                    </div>
                  </td>
                  <td className="admin-table__provider">{s.proveedor}</td>
                  <td className="admin-table__category">
                    {s.nombre_categoria}
                  </td>
                  <td className="admin-table__price">
                    ${(s.precio_hora || 0).toLocaleString("es-CO")}
                  </td>
                  <td className="admin-table__date">
                    {formatFecha(s.fecha_publicacion)}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        className="admin-btn-action admin-btn-action--approve"
                        onClick={() => aprobar(s.id_servicio)}
                        disabled={accionandoId === s.id_servicio}
                      >
                        {accionandoId === s.id_servicio
                          ? "..."
                          : "✓ Aprobar"}
                      </button>
                      <button
                        className="admin-btn-action admin-btn-action--danger"
                        onClick={() => rechazar(s.id_servicio)}
                        disabled={accionandoId === s.id_servicio}
                      >
                        {accionandoId === s.id_servicio
                          ? "..."
                          : "✕ Rechazar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
