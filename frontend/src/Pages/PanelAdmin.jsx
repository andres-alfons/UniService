// ════════════════════════════════════════════════════════════════
// PANEL DE ADMINISTRACIÓN (Dashboard admin)
// Layout principal del administrador con navegación lateral
// y cambio dinámico de secciones (dashboard, usuarios, servicios,
// reportes, categorías, logs).
// ════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "./Admin/BarraNavegacionAdmin";
import SeccionDashboard from "./Admin/PanelControl";
import SeccionUsuarios from "./Admin/GestionUsuarios";
import SeccionServiciosAdmin from "./Admin/GestionServicios";
import SeccionReportes from "./Admin/GestionReportes";
import SeccionCategorias from "./Admin/GestionCategorias";
import SeccionLogs from "./Admin/RegistroActividades";
import "../styles/styleAdmin.css";

export default function HomeAdmin() {
  const navigate = useNavigate();
  // Sección activa del panel (dashboard por defecto)
  const [seccion, setSeccion] = useState("dashboard");

  // ── Verifica que el usuario sea admin (rol 1), si no redirige al login ──
  useEffect(() => {
    const logueado = localStorage.getItem("logueado");
    const rol = localStorage.getItem("usuarioRol");

    if (logueado !== "true" || rol !== "1") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ── Cierra sesión del admin ──
  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ── Mapa de secciones: cada clave renderiza un componente distinto ──
  const vistas = {
    dashboard: <SeccionDashboard />,
    usuarios: <SeccionUsuarios />,
    servicios: <SeccionServiciosAdmin />,
    reportes: <SeccionReportes />,
    categorias: <SeccionCategorias />,
    logs: <SeccionLogs />,
  };

  return (
    <div className="admin-layout">
      <NavbarAdmin
        seccionActual={seccion}
        setSeccion={setSeccion}
        onCerrarSesion={handleCerrarSesion}
      />
      <main className="admin-main">
        <div className="admin-bg-decorative" />
        <div className="admin-container">
          {vistas[seccion] ?? <SeccionDashboard />}
        </div>
      </main>
    </div>
  );
}
