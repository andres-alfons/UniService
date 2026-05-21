// Panel de control — Dashboard principal del panel de administración
import { useState, useEffect } from "react";
import StatCard from "./TarjetaEstadistica";

const API = "/api";

export default function SeccionDashboard({ refreshKey }) {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalServicios: 0,
    totalSolicitudes: 0,
    reportesPendientes: 0,
  });
  const [actividad, setActividad] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [usersRes, servicesRes, solicitudesRes] = await Promise.all([
          fetch(`${API}/users`).catch(() => ({ json: () => [] })),
          fetch(`${API}/services`).catch(() => ({ json: () => [] })),
          fetch(`${API}/solicitudes/enviadas/0`).catch(() => ({ json: () => [] })),
        ]);

        const users = await usersRes.json();
        const services = await servicesRes.json();
        const solicitudes = await solicitudesRes.json();

        const usersArr = Array.isArray(users) ? users : [];
        const servicesArr = Array.isArray(services) ? services : [];
        const solicitudesArr = Array.isArray(solicitudes) ? solicitudes : [];

        setStats({
          totalUsuarios: usersArr.length,
          totalServicios: servicesArr.length,
          totalSolicitudes: solicitudesArr.length,
          reportesPendientes: solicitudesArr.filter(
            (s) => s.estado === "Pendiente"
          ).length,
        });

        const actividadReciente = [];

        usersArr
          .slice(-5)
          .reverse()
          .forEach((u) =>
            actividadReciente.push({
              accion: "Usuario registrado",
              detalle: u.correo || u.nombre,
              hora: u.fecha_registro
                ? new Date(u.fecha_registro).toLocaleString("es-CO")
                : "Reciente",
              tipo: "usuario",
            })
          );

        servicesArr
          .slice(-5)
          .reverse()
          .forEach((s) =>
            actividadReciente.push({
              accion: "Servicio publicado",
              detalle: s.titulo,
              hora: s.fecha_publicacion || "Reciente",
              tipo: "servicio",
            })
          );

        solicitudesArr
          .slice(-3)
          .reverse()
          .forEach((s) =>
            actividadReciente.push({
              accion: `Solicitud ${s.estado || "Pendiente"}`,
              detalle: `#${s.id_solicitud || "?"} → ${s.tipo_servicio || "Servicio"}`,
              hora: "Reciente",
              tipo: "servicio",
            })
          );

        actividadReciente.sort(
          (a, b) => new Date(b.hora) - new Date(a.hora)
        );
        setActividad(actividadReciente.slice(0, 10));
      } catch {
        setStats({ totalUsuarios: 0, totalServicios: 0, totalSolicitudes: 0, reportesPendientes: 0 });
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [refreshKey]);

  return (
    <section className="admin-dashboard">
      <div className="admin-header">
        <p className="admin-header__pre">Panel de control</p>
        <h1 className="admin-header__title">Dashboard</h1>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          icon={<i className="bi bi-people-fill"></i>}
          label="Usuarios registrados"
          value={cargando ? "..." : stats.totalUsuarios}
          sub={`${stats.totalUsuarios > 0 ? "↑ Activos" : "Sin registros"}`}
          type="primary"
        />
        <StatCard
          icon={<i className="bi bi-card-checklist"></i>}
          label="Servicios activos"
          value={cargando ? "..." : stats.totalServicios}
          sub={`${stats.totalServicios > 0 ? "Publicados" : "Sin servicios"}`}
          type="success"
        />
        <StatCard
          icon={<i className="bi bi-arrow-repeat"></i>}
          label="Solicitudes totales"
          value={cargando ? "..." : stats.totalSolicitudes}
          sub={`${stats.reportesPendientes} pendientes`}
          type="info"
        />
        <StatCard
          icon={<i className="bi bi-flag-fill"></i>}
          label="Reportes pendientes"
          value={cargando ? "..." : stats.reportesPendientes}
          sub={stats.reportesPendientes > 0 ? "Requieren revisión" : "Al día"}
          type="danger"
        />
      </div>

      <div className="admin-activity-card">
        <p className="admin-activity-card__title">
          <i className="bi bi-journal-text"></i> Actividad reciente
        </p>
        <div className="admin-activity-list">
          {actividad.length === 0 ? (
            <p style={{ color: "var(--texto2)", textAlign: "center", padding: "20px" }}>
              No hay actividad reciente
            </p>
          ) : (
            actividad.map((a, i) => (
              <div key={i} className="admin-activity-item">
                <div
                  className={`admin-activity-item__dot admin-activity-item__dot--${a.tipo}`}
                />
                <span className="admin-activity-item__action">{a.accion}</span>
                <span className="admin-activity-item__detail">{a.detalle}</span>
                <span className="admin-activity-item__time">{a.hora}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
