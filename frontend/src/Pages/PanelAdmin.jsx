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
  const [seccion, setSeccion] = useState("dashboard");

  useEffect(() => {
    const logueado = localStorage.getItem("logueado");
    const rol = localStorage.getItem("usuarioRol");

    if (logueado !== "true" || rol !== "1") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/login");
  };

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
