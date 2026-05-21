import { useState, useRef } from "react";
import { CATEGORIAS, MODALIDADES, DISPONIBILIDAD, initialPublicar, API_HOME, mapaIconos, mapaCategoriaId, MAPA_ICONOS_MODALIDAD, MAPA_ICONOS_DISPONIBILIDAD } from "../shared/constantes";
import GoogleMapsAutocomplete from "../../Components/GoogleMapsAutocomplete";

export default function SeccionPublicar({ onPublicado }) {
  const [form, setForm] = useState(initialPublicar);
  const [loading, setLoading] = useState(false);
  const [tipoContacto, setTipoContacto] = useState("");
  const [errorCampo, setErrorCampo] = useState("");
  const [modalExito, setModalExito] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [tipoUniversidad, setTipoUniversidad] = useState("");
  const [otraUniversidad, setOtraUniversidad] = useState("");

  // Imágenes del servicio
  const [imagenes, setImagenes] = useState([]);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const fileInputRef = useRef(null);

  // Ubicación para arriendo
  const [ubicacion, setUbicacion] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorCampo) setErrorCampo("");
  };

  const handleTipoUniversidad = (tipo) => {
    setTipoUniversidad(tipo);
    if (tipo === "upc") {
      setForm((prev) => ({ ...prev, universidad: "Universidad Popular del Cesar" }));
      setOtraUniversidad("");
    } else if (tipo === "ninguna") {
      setForm((prev) => ({ ...prev, universidad: "No pertenece a ninguna universidad" }));
      setOtraUniversidad("");
    } else {
      setForm((prev) => ({ ...prev, universidad: "" }));
    }
  };

  const handleOtraUniversidad = (e) => {
    const val = e.target.value;
    setOtraUniversidad(val);
    setForm((prev) => ({ ...prev, universidad: val }));
  };

  // Manejo de imágenes
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = files.slice(0, 5 - imagenes.length);
    
    if (imagenes.length + nuevasImagenes.length > 5) {
      setModalError("Máximo 5 imágenes permitidas");
      return;
    }

    const previews = nuevasImagenes.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagenes((prev) => [...prev, ...nuevasImagenes]);
    setImagenesPreview((prev) => [...prev, ...previews]);
  };

  const eliminarImagen = (index) => {
    URL.revokeObjectURL(imagenesPreview[index].preview);
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setImagenesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const validarContacto = () => {
    const { contacto } = form;
    if (!contacto) return "El campo de contacto es obligatorio";
    if (tipoContacto === "telefono") {
      if (!/^[0-9]{10}$/.test(contacto)) return "El telefono debe contener exactamente 10 digitos";
    } else if (tipoContacto === "correo") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contacto.trim())) return "Ingresa un correo electronico valido";
    }
    return "";
  };

  const handleLocationSelect = (loc) => {
    setUbicacion(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { titulo, descripcion, categoria, precio, universidad, contacto, modalidad, disponibilidad } = form;

    if (!titulo || !descripcion || !categoria || !precio || !universidad || !modalidad || !disponibilidad) {
      setModalError("Completa todos los campos obligatorios del formulario.");
      return;
    }
    if (!tipoContacto) {
      setModalError("Selecciona si tu contacto es por telefono o correo electronico.");
      return;
    }
    const errorContacto = validarContacto();
    if (errorContacto) { setModalError(errorContacto); return; }
    if (Number(precio) < 1000) { setModalError("El precio minimo debe ser $1,000 COP."); return; }

    // Validar ubicación para arriendo
    if (categoria === "arriendo" && !ubicacion) {
      setModalError("Para servicios de arriendo debes seleccionar una ubicación en el mapa.");
      return;
    }

    const proveedor = localStorage.getItem("usuarioId");
    if (!proveedor) { setModalError("Debes iniciar sesion para publicar un servicio."); return; }

    const modalidadDB = { "Presencial": 0, "Virtual": 1, "Mixta": 2 }[modalidad.replace(/[^\\w]/g, "").replace(/^./, m => m.toUpperCase())] ?? 0;
    const dispDB = { "Entre semana": 0, "Fines de semana": 1, "Siempre disponible": 2 }[disponibilidad] ?? 0;

    const nuevoServicio = {
      id_proveedor: Number(proveedor),
      titulo, descripcion,
      id_categoria: mapaCategoriaId[categoria] || 7,
      precio_hora: Number(precio), contacto, universidad,
      modalidad: modalidadDB, disponibilidad: dispDB,
      icono: mapaIconos[categoria] || "bi-pin",
      ubicacion_lat: ubicacion?.lat || null,
      ubicacion_lng: ubicacion?.lng || null,
      direccion: ubicacion?.direccion || null,
    };

    setLoading(true);
    try {
      const res = await fetch(API_HOME, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoServicio),
      });
      const data = await res.json();
      
      if (data.ok) {
        const idServicio = data.id_servicio;

        // Subir imágenes si existen
        if (imagenes.length > 0 && idServicio) {
          console.log("Subiendo imágenes:", imagenes.length, "archivos");
          const formData = new FormData();
          imagenes.forEach((img, index) => {
            console.log(`Agregando imagen ${index + 1}:`, img.name, img.size, "bytes");
            formData.append("imagenes", img);
          });
          
          try {
            const imgRes = await fetch(`${API_HOME}/${idServicio}/imagenes`, {
              method: "POST",
              body: formData,
            });
            const imgData = await imgRes.json();
            console.log("Respuesta subida de imágenes:", imgData);
            if (!imgData.ok) {
              console.error("Error subiendo imágenes:", imgData.error);
            } else {
              console.log("Imágenes subidas exitosamente:", imgData.urls?.length || 0);
            }
          } catch (imgErr) {
            console.error("Error subiendo imágenes:", imgErr);
          }
        }

        setModalExito(true);
        setForm(initialPublicar);
        setTipoContacto("");
        setTipoUniversidad("");
        setOtraUniversidad("");
        setImagenes([]);
        setImagenesPreview([]);
        setUbicacion(null);
        onPublicado();
      } else {
        let mensajeError = data.error || "No se pudo publicar el servicio.";
        if (data.detalles && Array.isArray(data.detalles)) {
          mensajeError += "\n\n" + data.detalles.map(d => `• ${d.campo}: ${d.error}`).join("\n");
        }
        setModalError(mensajeError);
      }
    } catch {
      setModalError("Error de conexion con el servidor. Verifica tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const cerrarModalExito = () => setModalExito(false);

  const esArriendo = form.categoria === "arriendo";

  return (
    <>
      <section className="seccion section-dynamic" id="publicar">
      <div className="bg-canvas bg-canvas-nodes" />
      <div className="floating-shapes-small">
        <div className="shape-sm shape-sm-1" /><div className="shape-sm shape-sm-2" />
      </div>
      <div className="container">
        <div className="publicar-wrapper">
          <p className="label-seccion reveal">Nuevo servicio</p>
          <h2 className="reveal delay-1">Publicar servicio</h2>
          <p className="seccion-desc reveal delay-2">Comparte tu talento con la comunidad universitaria</p>

          <div className="caja-formulario publicar-form-dinamico reveal delay-3">
            <fieldset>
              <legend className="legend-custom">Informacion del servicio</legend>
              <div className="form-grid cols-1">
                <div className={"form-grupo" + (errorCampo === "titulo" ? " has-error" : "")}>
                  <label className="form-label">Titulo del servicio *</label>
                  <input type="text" name="titulo" className="form-input" placeholder="Ej: Tutoria de Calculo Diferencial" value={form.titulo} onChange={handleChange} />
                </div>
                <div className="form-grupo">
                  <label className="form-label">Descripcion completa *</label>
                  <textarea name="descripcion" className="form-input" rows={4} placeholder="Describe tu servicio..." value={form.descripcion} onChange={handleChange} />
                  <span className="char-counter">{form.descripcion.length} / 500</span>
                </div>
              </div>
              <div className="form-grid cols-2">
                <div className="form-grupo">
                  <label className="form-label">Categoria *</label>
                  <select name="categoria" className="form-select" value={form.categoria} onChange={handleChange}>
                    <option value="">Selecciona una categoria</option>
                    {CATEGORIAS.filter(c => c.valor !== "").map((c) => (
                      <option key={c.valor} value={c.valor}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-grupo">
                  <label className="form-label">Precio (COP/hora) *</label>
                  <input type="number" name="precio" className="form-input" placeholder="Ej: 30000" min="1000" value={form.precio} onChange={handleChange} />
                </div>
              </div>
            </fieldset>

            {/* GOOGLE MAPS - SOLO PARA ARRIENDO */}
            {esArriendo && (
              <fieldset className="contacto-fieldset">
                <legend className="legend-custom">
                  <i className="bi bi-geo-alt-fill"></i> Ubicacion del inmueble
                </legend>
                <GoogleMapsAutocomplete onLocationSelect={handleLocationSelect} />
              </fieldset>
            )}

            {/* GALERÍA DE IMÁGENES */}
            <fieldset className="contacto-fieldset">
              <legend className="legend-custom">
                <i className="bi bi-images"></i> Imagenes del servicio (max 5)
              </legend>
              <div className="imagenes-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImagenesChange}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                />
                
                {imagenesPreview.length < 5 && (
                  <button
                    type="button"
                    className="btn-upload-imagen"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span>Agregar imagen</span>
                  </button>
                )}

                <div className="imagenes-preview-grid">
                  {imagenesPreview.map((img, index) => (
                    <div key={index} className="imagen-preview-item">
                      <img src={img.preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="btn-eliminar-imagen"
                        onClick={() => eliminarImagen(index)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                      {index === 0 && <span className="badge-principal">Principal</span>}
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>

            <fieldset className="contacto-fieldset">
              <legend className="legend-custom">Universidad</legend>
              <div className="universidad-type-buttons">
                {[
                  ["upc", "Universidad Popular del Cesar"],
                  ["otra", "Otra universidad"],
                  ["ninguna", "No pertenezco a ninguna"],
                ].map(([tipo, label]) => (
                  <button key={tipo} type="button" className={"universidad-type-btn" + (tipoUniversidad === tipo ? " active" : "")} onClick={() => handleTipoUniversidad(tipo)}>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              {tipoUniversidad === "otra" && (
                <div className="form-grupo otra-universidad-animado" style={{ marginTop: "16px" }}>
                  <label className="form-label">Cual universidad? *</label>
                  <input type="text" className="form-input" placeholder="Ej: Universidad Nacional de Colombia" value={otraUniversidad} onChange={handleOtraUniversidad} />
                </div>
              )}
            </fieldset>

            <fieldset className="contacto-fieldset">
              <legend className="legend-custom">Informacion de contacto</legend>
              <div className="contacto-type-selector">
                <p className="form-label" style={{ marginBottom: "12px" }}>Como quieres recibir consultas? *</p>
                <div className="contacto-type-buttons">
                  {[
                    ["telefono", "WhatsApp"],
                    ["correo", "Correo electronico"],
                  ].map(([tipo, label]) => (
                    <button key={tipo} type="button" className={"contacto-type-btn" + (tipoContacto === tipo ? " active" : "")} onClick={() => { setTipoContacto(tipo); setForm(prev => ({ ...prev, contacto: "" })); }}>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {tipoContacto && (
                <div className="form-grupo contacto-input-animado">
                  <label className="form-label">
                    {tipoContacto === "telefono" ? "Numero de WhatsApp (10 digitos)" : "Correo electronico"} *
                  </label>
                  <div className="input-with-icon">
                    <span className="input-prefix">
                      {tipoContacto === "telefono" ? "+57" : "@"}
                    </span>
                    <input
                      type={tipoContacto === "telefono" ? "tel" : "email"}
                      name="contacto"
                      className="form-input"
                      placeholder={tipoContacto === "telefono" ? "300 123 4567" : "tucorreo@email.com"}
                      value={form.contacto}
                      onChange={(e) => {
                        const val = tipoContacto === "telefono"
                          ? e.target.value.replace(/[^\d]/g, "").slice(0, 10)
                          : e.target.value;
                        setForm(prev => ({ ...prev, contacto: val }));
                      }}
                      maxLength={tipoContacto === "telefono" ? 10 : undefined}
                    />
                  </div>
                  {tipoContacto === "correo" && form.contacto && (
                    <span className={"validation-hint " + (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contacto) ? "valid" : "invalid")}>
                      {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contacto) ? "Correo valido" : "Formato: ejemplo@correo.com"}
                    </span>
                  )}
                  {tipoContacto === "telefono" && form.contacto && (
                    <span className={"validation-hint " + (form.contacto.length === 10 ? "valid" : "invalid")}>
                      {form.contacto.length}/10 digitos
                    </span>
                  )}
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="legend-custom">Configuracion del servicio</legend>

              <div className="form-grupo" style={{ marginBottom: "20px" }}>
                <p className="form-label">Modalidad del servicio *</p>
                <div className="check-group button-style">
                  {MODALIDADES.map((m) => (
                    <label key={m} className="check-item">
                      <input type="radio" name="modalidad" value={m} checked={form.modalidad === m} onChange={handleChange} />
                      <span><i className={`bi ${MAPA_ICONOS_MODALIDAD[m]}`}></i> {m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-grupo" style={{ marginBottom: "20px" }}>
                <p className="form-label">Disponibilidad *</p>
                <div className="check-group button-style">
                  {DISPONIBILIDAD.map((d) => (
                    <label key={d} className="check-item">
                      <input type="radio" name="disponibilidad" value={d} checked={form.disponibilidad === d} onChange={handleChange} />
                      <span><i className={`bi ${MAPA_ICONOS_DISPONIBILIDAD[d]}`}></i> {d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-btns">
                <button type="button" className="btn btn-verde btn-publicar" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <span className="btn-loading"><span className="spinner" /> Publicando...</span>
                  ) : (
                    "Publicar servicio"
                  )}
                </button>
                <button type="button" className="btn btn-borde" onClick={() => { setForm(initialPublicar); setTipoContacto(""); setTipoUniversidad(""); setOtraUniversidad(""); setImagenes([]); setImagenesPreview([]); setUbicacion(null); }}>
                  Limpiar
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </section>

      {modalExito && (
        <div className="modal-overlay" onClick={cerrarModalExito}>
          <div className="modal-content modal-exito" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon success-icon"><i className="bi bi-check-circle-fill" style={{fontSize:"2.5rem",color:"#10b981"}}></i></div>
            <h3>Servicio publicado con éxito!</h3>
            <p>Tu servicio ya está visible para la comunidad universitaria.</p>
            <button className="btn btn-verde" onClick={cerrarModalExito}>Entendido</button>
          </div>
        </div>
      )}

      {modalError && (
        <div className="modal-overlay" onClick={() => setModalError(null)}>
          <div className="modal-content modal-error" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon error-icon"><i className="bi bi-x-circle-fill" style={{fontSize:"2.5rem",color:"#ef4444"}}></i></div>
            <h3>Error al publicar</h3>
            <p style={{ whiteSpace: "pre-line", textAlign: "left", maxWidth: "400px" }}>{modalError}</p>
            <button className="btn btn-borde" onClick={() => setModalError(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}
