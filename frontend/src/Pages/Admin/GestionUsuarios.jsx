import { useState, useEffect } from "react";
import { Badge, formatFecha } from "./UtilidadesAdmin";

const API = "http://localhost:5165/api";

export default function SeccionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API}/users`)
      .then((r) => r.json())
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setUsuarios([]))
      .finally(() => setCargando(false));
  }, []);

  const suspender = async (id) => {
    if (!confirm("¿Suspender este usuario?")) return;
    await fetch(`${API}/users/${id}/suspender`, { method: "PUT" });
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id_usuario === id ? { ...u, estado: "Suspendido" } : u,
      ),
    );
  };

  const eliminar = async (id) => {
    if (
      !confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")
    )
      return;
    await fetch(`${API}/users/${id}`, { method: "DELETE" });
    setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id));
  };

  const filtrados = usuarios.filter((u) =>
    [u.nombre, u.correo, u.rol].some((v) =>
      (v || "").toLowerCase().includes(busqueda.toLowerCase()),
    ),
  );

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="admin-section__pre">Gestión</p>
          <h2 className="admin-section__title">Usuarios</h2>
        </div>
        <input
          className="admin-input-search"
          type="text"
          placeholder="Buscar usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {[
                "ID",
                "Nombre",
                "Correo",
                "Rol",
                "Estado",
                "Fecha registro",
                "Acciones",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="admin-table__status">
                  Cargando...
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table__status">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              filtrados.map((u) => (
                <tr key={u.id_usuario}>
                  <td className="admin-table__id">#{u.id_usuario}</td>
                  <td>
                    <div className="admin-table__user-info">
                      <div className="admin-table__avatar">
                        {(u.nombre || "?").charAt(0).toUpperCase()}
                      </div>
                      {u.nombre}
                    </div>
                  </td>
                  <td className="admin-table__email">{u.correo}</td>
                  <td>
                    <span
                      className={`admin-role-badge admin-role-badge--${u.rol || "usuario"}`}
                    >
                      {u.rol || "usuario"}
                    </span>
                  </td>
                  <td>
                    <Badge estado={u.estado || "activo"} />
                  </td>
                  <td className="admin-table__date">
                    {formatFecha(u.fecha_registro)}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        className="admin-btn-action admin-btn-action--warning"
                        onClick={() => suspender(u.id_usuario)}
                      >
                        Suspender
                      </button>
                      <button
                        className="admin-btn-action admin-btn-action--danger"
                        onClick={() => eliminar(u.id_usuario)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
