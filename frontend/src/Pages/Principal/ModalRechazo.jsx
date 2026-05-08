import { useState } from "react";

export default function ModalRechazo({ onConfirmar, onCancelar }) {
  const [motivo, setMotivo] = useState("");
  const [contraoferta, setContraoferta] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#051a2d",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "28px",
          maxWidth: "440px",
          width: "100%",
        }}
      >
        <h3 style={{ margin: "0 0 6px", color: "#fff" }}>
          ❌ Rechazar solicitud
        </h3>
        <p style={{ margin: "0 0 20px", opacity: 0.6, fontSize: "0.85rem" }}>
          Explica el motivo y, si quieres, propón un precio alternativo.
        </p>

        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            opacity: 0.7,
            marginBottom: "6px",
          }}
        >
          Motivo del rechazo
        </label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej: No tengo disponibilidad en esa fecha..."
          rows={3}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px",
            color: "#fff",
            padding: "10px",
            fontSize: "0.88rem",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            opacity: 0.7,
            margin: "14px 0 6px",
          }}
        >
          💰 Contraoferta (opcional)
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#4ac7b6", fontWeight: 600 }}>$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={contraoferta}
            onChange={(e) => setContraoferta(e.target.value)}
            placeholder="Ej: 35000"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              color: "#fff",
              padding: "10px",
              fontSize: "0.88rem",
              boxSizing: "border-box",
            }}
          />
        </div>
        <p style={{ margin: "4px 0 0", fontSize: "0.76rem", opacity: 0.5 }}>
          Si propones un precio, el cliente lo verá en su solicitud.
        </p>

        <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
          <button
            type="button"
            className="btn btn-borde"
            style={{ flex: 1 }}
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-verde"
            style={{ flex: 1 }}
            disabled={!motivo.trim()}
            onClick={() =>
              onConfirmar(
                motivo,
                contraoferta ? parseFloat(contraoferta) : null,
              )
            }
          >
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}
