import { useState, useEffect } from "react";
import { Badge, formatFecha } from "./UtilidadesAdmin";

const API = "/api";

export default function SeccionReportes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("todas");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API}/solicitudes/enviadas/0`);
        const data = await res.json();
        setSolicitudes(Array.isArray(data) ? data : []);
      } catch {
        setSolicitudes([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const filtradas =
    filtro === "todas"
      ? solicitudes
      : solicitudes.filter((s) => s.estado?.toLowerCase() === filtro);

  const getTipoReporte = (s) => {
    if (s.estado === "Pendiente") return "Solicitud pendiente";
    if (s.estado === "Aceptada") return "Solicitud aceptada";
    if (s.estado === "Rechazada") return "Solicitud rechazada";
    return "Solicitud";
  };

  return (
    <section className="admin-section">
      <div className="admin-header">
        <p className="admin-header__pre admin-header__pre--danger">
          Moderación
        </p>
        <h2 className="admin-header__title">Solicitudes</h2>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["todas", "pendiente", "aceptada", "rechazada"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border:
                filtro === f
                  ? "1px solid var(--teal)"
                  : "1px solid var(--borde)",
              background: filtro === f ? "var(--teal-dim)" : "transparent",
              color: filtro === f ? "var(--teal)" : "var(--texto2)",
              cursor: "pointer",
              fontSize: "0.8rem",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {cargando ? (
        <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px" }}>
          Cargando solicitudes...
        </p>
      ) : filtradas.length === 0 ? (
        <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px" }}>
          No hay solicitudes {filtro !== "todas" ? `con estado "${filtro}"` : ""}.
        </p>
      ) : (
        <div className="admin-reports-list">
          {filtradas.map((s) => (
            <div
              key={s.id_solicitud || Math.random()}
              className={`admin-report-card admin-report-card--${
                s.estado === "Pendiente"
                  ? "pendiente"
                  : s.estado === "Aceptada"
                  ? "aceptada"
                  : "cerrada"
              }`}
            >
              <div className="admin-report-card__header">
                <div className="admin-report-card__info">
                  <span className="admin-report-card__icon">
                    {s.estado === "Pendiente" ? (
                      <i className="bi bi-clock"></i>
                    ) : s.estado === "Aceptada" ? (
                      <i className="bi bi-check-circle"></i>
                    ) : (
                      <i className="bi bi-x-circle"></i>
                    )}
                  </span>
                  <div>
                    <p className="admin-report-card__type">
                      {getTipoReporte(s)}
                    </p>
                    <p className="admin-report-card__meta">
                      Servicio: <span>{s.tipo_servicio || "N/A"}</span> · Tema:{" "}
                      <span>{s.tema || "N/A"}</span>
                    </p>
                  </div>
                </div>
                <Badge estado={s.estado?.toLowerCase() || "desconocido"} />
              </div>
              {s.descripcion && (
                <p className="admin-report-card__desc">{s.descripcion}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
