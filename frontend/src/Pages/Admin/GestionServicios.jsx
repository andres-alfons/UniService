import { useState, useEffect } from "react";
import { formatFecha } from "./UtilidadesAdmin";

const API = "/api";

export default function SeccionServiciosAdmin({ onRefresh }) {
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [imagenesServicio, setImagenesServicio] = useState(null);
  const [imagenesData, setImagenesData] = useState([]);
  const [imagenesCargando, setImagenesCargando] = useState(false);
  const [accionandoId, setAccionandoId] = useState(null);
  const [modal, setModal] = useState(null);

  const cargarServicios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/services/admin/all`);
      const data = await res.json();
      const normalizados = (Array.isArray(data) ? data : []).map((s) => ({
        id_servicio: s.id_servicio,
        id_proveedor: s.id_proveedor,
        titulo: s.titulo,
        descripcion: s.descripcion,
        precio_hora: s.precio_hora,
        icono: s.icono,
        fecha_publicacion: s.fecha_publicacion,
        modalidad: s.modalidad,
        disponibilidad: s.disponibilidad,
        nombre_categoria: s.nombre_categoria,
        proveedor: s.proveedor,
        universidad: s.universidad,
      }));
      setServicios(normalizados);
    } catch {
      setServicios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const eliminar = async (id) => {
    const servicio = servicios.find((s) => s.id_servicio === id);
    setModal({
      tipo: "confirm",
      titulo: "Eliminar servicio",
      mensaje: `¿Eliminar "${servicio?.titulo}" permanentemente? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setAccionandoId(id);
        const idProveedor = servicio?.id_proveedor ?? 0;
        try {
          await fetch(`${API}/services/${id}?id_proveedor=${idProveedor}`, {
            method: "DELETE",
          });
          setServicios((prev) => prev.filter((s) => s.id_servicio !== id));
          if (window.registrarLogAdmin) {
            window.registrarLogAdmin("Eliminó servicio", `${servicio?.titulo} (ID: ${id})`);
          }
          setModal({ tipo: "success", titulo: "Servicio eliminado", mensaje: `"${servicio?.titulo}" ha sido eliminado.` });
        } catch (err) {
          setModal({ tipo: "error", titulo: "Error", mensaje: err.message });
        } finally {
          setAccionandoId(null);
        }
      },
    });
  };

  const pausar = async (id) => {
    const servicio = servicios.find((s) => s.id_servicio === id);
    const estaPausado = servicio?.disponibilidad === "Pausado";
    setAccionandoId(id);
    try {
      await fetch(`${API}/services/${id}/pausar`, { method: "PUT" });
      setServicios((prev) =>
        prev.map((s) =>
          s.id_servicio === id
            ? { ...s, disponibilidad: estaPausado ? "Activo" : "Pausado" }
            : s
        )
      );
      if (window.registrarLogAdmin) {
        window.registrarLogAdmin(
          estaPausado ? "Activó servicio" : "Pausó servicio",
          `${servicio?.titulo} (ID: ${id})`
        );
      }
    } catch (err) {
      setModal({ tipo: "error", titulo: "Error", mensaje: err.message });
    } finally {
      setAccionandoId(null);
    }
  };

  const iniciarEdicion = (s) => {
    setEditandoId(s.id_servicio);
    setEditTitulo(s.titulo);
  };

  const guardarTitulo = async (id) => {
    if (!editTitulo.trim()) return;
    const servicio = servicios.find((s) => s.id_servicio === id);
    const tituloAnterior = servicio?.titulo;
    setAccionandoId(id);
    try {
      await fetch(`${API}/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: editTitulo,
          id_proveedor: servicio?.id_proveedor,
        }),
      });
      setServicios((prev) =>
        prev.map((s) =>
          s.id_servicio === id ? { ...s, titulo: editTitulo } : s
        )
      );
      setEditandoId(null);
      if (window.registrarLogAdmin) {
        window.registrarLogAdmin(
          "Editó servicio",
          `"${tituloAnterior}" → "${editTitulo}" (ID: ${id})`
        );
      }
      setModal({ tipo: "success", titulo: "Título actualizado", mensaje: `El título ha sido cambiado correctamente.` });
    } catch (err) {
      setModal({ tipo: "error", titulo: "Error", mensaje: err.message });
    } finally {
      setAccionandoId(null);
    }
  };

  const verImagenes = async (id) => {
    if (imagenesServicio === id) {
      setImagenesServicio(null);
      setImagenesData([]);
      return;
    }
    setImagenesServicio(id);
    setImagenesCargando(true);
    setImagenesData([]);
    try {
      const res = await fetch(`${API}/services/${id}`);
      const data = await res.json();
      setImagenesData(data.imagenes || []);
      console.log("Imagenes del servicio:", data.imagenes);
    } catch (err) {
      console.error("Error cargando imagenes:", err);
    } finally {
      setImagenesCargando(false);
    }
  };

  const eliminarImagen = async (idServicio, idImagen) => {
    setModal({
      tipo: "confirm",
      titulo: "Eliminar imagen",
      mensaje: "¿Eliminar esta imagen del servicio?",
      onConfirm: async () => {
        setAccionandoId(idImagen);
        try {
          await fetch(`${API}/services/${idServicio}/imagenes/${idImagen}`, {
            method: "DELETE",
          });
          setImagenesData((prev) => prev.filter((img) => img.id_imagen !== idImagen));
          if (window.registrarLogAdmin) {
            window.registrarLogAdmin(
              "Eliminó imagen inapropiada",
              `Servicio ID: ${idServicio}, Imagen ID: ${idImagen}`
            );
          }
          setModal({ tipo: "success", titulo: "Imagen eliminada", mensaje: "La imagen ha sido eliminada correctamente." });
        } catch (err) {
          setModal({ tipo: "error", titulo: "Error", mensaje: err.message });
        } finally {
          setAccionandoId(null);
        }
      },
    });
  };

  const filtrados = servicios.filter((s) =>
    [s.titulo, s.proveedor, s.nombre_categoria].some((v) =>
      (v || "").toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="admin-section__pre admin-section__pre--success">
            Gestión
          </p>
          <h2 className="admin-section__title">Servicios</h2>
        </div>
        <input
          className="admin-input-search"
          type="text"
          placeholder="Buscar servicio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {["Servicio", "Proveedor", "Categoría", "Precio/hr", "Estado", "Fecha", "Acciones"].map(
                (h) => (
                  <th key={h}>{h}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="admin-table__status">
                  Cargando...
                </td>
              </tr>
            ) : (
              filtrados.map((s) => {
                const estaPausado = s.disponibilidad === "Pausado";
                return (
                  <tr key={s.id_servicio}>
                    <td>
                      <div className="admin-table__service-info">
                        <span className="admin-table__service-icon">
                          <i
                            className={`bi ${
                              s.icono?.startsWith("bi-") ? s.icono : "bi-pin"
                            }`}
                          ></i>
                        </span>
                        <div>
                          {editandoId === s.id_servicio ? (
                            <input
                              type="text"
                              value={editTitulo}
                              onChange={(e) => setEditTitulo(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && guardarTitulo(s.id_servicio)
                              }
                              style={{
                                background: "var(--bg2)",
                                border: "1px solid var(--teal)",
                                color: "var(--texto)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "0.85rem",
                                width: "180px",
                              }}
                              autoFocus
                            />
                          ) : (
                            <p
                              className="admin-table__service-name"
                              onDoubleClick={() => iniciarEdicion(s)}
                              style={{ cursor: "pointer" }}
                              title="Doble clic para editar"
                            >
                              {s.titulo}
                            </p>
                          )}
                          <p className="admin-table__id">ID #{s.id_servicio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table__provider">{s.proveedor}</td>
                    <td className="admin-table__category">
                      {s.nombre_categoria}
                    </td>
                    <td className="admin-table__price">
                      ${(s.precio_hora || 0).toLocaleString("es-CO")}
                    </td>
                    <td>
                      <span
                        className={`admin-badge admin-badge--${
                          estaPausado ? "inactivo" : "activo"
                        }`}
                      >
                        {estaPausado ? "Pausado" : "Activo"}
                      </span>
                    </td>
                    <td className="admin-table__date">
                      {formatFecha(s.fecha_publicacion)}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        {editandoId === s.id_servicio ? (
                          <>
                            <button
                              className="admin-btn-action admin-btn-action--success"
                              onClick={() => guardarTitulo(s.id_servicio)}
                              disabled={accionandoId === s.id_servicio}
                            >
                              Guardar
                            </button>
                            <button
                              className="admin-btn-action admin-btn-action--ghost"
                              onClick={() => setEditandoId(null)}
                              disabled={accionandoId === s.id_servicio}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="admin-btn-action admin-btn-action--info"
                              onClick={() => verImagenes(s.id_servicio)}
                              title="Ver imágenes"
                              disabled={accionandoId !== null}
                            >
                              <i className="bi bi-image"></i>
                            </button>
                            {!estaPausado ? (
                              <button
                                className="admin-btn-action admin-btn-action--warning"
                                onClick={() => pausar(s.id_servicio)}
                                disabled={accionandoId === s.id_servicio}
                              >
                                {accionandoId === s.id_servicio ? "..." : "Pausar"}
                              </button>
                            ) : (
                              <button
                                className="admin-btn-action admin-btn-action--activate"
                                onClick={() => pausar(s.id_servicio)}
                                disabled={accionandoId === s.id_servicio}
                              >
                                {accionandoId === s.id_servicio ? "..." : "Activar"}
                              </button>
                            )}
                            <button
                              className="admin-btn-action admin-btn-action--danger"
                              onClick={() => eliminar(s.id_servicio)}
                              disabled={accionandoId === s.id_servicio}
                            >
                              {accionandoId === s.id_servicio ? "..." : "Eliminar"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {imagenesServicio && (
        <div className="admin-modal-overlay" onClick={() => { setImagenesServicio(null); setImagenesData([]); }}>
          <div className="admin-modal-content admin-modal-images" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="admin-modal-title" style={{ margin: 0 }}>
                Imágenes del servicio #{imagenesServicio}
              </h3>
              <button
                onClick={() => { setImagenesServicio(null); setImagenesData([]); }}
                className="admin-btn-action admin-btn-action--ghost"
                style={{ padding: "4px 10px", minWidth: "auto" }}
              >
                ✕
              </button>
            </div>
            {imagenesCargando ? (
              <p style={{ color: "var(--texto2)", textAlign: "center", padding: "30px" }}>Cargando imágenes...</p>
            ) : imagenesData.length === 0 ? (
              <p style={{ color: "var(--texto2)", textAlign: "center", padding: "30px" }}>Este servicio no tiene imágenes.</p>
            ) : (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", maxHeight: "60vh", overflowY: "auto", padding: "8px" }}>
                {imagenesData.map((img) => {
                  const servicioActual = servicios.find((s) => s.id_servicio === imagenesServicio);
                  return (
                  <div
                    key={img.id_imagen}
                    style={{
                      position: "relative",
                      width: "160px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: img.es_principal ? "2px solid var(--color-success)" : "1px solid var(--borde)",
                      background: "var(--bg2)",
                    }}
                  >
                    <img
                      src={img.url_imagen}
                      alt={`Imagen del servicio: ${servicioActual?.titulo || "Sin título"}`}
                      loading="lazy"
                      decoding="async"
                      style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }}
                      onError={(e) => { e.target.style.display = "none"; e.target.parentElement.innerHTML += '<p style="color:var(--texto2);font-size:0.7rem;padding:10px;text-align:center;">Error al cargar</p>'; }}
                    />
                    {img.es_principal && (
                      <span
                        style={{
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                          background: "var(--color-success)",
                          color: "#fff",
                          fontSize: "0.6rem",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          fontWeight: 700,
                        }}
                      >
                        Principal
                      </span>
                    )}
                    <button
                      onClick={() => eliminarImagen(imagenesServicio, img.id_imagen)}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "rgba(239,68,68,0.9)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Eliminar imagen"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>
      )}

      {modal && (
        <AdminModal modal={modal} onClose={() => setModal(null)} />
      )}
    </section>
  );
}

function AdminModal({ modal, onClose }) {
  const isConfirm = modal.tipo === "confirm";
  const isSuccess = modal.tipo === "success";
  const isError = modal.tipo === "error";

  const icon = isConfirm
    ? <i className="bi bi-question-circle-fill" style={{ fontSize: "2.5rem", color: "#f59e0b" }}></i>
    : isSuccess
    ? <i className="bi bi-check-circle-fill" style={{ fontSize: "2.5rem", color: "#10b981" }}></i>
    : <i className="bi bi-x-circle-fill" style={{ fontSize: "2.5rem", color: "#ef4444" }}></i>;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-icon">{icon}</div>
        <h3 className="admin-modal-title">{modal.titulo}</h3>
        <p className="admin-modal-message">{modal.mensaje}</p>
        <div className="admin-modal-actions">
          {isConfirm ? (
            <>
              <button className="admin-btn-action admin-btn-action--ghost" onClick={onClose}>
                Cancelar
              </button>
              <button className="admin-btn-action admin-btn-action--danger" onClick={() => { onClose(); modal.onConfirm(); }}>
                Confirmar
              </button>
            </>
          ) : (
            <button className="admin-btn-action admin-btn-action--success" onClick={onClose}>
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
