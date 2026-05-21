import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "./Admin/BarraNavegacionAdmin";
import SeccionDashboard from "./Admin/PanelControl";
import SeccionUsuarios from "./Admin/GestionUsuarios";
import SeccionServiciosAdmin from "./Admin/GestionServicios";
import SeccionServiciosPendientes from "./Admin/GestionServiciosPendientes";
import SeccionReportes from "./Admin/GestionReportes";
import SeccionCategorias from "./Admin/GestionCategorias";
import SeccionLogs from "./Admin/RegistroActividades";
import "../styles/styleAdmin.css";

export default function HomeAdmin() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    document.body.classList.add("admin-page");
    document.body.classList.remove("login-page");
    localStorage.removeItem("tema");
    return () => {
      document.body.classList.remove("admin-page");
    };
  }, []);

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

  const refresh = () => setRefreshKey((k) => k + 1);

  const vistas = {
    dashboard: <SeccionDashboard key={refreshKey} refreshKey={refreshKey} />,
    usuarios: <SeccionUsuarios key={refreshKey} refreshKey={refreshKey} onRefresh={refresh} />,
    servicios: <SeccionServiciosAdmin key={refreshKey} refreshKey={refreshKey} onRefresh={refresh} />,
    pendientes: <SeccionServiciosPendientes key={refreshKey} refreshKey={refreshKey} onRefresh={refresh} />,
    reportes: <SeccionReportes key={refreshKey} refreshKey={refreshKey} />,
    categorias: <SeccionCategorias key={refreshKey} refreshKey={refreshKey} onRefresh={refresh} />,
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
