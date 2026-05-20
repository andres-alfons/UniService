import { useEffect, useState } from "react";
import "../styles/styleModal.css";

export default function Modal({ show, onClose, type = "info", title, message, icon }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible && !show) return null;

  const iconos = {
    exito: "bi-check-circle-fill",
    error: "bi-x-circle-fill",
    info: "bi-info-circle-fill",
    advertencia: "bi-exclamation-triangle-fill",
  };

  const iconoFinal = icon || iconos[type] || iconos.info;

  return (
    <div
      className={`modal-overlay-custom ${show ? "show" : "hide"}`}
      onClick={onClose}
    >
      <div
        className={`modal-box-custom ${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon-custom">
          <i className={`bi ${iconoFinal}`}></i>
        </div>
        {title && <h3 className="modal-title-custom">{title}</h3>}
        {message && <p className="modal-message-custom">{message}</p>}
        <button className="modal-btn-custom" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}
