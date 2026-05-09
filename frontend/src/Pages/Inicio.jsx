import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styleHome.css";
import Navbar from "./Principal/BarraNavegacion";
import SeccionBuscar from "./Principal/BusquedaServicios";
import SeccionPublicar from "./Principal/PublicarServicio";
import SeccionSolicitudes from "./Principal/SeccionSolicitudes";
import NotificacionesFlotantes from "./Principal/Notificaciones";
import Footer from "./Principal/PiePagina";
import SeccionRecientes from "./shared/SeccionRecientes";
import SeccionDestacados from "./shared/SeccionDestacados";
import Presentacion from "./shared/Presentacion";
import { API_HOME } from "./shared/constantes";
import { promedioEstrellas } from "./shared/utilidades";

export default function HomePrincipal() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [serviciosTotales, setServiciosTotales] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const [top3, setTop3] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [navigate]);

  const cargarServicios = useCallback(() => {
    setCargando(true);
    fetch(API_HOME)
      .then((res) => res.json())
      .then((data) => {
        setServiciosTotales([...data].reverse());
        setRecientes(data.slice(0, 4));
        const top = [...data]
          .sort(
            (a, b) =>
              promedioEstrellas(b.estrellas) - promedioEstrellas(a.estrellas),
          )
          .slice(0, 3);
        setTop3(top);
      })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargarServicios();
  }, [cargarServicios]);

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
      <NotificacionesFlotantes />
      <Footer />
    </>
  );
}
