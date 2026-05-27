import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { formatearFecha, calcularEstrellas, iniciales } from "../utils/helpers";
import { COLORES_CATEGORIA } from "./shared/constantes";
import "../styles/styleHome.css";
import "../styles/styleServicio.css";
import Navbar from "./Servicio/BarraNavegacionServicio";
import Skeleton from "./Servicio/Cargando";
import FormSolicitud from "./Servicio/FormularioSolicitud";
import FormCalificacion from "./Servicio/FormularioCalificacion";
import MapaModal from "../Components/MapaModal";
import ChatPanel from "./Principal/ChatPanel";
import ModalReporte from "../Components/ModalReporte";

import {
  mostrarModalidad,
  mostrarDisponibilidad,
  colorAvatar,
} from "./Servicio/utilidades";
import BotonTema from "../Components/B_StyleHome";

const API = "/api/services";
const API_USUARIO = "/api/users";

export default function Servicio() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const idServicio = params.get("id");

  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [imagenActual, setImagenActual] = useState(0);
  const [recargarResenas, setRecargarResenas] = useState(0);
  const [imagenesError, setImagenesError] = useState({});
  const [modalMapa, setModalMapa] = useState(false);
  const [modal, setModal] = useState({ show: false, type: "", message: "" });
  const [chatPanelAbierto, setChatPanelAbierto] = useState(false);
  const [modalReporteServicio, setModalReporteServicio] = useState(false);

  const showModal = (type, message) => {
    setModal({ show: true, type, message });
    setTimeout(() => setModal({ show: false, type: "", message: "" }), 3000);
  };

  useEffect(() => {
    if (localStorage.getItem("logueado") !== "true") navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (!idServicio) {
      setError(true);
      setCargando(false);
      return;
    }

    fetch(`${API}/${idServicio}`)
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw new Error(err.error || "Servicio no encontrado");
          });
        return res.json();
      })
      .then((data) => {
        const s = Array.isArray(data) ? data[0] : data;
        if (!s || !s.id_servicio) {
          setError(true);
          return;
        }
        console.log("Servicio cargado:", s);
        console.log("Imagenes:", s.imagenes);
        setServicio(s);
      })
      .catch((err) => {
        console.error("Error cargando servicio:", err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, [idServicio, recargarResenas]);

  const handleCerrarSesion = async () => {
    const id = localStorage.getItem("usuarioId");
    try {
      await fetch(`${API_USUARIO}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: 0 }),
      });
    } catch {}
    localStorage.clear();
    navigate("/home-guest");
  };

  if (cargando)
    return (
      <>
        <Navbar onCerrarSesion={handleCerrarSesion} />
        <div className="container" style={{ padding: "80px 24px" }}>
          <Skeleton />
        </div>
      </>
    );

  if (error || !servicio)
    return (
      <>
        <Navbar onCerrarSesion={handleCerrarSesion} />
        <div
          className="container"
          style={{ textAlign: "center", padding: "80px 24px" }}
        >
          <p style={{ fontSize: "3rem" }}>😕</p>
          <h2>Servicio no encontrado</h2>
          <p className="texto-muted" style={{ margin: "12px 0 24px" }}>
            El servicio que buscas no existe o fue eliminado.
          </p>
          <a href="/home" className="btn btn-verde">
            ← Volver al inicio
          </a>
        </div>
      </>
    );

  const {
    texto: estrellasTexto,
    prom,
    num,
  } = calcularEstrellas(servicio.resenas);

  const universidad =
    servicio.universidad === 1 || servicio.universidad === "1"
      ? "Universidad Popular del Cesar"
      : servicio.universidad === "No pertenece a ninguna universidad"
        ? "Independiente"
        : servicio.universidad
          ? `${servicio.universidad}`
          : "Comunidad académica";

  const tieneUbicacion = servicio.ubicacion_lat && servicio.ubicacion_lng;
  const esArriendo = servicio.nombre_categoria
    ?.toLowerCase()
    .includes("arriendo");

  const imagenes =
    servicio.imagenes && servicio.imagenes.length > 0
      ? servicio.imagenes
          .filter(
            (img) =>
              !img.url_imagen?.includes("default") &&
              !img.url_imagen?.startsWith("img/"),
          )
          .sort((a, b) => new Date(a.fecha_subida) - new Date(b.fecha_subida))
      : null;

  const iconosGaleria = [
    servicio.icono?.startsWith("bi-") ? servicio.icono : "bi-pin",
    "bi-display",
    "bi-keyboard",
    "bi-tools",
  ];

  const handleImagenError = (index) => {
    setImagenesError((prev) => ({ ...prev, [index]: true }));
  };

  const esUrlValida = (url) =>
    url && typeof url === "string" && url.trim() !== "";

  return (
    <>
      <Navbar onCerrarSesion={handleCerrarSesion} />

      <section className="detalle-hero">
        <div className="container">
          <div className="breadcrumb">
            <a href="/home">Inicio</a>
            <span>›</span>
            <a href="/home#buscar">Servicios</a>
            <span>›</span>
            <span>{servicio.nombre_categoria || "Servicio"}</span>
          </div>
        </div>
      </section>

      <main className="container" style={{ marginBottom: "80px" }}>
        <div className="grid-detalle">
          {/* COLUMNA IZQUIERDA: Galeria + Info + Reseñas */}
          <div className="columna-izquierda">
            {/* GALERÍA DE IMÁGENES */}
            <div className="galeria-principal">
              <div className="imagen-grande">
                {imagenes &&
                esUrlValida(imagenes[imagenActual]?.url_imagen) &&
                !imagenesError[imagenActual] ? (
                  <img
                    src={imagenes[imagenActual].url_imagen}
                    alt={servicio.titulo}
                    className="imagen-servicio-real"
                    onError={() => handleImagenError(imagenActual)}
                  />
                ) : (
                  <i className={`bi ${iconosGaleria[0]}`}></i>
                )}
              </div>
              <div className="galeria-miniaturas">
                {imagenes &&
                  imagenes.map((img, i) => (
                    <button
                      key={img.id_imagen || i}
                      type="button"
                      className={`miniatura${imagenActual === i ? " activa" : ""}`}
                      onClick={() => setImagenActual(i)}
                    >
                      {esUrlValida(img.url_imagen) && !imagenesError[i] ? (
                        <img
                          src={img.url_imagen}
                          alt={`Imagen ${i + 1}`}
                          className="miniatura-img"
                          onError={() => handleImagenError(i)}
                        />
                      ) : (
                        <i className={`bi ${iconosGaleria[0]}`}></i>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            {/* BOTÓN VER EN MAPA (solo arriendo con ubicación) */}
            {esArriendo && tieneUbicacion && (
              <button
                className="btn-ver-mapa"
                onClick={() => setModalMapa(true)}
              >
                <i className="bi bi-geo-alt-fill"></i> Ver ubicación en el mapa
              </button>
            )}

            <div className="info-principal">
              <div className="header-servicio">
                <div
                  className="titulo-servicio"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <h1 style={{ flex: 1 }}>{servicio.titulo || "Sin título"}</h1>
                  <button
                    onClick={() => setModalReporteServicio(true)}
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      color: "#ff6b6b",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239,68,68,0.18)";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                    }}
                  >
                    <i
                      className="bi bi-flag-fill"
                      style={{ fontSize: "0.85rem" }}
                    />
                    Reportar
                  </button>
                </div>
              </div>

              <div className="rating-grande">
                <div>
                  <div className="estrellas-grande">{estrellasTexto}</div>
                  <div className="texto-rating">
                    <strong>{prom}</strong> de 5.0
                  </div>
                </div>
                <div className="texto-rating">
                  <div>{num} reseñas</div>
                </div>
              </div>

              <div className="desc-completa">
                {servicio.descripcion || "Sin descripción disponible."}
              </div>
            </div>

            <div className="seccion-info" style={{ marginTop: "24px" }}>
              <h3>
                <i className="bi bi-card-checklist"></i> Detalles del Servicio
              </h3>
              <div className="info-row">
                <span className="info-label">Modalidad</span>
                <span className="info-valor">
                  {mostrarModalidad(servicio.modalidad)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Disponibilidad</span>
                <span className="info-valor">
                  {mostrarDisponibilidad(servicio.disponibilidad)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Precio por hora</span>
                <span className="info-valor">
                  ${servicio.precio_hora || 0} COP
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Universidad</span>
                <span className="info-valor">{universidad}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Publicado</span>
                <span className="info-valor">
                  {formatearFecha(servicio.fecha_publicacion) || "—"}
                </span>
              </div>
              {servicio.contacto && (
                <div className="info-row">
                  <span className="info-label">Contacto</span>
                  <span className="info-valor">{servicio.contacto}</span>
                </div>
              )}
              {esArriendo && servicio.direccion && (
                <div className="info-row">
                  <span className="info-label">Dirección</span>
                  <span className="info-valor">
                    <i className="bi bi-geo-alt"></i> {servicio.direccion}
                  </span>
                </div>
              )}
            </div>

            <div className="seccion-info">
              <h3>
                <i className="bi bi-star-fill"></i> Reseñas de Clientes
              </h3>
              {Array.isArray(servicio.resenas) &&
              servicio.resenas.length > 0 ? (
                <div className="resenas-container">
                  {servicio.resenas.map((r, i) => (
                    <div key={i} className="resena">
                      <div className="resena-header">
                        <div className="resena-autor">
                          <div className="avatar-resena">
                            {iniciales(r.autor)}
                          </div>
                          <div className="resena-info">
                            <h4>{r.autor || "Anónimo"}</h4>
                            <div className="resena-fecha">{r.fecha || ""}</div>
                          </div>
                        </div>
                        <div className="resena-rating">
                          {"★".repeat(r.estrellas || 5)}
                        </div>
                      </div>
                      <div className="resena-texto">{r.comentario || ""}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="texto-muted"
                  style={{ textAlign: "center", padding: "20px 0" }}
                >
                  Aún no hay reseñas para este servicio.
                </p>
              )}
            </div>

            <FormCalificacion
              servicioId={idServicio}
              showModal={showModal}
              onNuevaResena={() => setRecargarResenas((n) => n + 1)}
            />
          </div>

          {/* COLUMNA DERECHA: Proveedor + Contacto + Formulario */}
          <div className="columna-derecha">
            <div>
              <Link
                to={`/perfil/${servicio.id_proveedor}`}
                state={{
                  proveedorData: {
                    id: servicio.id_proveedor,
                    nombre: servicio.proveedor,
                    universidad: universidad,
                    contacto: servicio.contacto,
                    estrellas: servicio.estrellas,
                    resenas: Array.isArray(servicio.resenas)
                      ? servicio.resenas.length
                      : (servicio.resenas ?? 0),
                  },
                }}
                style={{ textDecoration: "none" }}
              >
                <div className="card-proveedor" style={{ cursor: "pointer" }}>
                  <div className="card-proveedor-glow" />
                  <div className="card-proveedor-header">
                    <div
                      className={`avatar-grande ${colorAvatar(servicio.proveedor)}`}
                    >
                      {iniciales(servicio.proveedor)}
                    </div>
                    <div className="card-proveedor-info">
                      <div className="nombre-proveedor">
                        {servicio.proveedor || "Proveedor anónimo"}
                      </div>
                      <div className="ubicacion-proveedor">{universidad}</div>
                    </div>
                  </div>
                  <div className="card-proveedor-footer">
                    <span className="badge-proveedor">
                      <i className="bi bi-star-fill"></i>{" "}
                      {servicio.estrellas || "0"} ·{" "}
                      {Array.isArray(servicio.resenas)
                        ? servicio.resenas.length
                        : (servicio.resenas ?? 0)}{" "}
                      reseñas
                    </span>
                    <span className="badge-ver">Ver perfil →</span>
                  </div>
                </div>
              </Link>

              {servicio.contacto && (
                <div className="contacto-botones">
                  {servicio.contacto.includes("@") ? (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(servicio.contacto)}&su=${encodeURIComponent("Consulta sobre: " + (servicio.titulo || "tu servicio"))}`}
                      className="btn-primary btn-contacto btn-gmail"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="bi bi-envelope-fill"></i> Contactar por
                      Gmail
                    </a>
                  ) : (
                    <a
                      href={`https://wa.me/57${servicio.contacto.replace(/\D/g, "")}?text=${encodeURIComponent('Hola, vi tu servicio "' + (servicio.titulo || "") + '" en UniService y me interesa. ¿Podrías darme más información?')}`}
                      className="btn-primary btn-contacto btn-whatsapp"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="bi bi-whatsapp"></i> Contactar por WhatsApp
                    </a>
                  )}
                  <button
                    className="btn-primary btn-contacto btn-chat-detalle"
                    onClick={() => setChatPanelAbierto(true)}
                  >
                    <i className="bi bi-chat-dots-fill"></i> Enviar mensaje
                  </button>
                </div>
              )}
            </div>

            <div className="seccion-info">
              <h3>
                <i className="bi bi-person-fill"></i> Información del Proveedor
              </h3>
              <div className="info-row">
                <span className="info-label">Publicaciones</span>
                <span className="info-valor">1 servicio</span>
              </div>
              <div className="info-row">
                <span className="info-label">Reseñas totales</span>
                <span className="info-valor">{num}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Calificación</span>
                <span className="info-valor">{prom} ★</span>
              </div>
            </div>

            <FormSolicitud
              servicioId={idServicio}
              proveedorId={servicio.id_proveedor}
              proveedorNombre={servicio.proveedor}
              categoria={servicio.nombre_categoria}
              showModal={showModal}
            />
          </div>
        </div>
      </main>

      {/* MODAL DE MAPA */}
      {modalMapa && tieneUbicacion && (
        <MapaModal
          lat={servicio.ubicacion_lat}
          lng={servicio.ubicacion_lng}
          direccion={servicio.direccion}
          onClose={() => setModalMapa(false)}
        />
      )}

      {/* MODAL DE NOTIFICACIÓN */}
      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.type}`}>
            <p>{modal.message}</p>
          </div>
        </div>
      )}

      <BotonTema />

      <ChatPanel
        abierto={chatPanelAbierto}
        onCerrar={() => setChatPanelAbierto(false)}
        targetUsuario={{
          id: servicio.id_proveedor,
          nombre: servicio.proveedor,
          avatar: "",
        }}
      />

      <footer id="soporte">
        <div className="container">
          <hr />
          <p className="footer-copy">
            © 2026 UniService — Hecho por y para estudiantes{" "}
            <i className="bi bi-mortarboard-fill"></i>
          </p>
        </div>
      </footer>
      {modalReporteServicio && (
  <ModalReporte
    onClose={() => setModalReporteServicio(false)}
    idServicio={parseInt(idServicio)}
    contexto="servicio"
  />
)}
    </>
  );
}
