// ─── TarjetaSolicitud.jsx ────────────────────────────────────────────────────
// Tarjeta individual que representa una solicitud (enviada o recibida).
// Muestra ícono, título, nombre del contratante/proveedor, badge de estado,
// descripción, motivo de rechazo, contraoferta y botones de acción.
// ─────────────────────────────────────────────────────────────────────────────

import { BADGE } from "../shared/constantes";

// Componente de tarjeta para una solicitud
export default function TarjetaSolicitud({ sol, tipo, responder, setRechazando }) {
  // Badge visual según el estado de la solicitud
  const badge = BADGE[sol.estado] || BADGE.Pendiente;
  // Nombre de la contraparte según el tipo de solicitud
  const nombre = tipo === "enviada" ? sol.nombre_proveedor : sol.nombre_cliente;
  const subtitulo = tipo === "enviada" ? "Proveedor" : "Cliente";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "14px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Cabecera: ícono, título, contraparte y badge de estado */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "1.6rem" }}><i className={`bi ${sol.icono?.startsWith("bi-") ? sol.icono : "bi-pin"}`}></i></span>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
              {sol.titulo_servicio}
            </p>
            <p style={{ margin: 0, fontSize: "0.78rem", opacity: 0.6 }}>
              {subtitulo}: {nombre}
            </p>
          </div>
        </div>
        <span
          style={{
            background: badge.bg,
            color: badge.color,
            padding: "3px 10px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <><i className={`bi ${badge.icono}`}></i> {badge.texto}</>
        </span>
      </div>

      {/* Descripción del servicio asociado (truncada a 120 caracteres) */}
      {sol.descripcion && (
        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            opacity: 0.7,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "8px",
          }}
        >
          {sol.descripcion.length > 120
            ? sol.descripcion.slice(0, 120) + "..."
            : sol.descripcion}
        </p>
      )}

      {/* Motivo de rechazo, si existe */}
      {sol.motivo_rechazo && (
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#f87171" }}>
          Motivo: {sol.motivo_rechazo}
        </p>
      )}

      {/* Contraoferta del proveedor, si existe */}
      {sol.contraoferta && (
        <div
          style={{
            background: "rgba(74, 199, 182, 0.1)",
            border: "1px solid rgba(74, 199, 182, 0.3)",
            borderRadius: "10px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}><i className="bi bi-cash-coin"></i></span>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "#4ac7b6",
                fontWeight: 600,
              }}
            >
              El proveedor propone un nuevo precio
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1rem",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              ${Number(sol.contraoferta).toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      )}

      {/* Botones Aceptar / Rechazar solo para solicitudes recibidas pendientes */}
      {tipo === "recibida" && sol.estado === "Pendiente" && (
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button
            type="button"
            className="btn btn-verde"
            style={{ flex: 1, fontSize: "0.82rem", padding: "8px" }}
            onClick={() => responder(sol.id_solicitud, "aceptar")}
          >
            <><i className="bi bi-check-circle"></i> Aceptar</>
          </button>
          <button
            type="button"
            className="btn btn-borde"
            style={{ flex: 1, fontSize: "0.82rem", padding: "8px" }}
            onClick={() => setRechazando(sol.id_solicitud)}
          >
            <><i className="bi bi-x-circle"></i> Rechazar</>
          </button>
        </div>
      )}
    </div>
  );
}
