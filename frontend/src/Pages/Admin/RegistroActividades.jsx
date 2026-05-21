import { useState, useEffect } from "react";

export default function SeccionLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_logs");
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch {
        setLogs([]);
      }
    }
  }, []);

  const logActividad = (accion, detalle) => {
    const nuevoLog = {
      id: Date.now(),
      admin: localStorage.getItem("usuario") || "admin",
      accion,
      detalle,
      ip: "local",
      fecha: new Date().toLocaleString("es-CO"),
    };
    const actualizados = [nuevoLog, ...logs].slice(0, 100);
    setLogs(actualizados);
    localStorage.setItem("admin_logs", JSON.stringify(actualizados));
  };

  useEffect(() => {
    window.registrarLogAdmin = logActividad;
    return () => {
      delete window.registrarLogAdmin;
    };
  }, [logs]);

  return (
    <section className="admin-section">
      <div className="admin-header">
        <p className="admin-header__pre admin-header__pre--info">Auditoría</p>
        <h2 className="admin-header__title">Registro de actividad</h2>
      </div>
      <div className="admin-table-container">
        <table className="admin-table admin-table--logs">
          <thead>
            <tr>
              {["#", "Admin", "Acción", "Detalle", "IP", "Fecha"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table__status">
                  No hay registros de actividad aún.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td className="admin-table__id">{l.id}</td>
                  <td className="admin-table__admin">{l.admin}</td>
                  <td>
                    <span className="admin-log-action">{l.accion}</span>
                  </td>
                  <td className="admin-table__detail">{l.detalle}</td>
                  <td className="admin-table__ip">{l.ip}</td>
                  <td className="admin-table__date">{l.fecha}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
