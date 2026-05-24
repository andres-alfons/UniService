import { useState, useRef } from "react";

// Tipos según contexto
const TIPOS_SERVICIO = [
  { value: "servicio_fraude",      label: "🚨 Fraude en el servicio" },
  { value: "servicio_inapropiado", label: "🔞 Servicio inapropiado" },
  { value: "contenido_inapropiado",label: "🚫 Contenido inapropiado" },
  { value: "pago_problema",        label: "💳 Problema de pago" },
  { value: "otro",                 label: "📝 Otro" },
];

const TIPOS_USUARIO = [
  { value: "usuario_acoso",        label: "⚠️ Acoso o amenazas" },
  { value: "usuario_abuso",        label: "🚫 Abuso de la plataforma" },
  { value: "usuario_fraude",       label: "⛔ Fraude o estafa" },
  { value: "usuario_suplantacion", label: "🎭 Suplantación de identidad" },
  { value: "usuario_spam",         label: "📨 Spam o publicidad no deseada" },
  { value: "usuario_comportamiento", label: "😤 Comportamiento inapropiado" },
  { value: "otro",                 label: "📝 Otro" },
];

const TIPOS_PAGINA = [
  { value: "bug_tecnico",    label: "🐛 Error técnico / Bug" },
  { value: "queja_general",  label: "💬 Queja general" },
  { value: "sugerencia",     label: "💡 Sugerencia" },
  { value: "otro",           label: "📝 Otro" },
];

// contexto: "servicio" | "usuario" | "pagina"
export default function ModalReporte({
  onClose,
  idServicio = null,
  idSolicitud = null,
  idUsuarioReportado = null,
  contexto = "pagina",
}) {
  const id_usuario = parseInt(localStorage.getItem("usuarioId") || "0");
  const fileInputRef = useRef(null);

  const tipos =
    contexto === "servicio" ? TIPOS_SERVICIO :
    contexto === "usuario"  ? TIPOS_USUARIO  :
    TIPOS_PAGINA;

  const titulo_modal =
    contexto === "servicio" ? "Reportar servicio" :
    contexto === "usuario"  ? "Reportar usuario"  :
    "Reportar a UniService";

  const [form, setForm] = useState({ tipo_reporte: "", titulo: "", descripcion: "" });
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    const nuevas = files.slice(0, 3 - imagenes.length);
    if (imagenes.length + nuevas.length > 3) { setError("Máximo 3 imágenes."); return; }
    setError("");
    setImagenes((prev) => [...prev, ...nuevas]);
    setPreviews((prev) => [...prev, ...nuevas.map((f) => ({ preview: URL.createObjectURL(f) }))]);
    e.target.value = "";
  };

  const eliminarImagen = (i) => {
    URL.revokeObjectURL(previews[i].preview);
    setImagenes((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleEnviar = async () => {
    if (!form.tipo_reporte || !form.titulo.trim() || !form.descripcion.trim()) {
      setError("Por favor completa el tipo, título y descripción."); return;
    }
    if (form.titulo.length > 150) { setError("El título no puede superar 150 caracteres."); return; }
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
          id_usuario_reportado: idUsuarioReportado || null,
          tipo_reporte: form.tipo_reporte,
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          evidencia: null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error || "No se pudo crear el reporte."); return; }

      if (imagenes.length > 0) {
        const formData = new FormData();
        imagenes.forEach((img) => formData.append("imagenes", img));
        await fetch(`/api/reportes/${data.id_reporte}/imagenes`, { method: "POST", body: formData });
      }
      setExito(true);
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    finally { setEnviando(false); }
  };

  // Estilos
  const overlay = { position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:"16px",overflowY:"auto" };
  const card = { background:"var(--fondo2,#1e1e2e)",border:"1px solid var(--borde,#333)",borderRadius:"16px",padding:"28px",width:"100%",maxWidth:"500px",color:"var(--texto,#fff)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",margin:"auto" };
  const inp = { width:"100%",padding:"10px 12px",borderRadius:"8px",border:"1px solid var(--borde,#444)",background:"var(--fondo,#12121f)",color:"var(--texto,#fff)",fontSize:"0.9rem",boxSizing:"border-box",marginTop:"6px" };
  const lbl = { fontSize:"0.82rem",color:"var(--texto2,#aaa)",display:"block",marginTop:"14px" };
  const btnPrimary = { background:"var(--teal,#00b4d8)",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 22px",fontWeight:"600",cursor:enviando?"not-allowed":"pointer",opacity:enviando?0.7:1,fontSize:"0.9rem" };
  const btnSecondary = { background:"transparent",color:"var(--texto2,#aaa)",border:"1px solid var(--borde,#444)",borderRadius:"8px",padding:"10px 18px",cursor:"pointer",fontSize:"0.9rem" };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        {exito ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"12px" }}>✅</div>
            <h3 style={{ marginBottom:"8px" }}>Reporte enviado</h3>
            <p style={{ color:"var(--texto2,#aaa)", fontSize:"0.9rem" }}>
              Nuestro equipo lo revisará pronto. Puedes ver el estado en tu perfil → "Mis reportes".
            </p>
            <button style={{ ...btnPrimary, marginTop:"20px" }} onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
              <h3 style={{ margin:0, fontSize:"1.1rem" }}>
                <i className="bi bi-flag-fill" style={{ color:"var(--teal,#00b4d8)", marginRight:"8px" }} />
                {titulo_modal}
              </h3>
              <button onClick={onClose} style={{ background:"none",border:"none",color:"var(--texto2)",fontSize:"1.3rem",cursor:"pointer" }}>×</button>
            </div>

            <label style={lbl}>Tipo de reporte *</label>
            <select name="tipo_reporte" value={form.tipo_reporte} onChange={handleChange} style={inp}>
              <option value="">— Selecciona un tipo —</option>
              {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <label style={lbl}>Título *</label>
            <input name="titulo" type="text" maxLength={150} placeholder="Resume el problema brevemente" value={form.titulo} onChange={handleChange} style={inp} />
            <span style={{ fontSize:"0.75rem", color:"var(--texto2)", float:"right" }}>{form.titulo.length}/150</span>

            <label style={lbl}>Descripción detallada *</label>
            <textarea name="descripcion" rows={4} placeholder="Explica con detalle qué ocurrió..." value={form.descripcion} onChange={handleChange} style={{ ...inp, resize:"vertical", minHeight:"90px" }} />

            <label style={{ ...lbl, marginTop:"18px" }}>Imágenes de evidencia (máx. 3) — opcional</label>
            <input type="file" ref={fileInputRef} onChange={handleImagenes} accept="image/jpeg,image/png,image/webp" multiple style={{ display:"none" }} />

            {imagenes.length < 3 && (
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",width:"100%",marginTop:"8px",padding:"14px",borderRadius:"10px",border:"2px dashed var(--borde,#444)",background:"var(--fondo,#12121f)",color:"var(--texto2,#aaa)",cursor:"pointer",fontSize:"0.9rem" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor="var(--teal,#00b4d8)"; e.currentTarget.style.color="var(--teal,#00b4d8)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor="var(--borde,#444)"; e.currentTarget.style.color="var(--texto2,#aaa)"; }}>
                <i className="bi bi-paperclip" style={{ fontSize:"1.1rem" }} />
                <span>Adjuntar imágenes</span>
              </button>
            )}

            {previews.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginTop:"10px" }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position:"relative",aspectRatio:"1",borderRadius:"8px",overflow:"hidden",border:"2px solid var(--borde,#444)" }}>
                    <img src={p.preview} alt={`evidencia ${i+1}`} style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                    <button type="button" onClick={() => eliminarImagen(i)} style={{ position:"absolute",top:"4px",right:"4px",background:"rgba(239,68,68,0.9)",border:"none",color:"#fff",width:"22px",height:"22px",borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem" }}>
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <p style={{ color:"#ff6b6b", fontSize:"0.85rem", marginTop:"10px" }}>⚠️ {error}</p>}

            <div style={{ display:"flex", gap:"10px", justifyContent:"flex-end", marginTop:"20px" }}>
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