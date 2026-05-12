// Registro de actividades — Auditoría de acciones realizadas por administradores
// Muestra una tabla con el historial de operaciones (eliminar, suspender, etc.)
export default function SeccionLogs() {
  // Datos mock del registro de actividad administrativa
  const logs = [
    {
      id: 1,
      admin: "admin@uniservice.co",
      accion: "Eliminó usuario",
      detalle: "user_id: 34",
      ip: "192.168.1.1",
      fecha: "2026-04-29 14:32",
    },
    {
      id: 2,
      admin: "admin@uniservice.co",
      accion: "Suspendió servicio",
      detalle: "service_id: 88",
      ip: "192.168.1.1",
      fecha: "2026-04-29 13:10",
    },
  ];

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
            {logs.map((l) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
