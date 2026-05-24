import { useEffect, useState, useRef } from "react";
import "../styles/styleModal.css";

export default function Modal({ show, onClose, type = "info", title, message, icon }) {
  const [visible, setVisible] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Focus trap: focus the button when modal opens
      setTimeout(() => {
        modalRef.current?.querySelector("button")?.focus();
      }, 100);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, onClose]);

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`modal-box-custom ${type}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-icon-custom" aria-hidden="true">
          <i className={`bi ${iconoFinal}`}></i>
        </div>
        {title && <h3 id="modal-title" className="modal-title-custom">{title}</h3>}
        {message && <p className="modal-message-custom">{message}</p>}
        <button className="modal-btn-custom" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}
