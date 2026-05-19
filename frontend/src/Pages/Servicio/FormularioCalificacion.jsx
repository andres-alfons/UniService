// Formulario para calificar un servicio con estrellas y comentario opcional
import { useState, useEffect } from "react";

const API_CALIFICACIONES = "http://localhost:5165/api/calificaciones";

function FormCalificacion({ servicioId, showModal, onNuevaResena }) {
  // Permiso de calificación (null = cargando, {puede, yaCalifico} = resultado)
  const [permiso, setPermiso] = useState(null);
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Verificar si el usuario puede calificar este servicio
  useEffect(() => {
    const id_cliente = Number(localStorage.getItem("usuarioId"));
    if (!id_cliente || !servicioId) return;

    fetch(`${API_CALIFICACIONES}/puede-calificar?id_cliente=${id_cliente}&id_servicio=${servicioId}`)
      .then(r => r.json())
      .then(data => setPermiso(data))
      .catch(() => setPermiso(null));
  }, [servicioId]);

  // Enviar la calificación al backend
  const handleEnviar = async () => {
    if (estrellas === 0) { showModal("error", "Selecciona una puntuación"); return; }
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
        showModal("success", "¡Reseña enviada!");
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

  // Mientras se verifica el permiso no mostrar nada
  if (!permiso) return null;

  // Si ya calificó, mostrar mensaje de agradecimiento
  if (permiso.yaCalifico) return (
    <div className="seccion-info" style={{ textAlign: "center", padding: "20px" }}>
      <p style={{ color: "var(--teal)" }}><i className="bi bi-check-circle-fill"></i> Ya calificaste este servicio. ¡Gracias!</p>
    </div>
  );

  // Si no tiene permiso para calificar, ocultar el formulario
  if (!permiso.puede) return null;

  return (
    <div className="seccion-info">
      <h3><i className="bi bi-star-fill"></i> Dejar una reseña</h3>

      {/* Selector visual de estrellas con efecto hover */}
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
        {enviando ? "Enviando..." : <><i className="bi bi-send"></i> Publicar reseña</>}
      </button>
    </div>
  );
}

export default FormCalificacion;
