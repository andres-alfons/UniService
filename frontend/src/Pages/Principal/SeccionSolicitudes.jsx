import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TarjetaSolicitud from "./TarjetaSolicitud";
import ModalRechazo from "./ModalRechazo";
import { API_SOLICITUD } from "../shared/constantes";
import { apiFetch } from "../../utils/apiFetch";

export default function SeccionSolicitudes() {
  const [tab, setTab] = useState("enviadas");
  const [enviadas, setEnviadas] = useState([]);
  const [recibidas, setRecibidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [rechazando, setRechazando] = useState(null);

  const id = localStorage.getItem("usuarioId");

  useEffect(() => {
    if (!id) return;
    setCargando(true);

    Promise.all([
      apiFetch(`${API_SOLICITUD}/enviadas/${id}`).then((r) => r.data),
      apiFetch(`${API_SOLICITUD}/recibidas/${id}`).then((r) => r.data),
    ])
      .then(([env, rec]) => {
        setEnviadas(Array.isArray(env) ? env : []);
        setRecibidas(Array.isArray(rec) ? rec : []);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [id]);

  const responder = async (id_solicitud, accion, motivo_rechazo = "", contraoferta = null) => {
    await apiFetch(`${API_SOLICITUD}/responder`, {
      method: "POST",
      body: JSON.stringify({ id_solicitud, accion, motivo_rechazo, contraoferta }),
    });

    window.dispatchEvent(new CustomEvent("solicitud-actualizada"));

    const { data } = await apiFetch(`${API_SOLICITUD}/recibidas/${id}`);
    setRecibidas(data || []);
  };

  const completar = async (id_solicitud) => {
    const { ok } = await apiFetch(`${API_SOLICITUD}/completar`, {
      method: "POST",
      body: JSON.stringify({ id_solicitud }),
    });

    if (ok) {
      window.dispatchEvent(new CustomEvent("solicitud-actualizada"));
      const { data } = await apiFetch(`${API_SOLICITUD}/recibidas/${id}`);
      setRecibidas(data || []);
    }
  };

  const lista = tab === "enviadas" ? enviadas : recibidas;

  return (
    <>
      <section className="seccion section-dynamic" id="solicitudes">
        <div className="bg-canvas bg-canvas-code" />
        <div className="container">
          <p className="label-seccion reveal"><i className="bi bi-bell-fill"></i> Bandeja</p>
          <h2 className="reveal delay-1">Mis solicitudes</h2>

          <div className="solicitud-tabs reveal delay-2">
            {[
              ["enviadas", "Enviadas"],
              ["recibidas", "Recibidas"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setTab(val)}
                className={tab === val ? "btn btn-verde" : "btn btn-borde"}
              >
                {label} ({val === "enviadas" ? enviadas.length : recibidas.length})
              </button>
            ))}
          </div>

          {cargando ? (
            <p className="texto-muted solicitud-mensaje">Cargando solicitudes...</p>
          ) : lista.length === 0 ? (
            <p className="texto-muted solicitud-mensaje">
              {tab === "enviadas"
                ? "Aún no has enviado solicitudes."
                : "Aún no tienes solicitudes recibidas."}
            </p>
          ) : (
            <div className="solicitud-grid">
              {lista.map((sol) => (
                <TarjetaSolicitud
                  key={sol.id_solicitud}
                  sol={sol}
                  tipo={tab === "enviadas" ? "enviada" : "recibida"}
                  responder={responder}
                  setRechazando={setRechazando}
                  onCompletar={completar}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {rechazando && createPortal(
        <ModalRechazo
          onConfirmar={(motivo, contraoferta) => {
            responder(rechazando, "rechazar", motivo, contraoferta);
            setRechazando(null);
          }}
          onCancelar={() => setRechazando(null)}
        />,
        document.body
      )}
    </>
  );
}