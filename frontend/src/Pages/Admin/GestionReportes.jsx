import { useState } from "react";
import { Badge, formatFecha } from "./UtilidadesAdmin";

export default function SeccionReportes() {
  const [reportes, setReportes] = useState([
    {
      id: 1,
      tipo: "Servicio inapropiado",
      descripcion: "Contenido que no corresponde a servicios académicos",
      reportado: "Tutoría de Marketing Digital",
      reportadoPor: "juan.c@upc.edu.co",
      fecha: "2026-04-28",
      estado: "pendiente",
    },
    {
      id: 2,
      tipo: "Usuario sospechoso",
      descripcion:
        "El usuario contacta fuera de la plataforma y solicita pagos externos",
      reportado: "carlos.vendedor@gmail.com",
      reportadoPor: "ana.r@unicesar.edu.co",
      fecha: "2026-04-27",
      estado: "pendiente",
    },
    {
      id: 3,
      tipo: "Precio abusivo",
      descripcion: "Cobra 5 veces más de lo normal por tutorías básicas",
      reportado: "Tutoría de Álgebra Lineal",
      reportadoPor: "pedro.m@upc.edu.co",
      fecha: "2026-04-26",
      estado: "cerrada",
    },
  ]);

  const resolver = (id) =>
    setReportes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: "cerrada" } : r)),
    );

  return (
    <section className="admin-section">
      <div className="admin-header">
        <p className="admin-header__pre admin-header__pre--danger">
          Moderación
        </p>
        <h2 className="admin-header__title">Reportes</h2>
      </div>
      <div className="admin-reports-list">
        {reportes.map((r) => (
          <div
            key={r.id}
            className={`admin-report-card admin-report-card--${r.estado}`}
          >
            <div className="admin-report-card__header">
              <div className="admin-report-card__info">
                <span className="admin-report-card__icon">
                  {r.estado === "pendiente" ? <i className="bi bi-flag"></i> : <i className="bi bi-check-circle"></i>}
                </span>
                <div>
                  <p className="admin-report-card__type">{r.tipo}</p>
                  <p className="admin-report-card__meta">
                    Reportado: <span>{r.reportado}</span> · Por:{" "}
                    <span>{r.reportadoPor}</span> · {formatFecha(r.fecha)}
                  </p>
                </div>
              </div>
              <Badge estado={r.estado} />
            </div>
            <p className="admin-report-card__desc">{r.descripcion}</p>
            {r.estado === "pendiente" && (
              <div className="admin-report-card__actions">
                <button
                  className="admin-btn-action admin-btn-action--success"
                  onClick={() => resolver(r.id)}
                >
                  <i className="bi bi-check-circle"></i> Marcar resuelta
                </button>
                <button className="admin-btn-action admin-btn-action--danger">
                  🚫 Tomar acción
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
