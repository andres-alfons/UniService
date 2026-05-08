import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { formatearFecha, calcularEstrellas, iniciales } from "../utils/helpers";
import "../styles/styleHome.css";
import "../styles/styleServicio.css";
import Navbar from "./Servicio/BarraNavegacionServicio";
import Skeleton from "./Servicio/Cargando";
import FormSolicitud from "./Servicio/FormularioSolicitud";
import FormCalificacion from "./Servicio/FormularioCalificacion";
import { mostrarModalidad, mostrarDisponibilidad, colorAvatar } from "./Servicio/utilidades";

const API = "https://localhost:7237/api/Services";
const API_USUARIO = "https://localhost:7237/api/Users";

export default function Servicio() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const idServicio = params.get("id");

  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [imagenActual, setImagenActual] = useState(0);
  const [recargarResenas, setRecargarResenas] = useState(0);
  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showModal = (type, message) => {
    setModal({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setModal({ show: false, type: "", message: "" });
    }, 3000);
  };

  useEffect(() => {
    if (localStorage.getItem("logueado") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!idServicio) {
      setError(true);
      setCargando(false);
      return;
    }

    fetch(`${API}/${idServicio}`)
      .then((res) => res.json())
      .then((data) => {
        const s = Array.isArray(data) ? data[0] : data;
        if (!s) {
          setError(true);
          return;
        }
        setServicio(s);
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
    }, [idServicio, recargarResenas]);

  const handleCerrarSesion = async () => {
    const id = localStorage.getItem("usuarioId");
    try {
      await fetch(API_USUARIO, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: id, estado: 0 }),
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

  function formatearFecha(fechaISO) {
    if (!fechaISO) return "—";
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) return "—";
      return fecha.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  }

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
      ? "🏛️ Universidad Popular del Cesar"
      : servicio.universidad === "No pertenece a ninguna universidad"
      ? "🌐 Independiente"
      : servicio.universidad
      ? `🏫 ${servicio.universidad}`
      : "🎓 Comunidad académica";

  const emojisGaleria = [servicio.icono || "📌", "🖥️", "⌨️", "🔧"];

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
          <div>
            <div className="galeria-principal">
              <div className="imagen-grande">{emojisGaleria[imagenActual]}</div>
              <div className="galeria-miniaturas">
                {emojisGaleria.map((em, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`miniatura${imagenActual === i ? " activa" : ""}`}
                    onClick={() => setImagenActual(i)}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="info-principal">
              <div className="header-servicio">
                <div className="titulo-servicio">
                  <h1>{servicio.titulo || "Sin título"}</h1>
                  <span className="etiqueta et-azul">
                    {servicio.nombre_categoria || "Categoría"}
                  </span>
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
              <h3>📋 Detalles del Servicio</h3>
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
            </div>

            <div className="seccion-info">
              <h3>⭐ Reseñas de Clientes</h3>

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
              onNuevaResena={() => setRecargarResenas(n => n + 1)}
            />

          </div>

          <div>
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
                    resenas: Array.isArray(servicio.resenas) ? servicio.resenas.length : (servicio.resenas ?? 0),
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
                      <div
                        className="nombre-proveedor"
                      >
                        {servicio.proveedor || "Proveedor anónimo"}
                      </div>
                      <div className="ubicacion-proveedor">{universidad}</div>
                    </div>
                  </div>
                  <div className="card-proveedor-footer">
                    <span className="badge-proveedor">
                      ⭐ {servicio.estrellas || "0"} · {Array.isArray(servicio.resenas) ? servicio.resenas.length : (servicio.resenas ?? 0)} reseñas
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
                      📧 Contactar por Gmail
                    </a>
                  ) : (
                    <a
                      href={`https://wa.me/57${servicio.contacto.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, vi tu servicio \"" + (servicio.titulo || "") + "\" en UniService y me interesa. ¿Podrías darme más información?")}` }
                      className="btn-primary btn-contacto btn-whatsapp"
                      target="_blank"
                      rel="noreferrer"
                    >
                      💬 Contactar por WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="seccion-info">
              <h3>👤 Información del Proveedor</h3>
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
              showModal={showModal}
            />
          </div>
        </div>
      </main>

      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.type}`}>
            <p>{modal.message}</p>
          </div>
        </div>
      )}

      <footer id="soporte">
        <div className="container">
          <hr />
          <p className="footer-copy">
            © 2026 UniServicios — Hecho por y para estudiantes 🎓
          </p>
        </div>
      </footer>
    </>
  );
}
