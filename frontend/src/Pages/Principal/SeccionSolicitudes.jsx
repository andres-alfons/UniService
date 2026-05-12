// ─── SeccionSolicitudes.jsx ──────────────────────────────────────────────────
// Bandeja de solicitudes enviadas y recibidas para usuarios autenticados.
// Se conecta con la API para obtener las solicitudes, permite cambiar entre
// las pestañas "Enviadas" / "Recibidas" y dispara el modal de rechazo.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import TarjetaSolicitud from "./TarjetaSolicitud";
import ModalRechazo from "./ModalRechazo";
import { API_SOLICITUD } from "../shared/constantes";

// Componente principal de la bandeja de solicitudes
export default function SeccionSolicitudes() {
  const [tab, setTab] = useState("enviadas");   // Pestaña activa
  const [enviadas, setEnviadas] = useState([]);
  const [recibidas, setRecibidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [rechazando, setRechazando] = useState(null); // ID de solicitud a rechazar

  const id = localStorage.getItem("usuarioId");

  // Al montar, obtiene ambas listas (enviadas y recibidas) en paralelo
  useEffect(() => {
    if (!id) return;
    setCargando(true);

    Promise.all([
      fetch(`${API_SOLICITUD}/enviadas/${id}`).then((r) => r.json()),
      fetch(`${API_SOLICITUD}/recibidas/${id}`).then((r) => r.json()),
    ])
      .then(([env, rec]) => {
        setEnviadas(Array.isArray(env) ? env : []);
        setRecibidas(Array.isArray(rec) ? rec : []);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [id]);

  // Responde a una solicitud: aceptar o rechazar (con motivo y contraoferta opcional)
  const responder = async (
    id_solicitud,
    accion,
    motivo_rechazo = "",
    contraoferta = null,
  ) => {
    await fetch(`${API_SOLICITUD}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_solicitud,
        accion,
        motivo_rechazo,
        contraoferta,
      }),
    });

    // Notifica a otros componentes (ej. Notificaciones) que hubo un cambio
    window.dispatchEvent(new CustomEvent("solicitud-actualizada"));

    // Refresca la lista de recibidas después de responder
    const res = await fetch(`${API_SOLICITUD}/recibidas/${id}`);
    setRecibidas(await res.json());
  };

  // Lista actual según la pestaña seleccionada
  const lista = tab === "enviadas" ? enviadas : recibidas;

  return (
    <section className="seccion section-dynamic" id="solicitudes">
      <div className="bg-canvas bg-canvas-code" />
      <div className="container">
        <p className="label-seccion reveal"><i className="bi bi-bell-fill"></i> Bandeja</p>
        <h2 className="reveal delay-1">Mis solicitudes</h2>

        {/* Pestañas: Enviadas / Recibidas con contador */}
        <div className="reveal delay-2" style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {[
            ["enviadas", "Enviadas"],
            ["recibidas", "Recibidas"],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setTab(val)}
              className={tab === val ? "btn btn-verde" : "btn btn-borde"}
              style={{ fontSize: "0.85rem" }}
            >
              {label} ({val === "enviadas" ? enviadas.length : recibidas.length}
              )
            </button>
          ))}
        </div>

        {/* Estado de carga, vacío o cuadrícula de tarjetas */}
        {cargando ? (
          <p
            className="texto-muted"
            style={{ textAlign: "center", padding: "40px 0" }}
          >
            Cargando solicitudes...
          </p>
        ) : lista.length === 0 ? (
          <p
            className="texto-muted"
            style={{ textAlign: "center", padding: "40px 0" }}
          >
            {tab === "enviadas"
              ? "Aún no has enviado solicitudes."
              : "Aún no tienes solicitudes recibidas."}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {lista.map((sol) => (
              <TarjetaSolicitud
                key={sol.id_solicitud}
                sol={sol}
                tipo={tab === "enviadas" ? "enviada" : "recibida"}
                responder={responder}
                setRechazando={setRechazando}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de rechazo, se activa al hacer clic en "Rechazar" */}
      {rechazando && (
        <ModalRechazo
          onConfirmar={(motivo, contraoferta) => {
            responder(rechazando, "rechazar", motivo, contraoferta);
            setRechazando(null);
          }}
          onCancelar={() => setRechazando(null)}
        />
      )}
    </section>
  );
}
