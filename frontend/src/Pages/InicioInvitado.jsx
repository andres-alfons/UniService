// ════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL — Invitado (sin login)
// Es idéntica al Home normal pero sin opciones de usuario:
// no tiene navbar con perfil, no muestra solicitudes ni
// notificaciones. Los enlaces a detalle redirigen al login.
// ════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import "../styles/styleHome.css";
import Navbar from "./Guest/BarraNavegacionInvitado";
import SeccionBuscar from "./Guest/BusquedaInvitado";
import Footer from "./Guest/PiePaginaInvitado";
import SeccionRecientes from "./shared/SeccionRecientes";
import SeccionDestacados from "./shared/SeccionDestacados";
import Presentacion from "./shared/Presentacion";
import { promedioEstrellas } from "./shared/utilidades";
import BotonTema from "../Components/B_StyleHome";

const API = "/api/services";

export default function HomeGuest() {
  // Estado del scroll para cambiar estilo del navbar
  const [scrolled, setScrolled] = useState(false);
  const [serviciosTotales, setServiciosTotales] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const [top3, setTop3] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ── Detecta scroll ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Animaciones reveal al hacer scroll ──
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

  // ── Carga servicios desde la API ──
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        const ordenados = [...data].reverse();
        setServiciosTotales(ordenados);
        setRecientes(ordenados.slice(0, 4));

        const top = [...data]
          .sort(
            (a, b) =>
              promedioEstrellas(b.estrellas) - promedioEstrellas(a.estrellas),
          )
          .slice(0, 3);
        setTop3(top);
      })
      .catch((err) => console.error("Error cargando servicios:", err))
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} />
      {/* El linkBase="/login?id=" obliga a iniciar sesión para ver detalles */}
      <Presentacion primaryBtn={{href:"#buscar", className:"btn btn-verde reveal delay-3", label:"Explorar servicios"}} secondaryBtn={{href:"/login", className:"btn btn-borde reveal delay-3", label:"Publicar mi servicio"}} />
      <SeccionBuscar serviciosTotales={serviciosTotales} />
      <SeccionRecientes servicios={recientes} cargando={cargando} linkBase="/login?id=" />
      <SeccionDestacados top3={top3} linkBase="/login?id=" />
      <BotonTema />
      <Footer />
    </>
  );
}
