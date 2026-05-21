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
  const [imagenesCargando, setImagenesCargando] = useState(false);
  const [accionandoId, setAccionandoId] = useState(null);

  const cargarServicios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/services`);
      const data = await res.json();
      setServicios(Array.isArray(data) ? data : []);
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
    if (!confirm(`¿Eliminar "${servicio?.titulo}" permanentemente?`)) return;
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
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setAccionandoId(null);
    }
  };

  const pausar = async (id) => {
    const servicio = servicios.find((s) => s.id_servicio === id);
    const estaPausado = servicio?.disponibilidad === "Pausado" || servicio?.disponibilidad === 0;
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
      alert("Error: " + err.message);
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
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setAccionandoId(null);
    }
  };

  const verImagenes = async (id) => {
    if (imagenesServicio === id) {
      setImagenesServicio(null);
      return;
    }
    setImagenesServicio(id);
    setImagenesCargando(true);
    try {
      await fetch(`${API}/services/${id}`);
      setImagenesCargando(false);
    } catch {
      setImagenesCargando(false);
    }
  };

  const eliminarImagen = async (idServicio, idImagen) => {
    if (!confirm("¿Eliminar esta imagen del servicio?")) return;
    setAccionandoId(idImagen);
    try {
      await fetch(`${API}/services/${idServicio}/imagenes/${idImagen}`, {
        method: "DELETE",
      });
      setImagenesServicio(null);
      cargarServicios();
      if (window.registrarLogAdmin) {
        window.registrarLogAdmin(
          "Eliminó imagen inapropiada",
          `Servicio ID: ${idServicio}, Imagen ID: ${idImagen}`
        );
      }
    } catch (err) {
      alert("Error al eliminar imagen: " + err.message);
    } finally {
      setAccionandoId(null);
    }
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
                const estaPausado = s.disponibilidad === "Pausado" || s.disponibilidad === 0;
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
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "var(--bg2)",
            borderRadius: "12px",
            border: "1px solid var(--borde)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ color: "var(--texto)", margin: 0 }}>
              Imágenes del servicio #{imagenesServicio}
            </h3>
            <button
              onClick={() => setImagenesServicio(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--texto2)",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ✕
            </button>
          </div>
          {imagenesCargando ? (
            <p style={{ color: "var(--texto2)" }}>Cargando imágenes...</p>
          ) : (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <ImagenesGrid
                idServicio={imagenesServicio}
                onEliminar={eliminarImagen}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ImagenesGrid({ idServicio, onEliminar }) {
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    fetch(`${API}/services/${idServicio}`)
      .then((r) => r.json())
      .then((data) => {
        setImagenes(data.imagenes || []);
      })
      .catch(() => setImagenes([]));
  }, [idServicio]);

  if (imagenes.length === 0) {
    return <p style={{ color: "var(--texto2)" }}>Sin imágenes</p>;
  }

  return (
    <>
      {imagenes.map((img) => (
        <div
          key={img.id_imagen}
          style={{
            position: "relative",
            width: "120px",
            borderRadius: "8px",
            overflow: "hidden",
            border: img.es_principal
              ? "2px solid var(--teal)"
              : "1px solid var(--borde)",
          }}
        >
          <img
            src={img.url_imagen}
            alt="Servicio"
            style={{ width: "100%", height: "80px", objectFit: "cover" }}
          />
          {img.es_principal && (
            <span
              style={{
                position: "absolute",
                top: "4px",
                left: "4px",
                background: "var(--teal)",
                color: "#fff",
                fontSize: "0.6rem",
                padding: "1px 4px",
                borderRadius: "3px",
              }}
            >
              Principal
            </span>
          )}
          <button
            onClick={() => onEliminar(idServicio, img.id_imagen)}
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              background: "rgba(220,53,69,0.9)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "22px",
              height: "22px",
              cursor: "pointer",
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </>
  );
}
