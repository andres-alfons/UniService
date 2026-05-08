import { useState, useEffect } from "react";

const API_CALIFICACIONES = "https://localhost:7237/api/calificaciones";

function FormCalificacion({ servicioId, showModal, onNuevaResena }) {
  const [permiso, setPermiso] = useState(null);
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const id_cliente = Number(localStorage.getItem("usuarioId"));
    if (!id_cliente || !servicioId) return;

    fetch(`${API_CALIFICACIONES}/puede-calificar?id_cliente=${id_cliente}&id_servicio=${servicioId}`)
      .then(r => r.json())
      .then(data => setPermiso(data))
      .catch(() => setPermiso(null));
  }, [servicioId]);

  const handleEnviar = async () => {
    if (estrellas === 0) { showModal("error", "❌ Selecciona una puntuación"); return; }
    const id_cliente = Number(localStorage.getItem("usuarioId"));
    setEnviando(true);
    try {
      const res = await fetch(API_CALIFICACIONES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_solicitud: permiso.id_solicitud,
          id_cliente,
          id_servicio: Number(servicioId),
          puntuacion: estrellas,
          comentario: comentario || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        showModal("success", "⭐ ¡Reseña enviada!");
        setPermiso(p => ({ ...p, puede: false, yaCalifico: true }));
        onNuevaResena();
      } else {
        showModal("error", data.error || "Error al enviar reseña");
      }
    } catch {
      showModal("error", "Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  if (!permiso) return null;

  if (permiso.yaCalifico) return (
    <div className="seccion-info" style={{ textAlign: "center", padding: "20px" }}>
      <p style={{ color: "var(--teal)" }}>✅ Ya calificaste este servicio. ¡Gracias!</p>
    </div>
  );

  if (!permiso.puede) return null;

  return (
    <div className="seccion-info">
      <h3>⭐ Dejar una reseña</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", fontSize: "32px" }}>
        {[1,2,3,4,5].map(n => (
          <span
            key={n}
            style={{ cursor: "pointer", color: n <= (hover || estrellas) ? "#fbbf24" : "#374151" }}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setEstrellas(n)}
          >★</span>
        ))}
      </div>

      <textarea
        className="form-input-custom"
        placeholder="Cuéntanos tu experiencia... (opcional)"
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        rows={3}
        style={{ marginBottom: "12px" }}
      />

      <button
        type="button"
        className="btn-primary"
        onClick={handleEnviar}
        disabled={enviando}
      >
        {enviando ? "Enviando..." : "📤 Publicar reseña"}
      </button>
    </div>
  );
}

export default FormCalificacion;
