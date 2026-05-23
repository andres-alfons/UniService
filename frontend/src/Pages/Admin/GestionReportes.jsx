import { useState, useEffect } from "react";
import { Badge, formatFecha } from "./UtilidadesAdmin";

const ESTADOS = ["Pendiente", "En_revision", "Resuelto", "Rechazado", "Cerrado"];

const ETIQUETA_TIPO = {
  servicio_fraude:       "🚨 Fraude en servicio",
  servicio_inapropiado:  "🔞 Servicio inapropiado",
  usuario_acoso:         "⚠️ Acoso de usuario",
  usuario_fraude:        "⛔ Fraude de usuario",
  bug_tecnico:           "🐛 Error técnico",
  queja_general:         "💬 Queja general",
  sugerencia:            "💡 Sugerencia",
  contenido_inapropiado: "🚫 Contenido inapropiado",
  otro:                  "📝 Otro",
};

export default function SeccionReportes() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [expandido, setExpandido] = useState(null);
  const [resolviendo, setResolviendo] = useState(null); // id del reporte que se está gestionando
  const [notasAdmin, setNotasAdmin] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [guardando, setGuardando] = useState(false);

 const id_admin = parseInt(
  localStorage.getItem("usuarioId") ||
  localStorage.getItem("id_usuario") ||
  localStorage.getItem("userId") ||
  "0"
);

  const cargar = async () => {
    setCargando(true);
    try {
      const url = filtro === "todos"
  ? `/api/reportes/admin`
  : `/api/reportes/admin?estado=${filtro}`;
      const res = await fetch(url);
      const data = await res.json();
      setReportes(Array.isArray(data) ? data : []);
    } catch {
      setReportes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [filtro]);

  const abrirGestion = (reporte) => {
    setResolviendo(reporte.id_reporte);
    setNotasAdmin(reporte.resolucion_notas || "");
    setNuevoEstado(reporte.estado);
  };

  const guardarCambio = async () => {
    if (!nuevoEstado) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/reportes/${resolviendo}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          resolucion_notas: notasAdmin || null,
          id_admin,
        }),
      });
      if (res.ok) {
        setResolviendo(null);
        setExpandido(null);
        cargar();
      }
    } catch {
      /* silencioso */
    } finally {
      setGuardando(false);
    }
  };

  const colorEstado = (estado) => {
    const map = {
      Pendiente:   "#f59e0b",
      En_revision: "#60a5fa",
      Resuelto:    "#34d399",
      Rechazado:   "#f87171",
      Cerrado:     "#9ca3af",
    };
    return map[estado] || "var(--texto2)";
  };

  return (
    <section className="admin-section">
      <div className="admin-header">
        <p className="admin-header__pre admin-header__pre--danger">Moderación</p>
        <h2 className="admin-header__title">Reportes de usuarios</h2>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["todos", ...ESTADOS].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: "6px 14px", borderRadius: "8px",
              border: filtro === f ? "1px solid var(--teal)" : "1px solid var(--borde)",
              background: filtro === f ? "var(--teal-dim)" : "transparent",
              color: filtro === f ? "var(--teal)" : "var(--texto2)",
              cursor: "pointer", fontSize: "0.8rem",
            }}
          >
            {f === "todos" ? "Todos" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {cargando ? (
        <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px" }}>
          Cargando reportes...
        </p>
      ) : reportes.length === 0 ? (
        <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px" }}>
          No hay reportes {filtro !== "todos" ? `con estado "${filtro}"` : ""}.
        </p>
      ) : (
        <div className="admin-reports-list">
          {reportes.map((r) => (
            <div
              key={r.id_reporte}
              className="admin-report-card"
              style={{ borderLeft: `3px solid ${colorEstado(r.estado)}` }}
            >
              {/* Cabecera */}
              <div className="admin-report-card__header"
                style={{ cursor: "pointer" }}
                onClick={() => setExpandido(expandido === r.id_reporte ? null : r.id_reporte)}
              >
                <div className="admin-report-card__info">
                  <span className="admin-report-card__icon">
                    <i className="bi bi-flag-fill" style={{ color: colorEstado(r.estado) }} />
                  </span>
                  <div>
                    <p className="admin-report-card__type" style={{ fontWeight: 600 }}>
                      {r.titulo}
                    </p>
                    <p className="admin-report-card__meta">
                      {ETIQUETA_TIPO[r.tipo_reporte] || r.tipo_reporte}
                      {" · "}
                      <span style={{ color: "var(--texto2)" }}>
                        {r.nombre_usuario} ({r.correo_usuario})
                      </span>
                      {" · "}
                      {new Date(r.fecha_creacion).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "20px", background: colorEstado(r.estado) + "22",
                  color: colorEstado(r.estado), whiteSpace: "nowrap",
                }}>
                  {r.estado.replace("_", " ")}
                </span>
              </div>

              {/* Detalle expandido */}
              {expandido === r.id_reporte && (
                <div style={{ marginTop: "12px", padding: "12px", background: "var(--fondo)", borderRadius: "8px" }}>
                  <p style={{ fontSize: "0.88rem", color: "var(--texto)", marginBottom: "8px" }}>
                    {r.descripcion}
                  </p>
                  {r.evidencia && (
                    <a href={r.evidencia} target="_blank" rel="noreferrer"
                      style={{ fontSize: "0.82rem", color: "var(--teal)" }}>
                      🔗 Ver evidencia adjunta
                    </a>
                  )}
                  {r.titulo_servicio && (
                    <p style={{ fontSize: "0.82rem", color: "var(--texto2)", marginTop: "6px" }}>
                      Servicio relacionado: <strong>{r.titulo_servicio}</strong>
                    </p>
                  )}
                  {r.resolucion_notas && (
                    <p style={{ fontSize: "0.82rem", color: "var(--texto2)", marginTop: "6px", fontStyle: "italic" }}>
                      Notas de resolución: {r.resolucion_notas}
                    </p>
                  )}

                  {/* Panel de gestión del admin */}
                  {resolviendo === r.id_reporte ? (
                    <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <select
                        value={nuevoEstado}
                        onChange={(e) => setNuevoEstado(e.target.value)}
                        style={{
                          padding: "8px", borderRadius: "8px",
                          border: "1px solid var(--borde)", background: "var(--fondo2)",
                          color: "var(--texto)", fontSize: "0.88rem",
                        }}
                      >
                        {ESTADOS.map((e) => <option key={e} value={e}>{e.replace("_", " ")}</option>)}
                      </select>
                      <textarea
                        rows={3} placeholder="Notas de resolución (opcional)..."
                        value={notasAdmin} onChange={(e) => setNotasAdmin(e.target.value)}
                        style={{
                          padding: "8px", borderRadius: "8px",
                          border: "1px solid var(--borde)", background: "var(--fondo2)",
                          color: "var(--texto)", fontSize: "0.88rem", resize: "vertical",
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={guardarCambio} disabled={guardando}
                          style={{
                            background: "var(--teal)", color: "#fff", border: "none",
                            borderRadius: "8px", padding: "8px 18px", cursor: "pointer",
                            fontWeight: 600, opacity: guardando ? 0.7 : 1,
                          }}
                        >
                          {guardando ? "Guardando..." : "Guardar cambio"}
                        </button>
                        <button
                          onClick={() => setResolviendo(null)}
                          style={{
                            background: "transparent", color: "var(--texto2)",
                            border: "1px solid var(--borde)", borderRadius: "8px",
                            padding: "8px 14px", cursor: "pointer",
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => abrirGestion(r)}
                      style={{
                        marginTop: "12px", background: "var(--teal-dim)", color: "var(--teal)",
                        border: "1px solid var(--teal)", borderRadius: "8px",
                        padding: "7px 16px", cursor: "pointer", fontSize: "0.85rem",
                      }}
                    >
                      ✏️ Gestionar reporte
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}