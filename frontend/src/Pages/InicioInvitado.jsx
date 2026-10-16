// ════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL — Invitado (sin login)
// La cartelera del campus: qué se ofrece hoy, cómo se pide, por qué es
// seguro y el registro con el correo institucional. Los volantes llevan
// al login, porque el detalle de un servicio exige sesión.
// ════════════════════════════════════════════════════════════════
import { useRef, useState } from "react";
import "../styles/cartel.css";
import Portada from "./Cartel/Portada";
import Cartelera from "./Cartel/Cartelera";
import Explorador from "./Cartel/Explorador";
import ComoFunciona from "./Cartel/ComoFunciona";
import Confianza from "./Cartel/Confianza";
import Registro from "./Cartel/Registro";
import Cierre from "./Cartel/Cierre";
import { useCartelera, useEntradas } from "./Cartel/useCartel";

export default function HomeGuest() {
  const raizRef = useRef(null);
  const [categoria, setCategoria] = useState(null);
  const { total, categorias } = useCartelera();
  useEntradas(raizRef);

  const elegirCategoria = (valor) => {
    setCategoria(valor);
    document.getElementById("buscar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="us" ref={raizRef}>
      <a className="us-saltar" href="#buscar">Saltar a los servicios</a>
      <Portada
        lineas={["Se dicta", "de todo."]}
        texto="Tutorías, ensayos, programación, diseño y habitaciones cerca de la U, ofrecidos por estudiantes de la Universidad Popular del Cesar."
        accion={{ label: "Ver servicios", href: "#buscar" }}
        enlaces={[
          { label: "Servicios", href: "#buscar" },
          { label: "Cómo funciona", href: "#como" },
          { label: "Crear cuenta", href: "#registro" },
          { label: "Ingresar", href: "/login" },
        ]}
        total={total}
      />
      <main id="main-content">
        <Cartelera categorias={categorias} onElegir={elegirCategoria} />
        <Explorador categoria={categoria} onCategoria={setCategoria} linkBase="/login?id=" />
        <ComoFunciona />
        <Confianza />
        <Registro />
      </main>
      <Cierre accion={{ label: "Publicar mi servicio", href: "/login?registro=1" }} />
    </div>
  );
}
