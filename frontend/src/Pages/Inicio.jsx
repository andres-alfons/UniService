// ════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL (HOME) — Usuario logueado
// La misma cartelera, desde dentro: buscar, pedir, publicar y gestionar
// las solicitudes. El chat y las notificaciones flotan encima.
// ════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cartel.css";
import "../styles/styleHome.css";
import "../styles/styleChat.css";
import Portada from "./Cartel/Portada";
import Cartelera from "./Cartel/Cartelera";
import Explorador from "./Cartel/Explorador";
import Registro from "./Cartel/Registro";
import Cierre from "./Cartel/Cierre";
import { useCartelera, useEntradas } from "./Cartel/useCartel";
import ModalPublicarServicio from "./Principal/ModalPublicarServicio";
import ModalSolicitudes from "./Principal/ModalSolicitudes";
import NotificacionesFlotantes from "./Principal/Notificaciones";
import ChatPanel from "./Principal/ChatPanel";
import { apiFetch } from "../utils/apiFetch";

export default function HomePrincipal() {
  const navigate = useNavigate();
  const raizRef = useRef(null);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [modalPublicar, setModalPublicar] = useState(false);
  const [borrador, setBorrador] = useState(null);
  const [modalSolicitudes, setModalSolicitudes] = useState(false);
  const [categoria, setCategoria] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const { total, categorias } = useCartelera();
  useEntradas(raizRef);

  const nombre = (localStorage.getItem("usuarioNombre") || "").split(" ")[0];

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  const abrirPublicar = (inicial = null) => {
    setBorrador(inicial);
    setModalPublicar(true);
  };

  const elegirCategoria = (valor) => {
    setCategoria(valor);
    document.getElementById("buscar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCerrarSesion = async () => {
    // El servidor invalida el token (y los de otros dispositivos); si falla, se sale igual.
    try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch (err) { console.error("Error en logout:", err); }
    const keysToPreserve = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("notificaciones_leidas_")) keysToPreserve.push({ key, value: localStorage.getItem(key) });
    }
    localStorage.clear();
    keysToPreserve.forEach(({ key, value }) => { localStorage.setItem(key, value); });
    navigate("/home-guest");
  };

  return (
    <div className="us" ref={raizRef}>
      <a className="us-saltar" href="#buscar">Saltar a los servicios</a>
      <Portada
        lineas={["¿Qué", "necesitas?"]}
        texto={`${nombre ? `Hola, ${nombre}. ` : ""}Busca entre lo que ofrecen otros estudiantes de la UPC, o publica lo que tú sabes hacer.`}
        accion={{ label: "Publicar un servicio", onClick: () => abrirPublicar() }}
        enlaces={[
          { label: "Servicios", href: "#buscar" },
          { label: "Mis solicitudes", onClick: () => setModalSolicitudes(true) },
          { label: "Mi perfil", href: "/perfil" },
          { label: "Salir", onClick: handleCerrarSesion },
        ]}
        total={total}
      />
      <main id="main-content">
        <Cartelera categorias={categorias} onElegir={elegirCategoria} />
        <Explorador key={recarga} categoria={categoria} onCategoria={setCategoria} linkBase="/servicio?id=" />
        <Registro conSesion onPublicar={abrirPublicar} />
      </main>
      <Cierre accion={{ label: "Publicar mi servicio", onClick: () => abrirPublicar() }} />

      <ChatPanel abierto={chatAbierto} onCerrar={() => setChatAbierto(false)} />
      <NotificacionesFlotantes onToggleChat={() => setChatAbierto((v) => !v)} />

      <ModalPublicarServicio
        abierto={modalPublicar}
        inicial={borrador}
        onCerrar={() => setModalPublicar(false)}
        onPublicado={() => setRecarga((n) => n + 1)}
      />

      <ModalSolicitudes
        abierto={modalSolicitudes}
        onCerrar={() => setModalSolicitudes(false)}
      />
    </div>
  );
}
