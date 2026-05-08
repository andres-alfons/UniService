import { useState, useEffect } from "react";
import "../styles/styleHome.css";
import Navbar from "./Guest/BarraNavegacionInvitado";
import SeccionBuscar from "./Guest/BusquedaInvitado";
import Footer from "./Guest/PiePaginaInvitado";
import SeccionRecientes from "./shared/SeccionRecientes";
import SeccionDestacados from "./shared/SeccionDestacados";
import Presentacion from "./shared/Presentacion";
import { promedioEstrellas } from "./shared/utilidades";

const API = "http://localhost:5165/api/services";

export default function HomeGuest() {
  const [scrolled, setScrolled] = useState(false);
  const [serviciosTotales, setServiciosTotales] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const [top3, setTop3] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <Presentacion primaryBtn={{href:"#buscar", className:"btn btn-verde reveal delay-3", label:"🔍 Explorar servicios"}} secondaryBtn={{href:"/login", className:"btn btn-borde reveal delay-3", label:"➕ Publicar mi servicio"}} />
      <SeccionBuscar serviciosTotales={serviciosTotales} />
      <SeccionRecientes servicios={recientes} cargando={cargando} linkBase="/login?id=" />
      <SeccionDestacados top3={top3} linkBase="/login?id=" />
      <Footer />
    </>
  );
}
