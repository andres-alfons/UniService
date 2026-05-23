import { useState, useEffect } from "react";
import { formatFecha } from "./UtilidadesAdmin";

const API = "/api";

export default function SeccionServiciosPendientes({ onRefresh }) {
  const [razonRechazo, setRazonRechazo] = useState("");
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [accionandoId, setAccionandoId] = useState(null);
  const [modal, setModal] = useState(null);
  const [verDetalle, setVerDetalle] = useState(null);
  const [imagenesDetalle, setImagenesDetalle] = useState([]);
  const [cargandoImagenes, setCargandoImagenes] = useState(false);

  const cargarPendientes = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/services/admin/all`);
      const data = await res.json();
      const servicios = Array.isArray(data) ? data : [];
      const filtrados = servicios.filter(
        (s) => s.disponibilidad === "Pausado"
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

  const verImagenes = async (id) => {
    if (verDetalle === id) {
      setVerDetalle(null);
      setImagenesDetalle([]);
      return;
    }
    setVerDetalle(id);
    setCargandoImagenes(true);
    setImagenesDetalle([]);
    try {
      const res = await fetch(`${API}/services/${id}`);
      const data = await res.json();
      setImagenesDetalle(data.imagenes || []);
    } catch {
      setImagenesDetalle([]);
    } finally {
      setCargandoImagenes(false);
    }
  };

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
  setRazonRechazo("");
  setModal({
    tipo: "rechazar",
    titulo: "Rechazar servicio",
    servicio,
    onConfirm: async (razon) => {
      setAccionandoId(id);
      try {
        await fetch(`${API}/services/${id}/rechazar`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ razon }),
        });
        setPendientes((prev) => prev.filter((s) => s.id_servicio !== id));
        if (window.registrarLogAdmin) {
          window.registrarLogAdmin("Rechazó servicio", `${servicio?.titulo} (ID: ${id})`);
        }
        setModal({ tipo: "success", titulo: "Servicio rechazado", mensaje: `"${servicio?.titulo}" ha sido rechazado y el proveedor fue notificado.` });
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
                        className="admin-btn-action admin-btn-action--info"
                        onClick={() => verImagenes(s.id_servicio)}
                        title="Ver imágenes y detalles"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
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

      {verDetalle && (
        <div className="admin-modal-overlay" onClick={() => { setVerDetalle(null); setImagenesDetalle([]); }}>
          <div className="admin-modal-content admin-modal-pending-detail" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 className="admin-modal-title" style={{ margin: 0 }}>
                  {pendientes.find((s) => s.id_servicio === verDetalle)?.titulo || "Servicio"}
                </h3>
                <p style={{ color: "var(--texto2)", fontSize: "0.8rem", marginTop: "4px" }}>
                  {pendientes.find((s) => s.id_servicio === verDetalle)?.descripcion || ""}
                </p>
              </div>
              <button
                onClick={() => { setVerDetalle(null); setImagenesDetalle([]); }}
                className="admin-btn-action admin-btn-action--ghost"
                style={{ padding: "4px 10px", minWidth: "auto" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              <div style={{ background: "var(--bg2)", padding: "8px 12px", borderRadius: "6px" }}>
                <span style={{ color: "var(--texto2)", fontSize: "0.7rem", textTransform: "uppercase" }}>Proveedor</span>
                <p style={{ color: "var(--texto)", fontSize: "0.85rem", margin: "2px 0 0" }}>
                  {pendientes.find((s) => s.id_servicio === verDetalle)?.proveedor || "—"}
                </p>
              </div>
              <div style={{ background: "var(--bg2)", padding: "8px 12px", borderRadius: "6px" }}>
                <span style={{ color: "var(--texto2)", fontSize: "0.7rem", textTransform: "uppercase" }}>Categoría</span>
                <p style={{ color: "var(--texto)", fontSize: "0.85rem", margin: "2px 0 0" }}>
                  {pendientes.find((s) => s.id_servicio === verDetalle)?.nombre_categoria || "—"}
                </p>
              </div>
              <div style={{ background: "var(--bg2)", padding: "8px 12px", borderRadius: "6px" }}>
                <span style={{ color: "var(--texto2)", fontSize: "0.7rem", textTransform: "uppercase" }}>Precio/hr</span>
                <p style={{ color: "var(--texto)", fontSize: "0.85rem", margin: "2px 0 0" }}>
                  ${(pendientes.find((s) => s.id_servicio === verDetalle)?.precio_hora || 0).toLocaleString("es-CO")}
                </p>
              </div>
              <div style={{ background: "var(--bg2)", padding: "8px 12px", borderRadius: "6px" }}>
                <span style={{ color: "var(--texto2)", fontSize: "0.7rem", textTransform: "uppercase" }}>Modalidad</span>
                <p style={{ color: "var(--texto)", fontSize: "0.85rem", margin: "2px 0 0" }}>
                  {pendientes.find((s) => s.id_servicio === verDetalle)?.modalidad || "—"}
                </p>
              </div>
            </div>

            <h4 style={{ color: "var(--texto)", fontSize: "0.9rem", marginBottom: "10px" }}>
              <i className="bi bi-images" style={{ marginRight: "6px" }}></i>
              Imágenes del servicio
            </h4>

            {cargandoImagenes ? (
              <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px" }}>Cargando imágenes...</p>
            ) : imagenesDetalle.length === 0 ? (
              <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px", fontSize: "0.85rem" }}>
                Este servicio no tiene imágenes subidas.
              </p>
            ) : (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", maxHeight: "35vh", overflowY: "auto", padding: "8px 0" }}>
                {imagenesDetalle.map((img) => (
                  <div
                    key={img.id_imagen}
                    style={{
                      position: "relative",
                      width: "140px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: img.es_principal ? "2px solid var(--color-success)" : "1px solid var(--borde)",
                      background: "var(--bg2)",
                    }}
                  >
                    <img
                      src={img.url_imagen}
                      alt="Servicio"
                      style={{ width: "100%", height: "100px", objectFit: "cover", display: "block" }}
                      onError={(e) => { e.target.style.display = "none"; e.target.parentElement.innerHTML += '<p style="color:var(--texto2);font-size:0.7rem;padding:10px;text-align:center;">Error al cargar</p>'; }}
                    />
                    {img.es_principal && (
                      <span style={{ position: "absolute", top: "4px", left: "4px", background: "var(--color-success)", color: "#fff", fontSize: "0.55rem", padding: "1px 5px", borderRadius: "3px", fontWeight: 700 }}>
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--borde)" }}>
              <button
                className="admin-btn-action admin-btn-action--approve"
                onClick={() => { setVerDetalle(null); setImagenesDetalle([]); aprobar(verDetalle); }}
                disabled={accionandoId === verDetalle}
              >
                ✓ Aprobar
              </button>
              <button
                className="admin-btn-action admin-btn-action--danger"
                onClick={() => { setVerDetalle(null); setImagenesDetalle([]); rechazar(verDetalle); }}
                disabled={accionandoId === verDetalle}
              >
                ✕ Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <AdminModal modal={modal} onClose={() => setModal(null)} />
      )}
    </section>
  );
}

function AdminModal({ modal, onClose }) {
  const [razon, setRazon] = useState("");

  if (modal.tipo === "rechazar") {
    return (
      <div className="admin-modal-overlay" onClick={onClose}>
        <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-icon">
            <i className="bi bi-x-circle-fill" style={{ fontSize: "2.5rem", color: "#ef4444" }}></i>
          </div>
          <h3 className="admin-modal-title">Rechazar servicio</h3>
          <p className="admin-modal-message">
            ¿Rechazar <strong>"{modal.servicio?.titulo}"</strong>? El proveedor será notificado por correo.
          </p>
          <div style={{ width: "100%", marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--texto2)", marginBottom: "6px" }}>
              Razón del rechazo <span style={{ color: "#999" }}>(opcional)</span>
            </label>
            <textarea
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              placeholder="Ej: Las imágenes no cumplen con los requisitos de calidad..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--borde)",
                background: "var(--bg2)",
                color: "var(--texto)",
                fontSize: "0.85rem",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div className="admin-modal-actions">
            <button className="admin-btn-action admin-btn-action--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="admin-btn-action admin-btn-action--danger"
              onClick={() => { onClose(); modal.onConfirm(razon); }}
            >
              Confirmar rechazo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isConfirm = modal.tipo === "confirm";
  const isSuccess = modal.tipo === "success";
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
              <button className="admin-btn-action admin-btn-action--ghost" onClick={onClose}>Cancelar</button>
              <button className="admin-btn-action admin-btn-action--danger" onClick={() => { onClose(); modal.onConfirm(); }}>Confirmar</button>
            </>
          ) : (
            <button className="admin-btn-action admin-btn-action--success" onClick={onClose}>Entendido</button>
          )}
        </div>
      </div>
    </div>
  );
}
