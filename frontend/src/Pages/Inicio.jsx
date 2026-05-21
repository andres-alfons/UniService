// ════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL (HOME) — Usuario logueado
// Importa y organiza todas las secciones de la página principal:
// barra de navegación, presentación, buscador, servicios recientes,
// destacados, formulario de publicación, bandeja de solicitudes,
// notificaciones flotantes y pie de página.
// ════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styleHome.css";
import Navbar from "./Principal/BarraNavegacion";
import SeccionBuscar from "./Principal/BusquedaServicios";
import SeccionPublicar from "./Principal/PublicarServicio";
import SeccionSolicitudes from "./Principal/SeccionSolicitudes";
import NotificacionesFlotantes from "./Principal/Notificaciones";
import BotonTema from "../Components/B_StyleHome";
import Footer from "./Principal/PiePagina";
import SeccionRecientes from "./shared/SeccionRecientes";
import SeccionDestacados from "./shared/SeccionDestacados";
import Presentacion from "./shared/Presentacion";
import { API_HOME } from "./shared/constantes";
import { promedioEstrellas } from "./shared/utilidades";

// ── Componente principal del Home para usuarios logueados ──
export default function HomePrincipal() {
  const navigate = useNavigate();
  // Estado del scroll para cambiar estilo del navbar al hacer scroll
  const [scrolled, setScrolled] = useState(false);
  // Lista completa de servicios, recientes y top 3 mejor calificados
  const [serviciosTotales, setServiciosTotales] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const [top3, setTop3] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ── Efecto inicial: redirige si no hay token, detecta scroll ──
  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [navigate]);

  // ── Carga todos los servicios desde la API con paginación optimizada ──
  const cargarServicios = useCallback(() => {
    setCargando(true);
    // Pedir una página grande para el home (recientes + top)
    fetch(`${API_HOME}?page=1&pageSize=50&orden=recientes`)
      .then((res) => res.json())
      .then((data) => {
        const lista = data.servicios || data;
        if (!Array.isArray(lista)) return;
        
        setServiciosTotales([...lista].reverse());
        setRecientes(lista.slice(0, 4));
        const top = [...lista]
          .sort(
            (a, b) =>
              promedioEstrellas(b.estrellas) - promedioEstrellas(a.estrellas),
          )
          .slice(0, 3);
        setTop3(top);
      })
      .catch(err => console.error("Error cargando servicios:", err))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargarServicios();
  }, [cargarServicios]);

  // ── IntersectionObserver para animaciones de entrada (reveal) ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // ── Cierra sesión: limpia localStorage (excepto notifs leídas) ──
  const handleCerrarSesion = () => {
    const keysToPreserve = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("notificaciones_leidas_")) {
        keysToPreserve.push({ key, value: localStorage.getItem(key) });
      }
    }
    localStorage.clear();
    keysToPreserve.forEach(({ key, value }) => {
      localStorage.setItem(key, value);
    });
    navigate("/home-guest");
  };

  return (
    <>
      <Navbar scrolled={scrolled} onCerrarSesion={handleCerrarSesion} />
      <Presentacion primaryBtn={{href:"#buscar", className:"btn btn-verde", label:"Explorar servicios"}} secondaryBtn={{href:"#publicar", className:"btn btn-borde", label:"Publicar mi servicio"}} />
      <SeccionBuscar serviciosTotales={serviciosTotales} />
      <SeccionRecientes servicios={recientes} cargando={cargando} />
      <SeccionDestacados top3={top3} />
      <SeccionPublicar onPublicado={cargarServicios} />
      <SeccionSolicitudes />
      <BotonTema />
      <NotificacionesFlotantes />
      <Footer />
    </>
  );
}
