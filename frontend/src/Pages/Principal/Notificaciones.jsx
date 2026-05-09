import { useState, useEffect } from "react";
import { API_SOLICITUD } from "../shared/constantes";

export default function NotificacionesFlotantes() {
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const usuarioId = localStorage.getItem("usuarioId");

  const getReadStorageKey = () => `notificaciones_leidas_${usuarioId}`;
  const getDismissedStorageKey = () => `notificaciones_dismissed_${usuarioId}`;

  const obtenerLeidas = () => {
    try {
      const stored = localStorage.getItem(getReadStorageKey());
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const guardarLeida = (id) => {
    try {
      const leidas = obtenerLeidas();
      leidas[id] = true;
      localStorage.setItem(getReadStorageKey(), JSON.stringify(leidas));
    } catch {
      console.error("Error al guardar notificación leída");
    }
  };

  useEffect(() => {
    if (!usuarioId) return;
    setCargando(true);

    const cargarNotificaciones = () => {
      const leidas = obtenerLeidas();

      Promise.all([
        fetch(`${API_SOLICITUD}/recibidas/${usuarioId}`).then((r) => r.json()),
        fetch(`${API_SOLICITUD}/enviadas/${usuarioId}`).then((r) => r.json()),
      ])
        .then(([recibidas, enviadas]) => {
          const recibidasArr = Array.isArray(recibidas) ? recibidas : [];
          const enviadasArr = Array.isArray(enviadas) ? enviadas : [];

          const notifs = [];

          recibidasArr.forEach((sol) => {
            if (sol.estado === "Pendiente") {
              const id = `rec-${sol.id_solicitud}`;
              notifs.push({
                id,
                texto: `Nueva solicitud de ${sol.nombre_cliente || "un estudiante"} para "${sol.titulo_servicio || "tu servicio"}"`,
                leida: !!leidas[id],
                tipo: "recibida",
              });
            } else if (sol.estado === "Aceptada") {
              const id = `rec-acept-${sol.id_solicitud}`;
              notifs.push({
                id,
                texto: `${sol.nombre_cliente || "El cliente"} aceptó tu respuesta para "${sol.titulo_servicio || "tu servicio"}"`,
                leida: !!leidas[id],
                tipo: "info",
              });
            } else if (sol.estado === "Rechazada") {
              const id = `rec-rech-${sol.id_solicitud}`;
              notifs.push({
                id,
                texto: `${sol.nombre_cliente || "El cliente"} rechazó la solicitud para "${sol.titulo_servicio || "tu servicio"}"`,
                leida: !!leidas[id],
                tipo: "info",
              });
            }
          });

          enviadasArr.forEach((sol) => {
            if (sol.estado === "Aceptada") {
              const id = `env-acept-${sol.id_solicitud}`;
              notifs.push({
                id,
                texto: `Tu solicitud para "${sol.titulo_servicio || "el servicio"}" fue aceptada por ${sol.nombre_proveedor || "el proveedor"}`,
                leida: !!leidas[id],
                tipo: "enviada",
              });
            } else if (sol.estado === "Rechazada") {
              const id = `env-rech-${sol.id_solicitud}`;
              notifs.push({
                id,
                texto: `Tu solicitud para "${sol.titulo_servicio || "el servicio"}" fue rechazada${sol.motivo_rechazo ? ": " + sol.motivo_rechazo : ""}`,
                leida: !!leidas[id],
                tipo: "enviada",
              });
            }
          });

          notifs.sort((a, b) => {
            if (a.leida !== b.leida) return a.leida ? 1 : -1;
            return b.id.localeCompare(a.id);
          });
          setNotificaciones(notifs);
        })
        .catch(console.error)
        .finally(() => setCargando(false));
    };

    cargarNotificaciones();

    const handler = () => cargarNotificaciones();
    window.addEventListener("solicitud-actualizada", handler);

    return () => window.removeEventListener("solicitud-actualizada", handler);
  }, [usuarioId]);

  const marcarLeida = (id) => {
    guardarLeida(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    );
  };

  const vaciarNotificaciones = () => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar todas las notificaciones? Esta acción no se puede deshacer.",
    );
    if (confirmar) {
      try {
        localStorage.removeItem(getReadStorageKey());
      } catch {}
      setNotificaciones([]);
    }
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="contenedor-notificaciones">
      <button
        className="boton-notificaciones"
        onClick={() => setAbierto(!abierto)}
      >
        <i className="bi bi-bell-fill"></i>
        {noLeidas > 0 && <span className="badge-notificaciones">{noLeidas}</span>}
      </button>

      {abierto && (
        <div className="panel-notificaciones">
          <div className="cabecera-estatica">
            <h3 className="titulo-estatico">
              Notificaciones{noLeidas > 0 ? ` (${noLeidas} nuevas)` : ""}
            </h3>
            <button
              className="boton-vaciar"
              onClick={vaciarNotificaciones}
              title="Vaciar todas las notificaciones"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>

          <ul className="lista-scroll">
            {cargando ? (
              <li className="sin-notificaciones">Cargando notificaciones...</li>
            ) : notificaciones.length > 0 ? (
              notificaciones.map((n) => (
                <li
                  key={n.id}
                  className={`item-notificacion${n.leida ? " leida" : ""}`}
                  onClick={() => !n.leida && marcarLeida(n.id)}
                >
                  {n.texto}
                </li>
              ))
            ) : (
              <li className="sin-notificaciones">
                No tienes notificaciones pendientes
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
