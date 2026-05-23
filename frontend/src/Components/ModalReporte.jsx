import { useState } from "react";

const TIPOS = [
  { value: "bug_tecnico",           label: "🐛 Error técnico / Bug" },
  { value: "queja_general",         label: "💬 Queja general" },
  { value: "servicio_fraude",       label: "🚨 Fraude en servicio" },
  { value: "servicio_inapropiado",  label: "🔞 Servicio inapropiado" },
  { value: "usuario_acoso",         label: "⚠️ Acoso de usuario" },
  { value: "usuario_fraude",        label: "⛔ Fraude de usuario" },
  { value: "contenido_inapropiado", label: "🚫 Contenido inapropiado" },
  { value: "pago_problema",         label: "💳 Problema de pago" },
  { value: "sugerencia",            label: "💡 Sugerencia" },
  { value: "otro",                  label: "📝 Otro" },
];

export default function ModalReporte({ onClose, idServicio = null, idSolicitud = null }) {
  const id_usuario = parseInt(localStorage.getItem("usuarioId") || "0");

  const [form, setForm] = useState({
    tipo_reporte: "",
    titulo: "",
    descripcion: "",
    evidencia: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEnviar = async () => {
    if (!form.tipo_reporte || !form.titulo.trim() || !form.descripcion.trim()) {
      setError("Por favor completa el tipo, título y descripción.");
      return;
    }
    if (form.titulo.length > 150) {
      setError("El título no puede superar 150 caracteres.");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      const res = await fetch(`/api/reportes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          id_servicio: idServicio || null,
          id_solicitud: idSolicitud || null,
          tipo_reporte: form.tipo_reporte,
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          evidencia: form.evidencia.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setExito(true);
      } else {
        setError(data.error || "No se pudo enviar el reporte.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  // Estilos inline para no depender de un CSS externo nuevo
  const overlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: "16px",
  };
  const card = {
    background: "var(--fondo2, #1e1e2e)", border: "1px solid var(--borde, #333)",
    borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px",
    color: "var(--texto, #fff)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };
  const input = {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid var(--borde, #444)", background: "var(--fondo, #12121f)",
    color: "var(--texto, #fff)", fontSize: "0.9rem", boxSizing: "border-box",
    marginTop: "6px",
  };
  const label = { fontSize: "0.82rem", color: "var(--texto2, #aaa)", display: "block", marginTop: "14px" };
  const btnPrimary = {
    background: "var(--teal, #00b4d8)", color: "#fff", border: "none",
    borderRadius: "8px", padding: "10px 22px", fontWeight: "600",
    cursor: enviando ? "not-allowed" : "pointer", opacity: enviando ? 0.7 : 1,
    fontSize: "0.9rem",
  };
  const btnSecondary = {
    background: "transparent", color: "var(--texto2, #aaa)",
    border: "1px solid var(--borde, #444)", borderRadius: "8px",
    padding: "10px 18px", cursor: "pointer", fontSize: "0.9rem",
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        {exito ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✅</div>
            <h3 style={{ marginBottom: "8px" }}>Reporte enviado</h3>
            <p style={{ color: "var(--texto2, #aaa)", fontSize: "0.9rem" }}>
              Nuestro equipo revisará tu reporte a la brevedad. Puedes ver el estado
              en tu perfil, sección "Mis reportes".
            </p>
            <button style={{ ...btnPrimary, marginTop: "20px" }} onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                <i className="bi bi-flag-fill" style={{ color: "var(--teal, #00b4d8)", marginRight: "8px" }} />
                Enviar reporte
              </h3>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--texto2)", fontSize: "1.3rem", cursor: "pointer" }}>
                ×
              </button>
            </div>

            <label style={label}>Tipo de reporte *</label>
            <select name="tipo_reporte" value={form.tipo_reporte} onChange={handleChange} style={input}>
              <option value="">— Selecciona un tipo —</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <label style={label}>Título *</label>
            <input
              name="titulo" type="text" maxLength={150}
              placeholder="Ej: El servicio no coincide con la descripción"
              value={form.titulo} onChange={handleChange} style={input}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--texto2)", float: "right" }}>
              {form.titulo.length}/150
            </span>

            <label style={label}>Descripción detallada *</label>
            <textarea
              name="descripcion" rows={4}
              placeholder="Explica con detalle qué ocurrió..."
              value={form.descripcion} onChange={handleChange}
              style={{ ...input, resize: "vertical", minHeight: "90px" }}
            />

            <label style={label}>Evidencia (URL de imagen, captura, etc.) — opcional</label>
            <input
              name="evidencia" type="text"
              placeholder="https://..."
              value={form.evidencia} onChange={handleChange} style={input}
            />

            {error && (
              <p style={{ color: "#ff6b6b", fontSize: "0.85rem", marginTop: "10px" }}>
                ⚠️ {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button style={btnSecondary} onClick={onClose}>Cancelar</button>
              <button style={btnPrimary} onClick={handleEnviar} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar reporte"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}