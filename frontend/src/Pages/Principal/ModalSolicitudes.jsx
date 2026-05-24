import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import TarjetaSolicitud from "./TarjetaSolicitud";
import ModalRechazo from "./ModalRechazo";
import { API_SOLICITUD } from "../shared/constantes";

export default function ModalSolicitudes({ abierto, onCerrar }) {
  const [tab, setTab] = useState("enviadas");
  const [enviadas, setEnviadas] = useState([]);
  const [recibidas, setRecibidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [rechazando, setRechazando] = useState(null);
  const modalRef = useRef(null);

  const id = localStorage.getItem("usuarioId");

  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = "hidden";
      setCargando(true);
      if (!id) return;

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
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [abierto, id]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape" && abierto && !rechazando) onCerrar(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [abierto, onCerrar, rechazando]);

  const responder = async (id_solicitud, accion, motivo_rechazo = "", contraoferta = null) => {
    await fetch(`${API_SOLICITUD}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_solicitud, accion, motivo_rechazo, contraoferta }),
    });

    window.dispatchEvent(new CustomEvent("solicitud-actualizada"));

    const res = await fetch(`${API_SOLICITUD}/recibidas/${id}`);
    setRecibidas(await res.json());
  };

  const completar = async (id_solicitud) => {
    const res = await fetch(`${API_SOLICITUD}/completar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_solicitud }),
    });

    if (res.ok) {
      window.dispatchEvent(new CustomEvent("solicitud-actualizada"));
      const resActualizada = await fetch(`${API_SOLICITUD}/recibidas/${id}`);
      setRecibidas(await resActualizada.json());
    }
  };

  const handleClose = () => { setRechazando(null); onCerrar(); };

  if (!abierto) return null;

  const lista = tab === "enviadas" ? enviadas : recibidas;

  return (
    <>
      <div className="modal-solicitudes-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="modal-solicitudes-title">
        <div className="modal-solicitudes-content" onClick={(e) => e.stopPropagation()} ref={modalRef}>
          {/* Header */}
          <div className="ms-header">
            <div>
              <h3 id="modal-solicitudes-title">
                <i className="bi bi-bell-fill"></i> Mis solicitudes
              </h3>
              <p>Gestiona tus solicitudes enviadas y recibidas</p>
            </div>
            <button className="ms-close" onClick={handleClose} aria-label="Cerrar solicitudes">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="ms-tabs">
            {[["enviadas", "Enviadas"], ["recibidas", "Recibidas"]].map(([val, label]) => (
              <button
                key={val}
                type="button"
                className={`ms-tab${tab === val ? " active" : ""}`}
                onClick={() => setTab(val)}
              >
                {label}
                <span className="ms-count">{val === "enviadas" ? enviadas.length : recibidas.length}</span>
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="ms-body">
            {cargando ? (
              <div className="ms-loading">
                <div className="ms-spinner" />
                <p>Cargando solicitudes...</p>
              </div>
            ) : lista.length === 0 ? (
              <div className="ms-empty">
                <i className="bi bi-inbox" />
                <p>
                  {tab === "enviadas"
                    ? "Aún no has enviado solicitudes."
                    : "Aún no tienes solicitudes recibidas."}
                </p>
              </div>
            ) : (
              <div className="ms-list">
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
        </div>
      </div>

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
