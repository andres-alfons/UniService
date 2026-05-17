import { BADGE, ICONOS_POR_NOMBRE_CATEGORIA } from "../shared/constantes";

export default function TarjetaSolicitud({ sol, tipo, responder, setRechazando }) {
  const badge = BADGE[sol.estado] || BADGE.Pendiente;
  const nombre = tipo === "enviada" ? sol.nombre_proveedor : sol.nombre_cliente;
  const subtitulo = tipo === "enviada" ? "Proveedor" : "Cliente";

  return (
    <div className="solicitud-card">
      <div className="solicitud-header">
        <div className="solicitud-info">
          <span className="solicitud-icon"><i className={`bi ${ICONOS_POR_NOMBRE_CATEGORIA[sol.nombre_categoria] || (sol.icono?.startsWith("bi-") ? sol.icono : "bi-pin")}`}></i></span>
          <div>
            <p className="solicitud-title">{sol.titulo_servicio}</p>
            <p className="solicitud-subtitle">{subtitulo}: {nombre}</p>
          </div>
        </div>
        <span className="solicitud-badge" style={{ background: badge.bg, color: badge.color }}>
          <><i className={`bi ${badge.icono}`}></i> {badge.texto}</>
        </span>
      </div>

      {sol.descripcion && (
        <p className="solicitud-desc">
          {sol.descripcion.length > 120
            ? sol.descripcion.slice(0, 120) + "..."
            : sol.descripcion}
        </p>
      )}

      {sol.motivo_rechazo && (
        <p className="solicitud-rechazo">
          Motivo: {sol.motivo_rechazo}
        </p>
      )}

      {sol.contraoferta && (
        <div className="solicitud-contraoferta">
          <span className="solicitud-contraoferta-icon"><i className="bi bi-cash-coin"></i></span>
          <div>
            <p className="solicitud-contraoferta-label">
              El proveedor propone un nuevo precio
            </p>
            <p className="solicitud-contraoferta-price">
              ${Number(sol.contraoferta).toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      )}

      {tipo === "recibida" && sol.estado === "Pendiente" && (
        <div className="solicitud-acciones">
          <button
            type="button"
            className="btn btn-verde"
            onClick={() => responder(sol.id_solicitud, "aceptar")}
          >
            <><i className="bi bi-check-circle"></i> Aceptar</>
          </button>
          <button
            type="button"
            className="btn btn-borde"
            onClick={() => setRechazando(sol.id_solicitud)}
          >
            <><i className="bi bi-x-circle"></i> Rechazar</>
          </button>
        </div>
      )}
    </div>
  );
}