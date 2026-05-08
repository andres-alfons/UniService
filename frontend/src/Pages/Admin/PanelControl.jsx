import { useState } from "react";
import StatCard from "./TarjetaEstadistica";

export default function SeccionDashboard() {
  const [stats] = useState({
    totalUsuarios: 142,
    totalServicios: 87,
    totalSolicitudes: 234,
    reportesPendientes: 5,
  });

  const actividad = [
    {
      accion: "Usuario registrado",
      detalle: "carlos.m@upc.edu.co",
      hora: "hace 3 min",
      tipo: "usuario",
    },
    {
      accion: "Servicio publicado",
      detalle: "Tutoría de Cálculo",
      hora: "hace 8 min",
      tipo: "servicio",
    },
    {
      accion: "Reporte recibido",
      detalle: "Servicio ID #45",
      hora: "hace 15 min",
      tipo: "reporte",
    },
    {
      accion: "Usuario suspendido",
      detalle: "user@ejemplo.com",
      hora: "hace 22 min",
      tipo: "alerta",
    },
    {
      accion: "Categoría creada",
      detalle: "🔬 Ciencias exactas",
      hora: "hace 1 hora",
      tipo: "categoria",
    },
    {
      accion: "Solicitud respondida",
      detalle: "ID #112 → Aceptada",
      hora: "hace 2 horas",
      tipo: "servicio",
    },
  ];

  return (
    <section className="admin-dashboard">
      <div className="admin-header">
        <p className="admin-header__pre">Panel de control</p>
        <h1 className="admin-header__title">Dashboard</h1>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          icon="👥"
          label="Usuarios registrados"
          value={stats.totalUsuarios}
          sub="↑ 12 esta semana"
          type="primary"
        />
        <StatCard
          icon="📋"
          label="Servicios activos"
          value={stats.totalServicios}
          sub="↑ 7 nuevos hoy"
          type="success"
        />
        <StatCard
          icon="🔁"
          label="Solicitudes totales"
          value={stats.totalSolicitudes}
          sub="↑ 23 esta semana"
          type="info"
        />
        <StatCard
          icon="🚩"
          label="Reportes pendientes"
          value={stats.reportesPendientes}
          sub="Requieren revisión"
          type="danger"
        />
      </div>

      <div className="admin-activity-card">
        <p className="admin-activity-card__title">📜 Actividad reciente</p>
        <div className="admin-activity-list">
          {actividad.map((a, i) => (
            <div key={i} className="admin-activity-item">
              <div
                className={`admin-activity-item__dot admin-activity-item__dot--${a.tipo}`}
              />
              <span className="admin-activity-item__action">{a.accion}</span>
              <span className="admin-activity-item__detail">{a.detalle}</span>
              <span className="admin-activity-item__time">{a.hora}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
