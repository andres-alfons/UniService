import { useState } from "react";

export default function ModalRechazo({ onConfirmar, onCancelar }) {
  const [motivo, setMotivo] = useState("");
  const [contraoferta, setContraoferta] = useState("");

  return (
    <div className="modal-rechazo-overlay">
      <div className="modal-rechazo-content">
        <h3 className="modal-rechazo-title">
          <><i className="bi bi-x-circle"></i> Rechazar solicitud</>
        </h3>
        <p className="modal-rechazo-subtitle">
          Explica el motivo y, si quieres, propón un precio alternativo.
        </p>

        <label className="modal-rechazo-label">Motivo del rechazo</label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej: No tengo disponibilidad en esa fecha..."
          rows={3}
          className="modal-rechazo-textarea"
        />

        <label className="modal-rechazo-label-contraoferta">
          <i className="bi bi-cash-coin"></i> Contraoferta (opcional)
        </label>
        <div className="modal-rechazo-input-wrap">
          <span className="modal-rechazo-dolar">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={contraoferta}
            onChange={(e) => setContraoferta(e.target.value)}
            placeholder="Ej: 35000"
            className="modal-rechazo-input"
          />
        </div>
        <p className="modal-rechazo-helper">
          Si propones un precio, el cliente lo verá en su solicitud.
        </p>

        <div className="modal-rechazo-acciones">
          <button type="button" className="btn btn-borde" onClick={onCancelar}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-verde"
            disabled={!motivo.trim()}
            onClick={() => onConfirmar(motivo, contraoferta ? parseFloat(contraoferta) : null)}
          >
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}