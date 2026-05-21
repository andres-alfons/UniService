import { useState, useEffect } from "react";
import { Badge, formatFecha } from "./UtilidadesAdmin";

const API = "/api";

export default function SeccionUsuarios({ onRefresh }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      const normalizados = (Array.isArray(data) ? data : []).map((u) => ({
        ...u,
        estado: u.estado === true || u.estado === 1 ? "activo" : "inactivo",
        rol: u.id_rol === 1 ? "admin" : "usuario",
      }));
      setUsuarios(normalizados);
    } catch {
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const suspender = async (id) => {
    const u = usuarios.find((x) => x.id_usuario === id);
    if (!confirm("¿Suspender este usuario?")) return;
    try {
      await fetch(`${API}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: 0 }),
      });
      setUsuarios((prev) =>
        prev.map((x) =>
          x.id_usuario === id ? { ...x, estado: "inactivo" } : x
        )
      );
      if (window.registrarLogAdmin) {
        window.registrarLogAdmin("Suspendió usuario", `${u?.nombre || u?.correo} (ID: ${id})`);
      }
    } catch (err) {
      alert("Error al suspender: " + err.message);
    }
  };

  const activar = async (id) => {
    const u = usuarios.find((x) => x.id_usuario === id);
    if (!confirm("¿Activar este usuario?")) return;
    try {
      await fetch(`${API}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: 1 }),
      });
      setUsuarios((prev) =>
        prev.map((x) =>
          x.id_usuario === id ? { ...x, estado: "activo" } : x
        )
      );
      if (window.registrarLogAdmin) {
        window.registrarLogAdmin("Activó usuario", `${u?.nombre || u?.correo} (ID: ${id})`);
      }
    } catch (err) {
      alert("Error al activar: " + err.message);
    }
  };

  const eliminar = async (id) => {
    const u = usuarios.find((x) => x.id_usuario === id);
    if (
      !confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")
    )
      return;
    try {
      await fetch(`${API}/users/${id}`, { method: "DELETE" });
      setUsuarios((prev) => prev.filter((x) => x.id_usuario !== id));
      if (window.registrarLogAdmin) {
        window.registrarLogAdmin("Eliminó usuario", `${u?.nombre || u?.correo} (ID: ${id})`);
      }
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const iniciarEdicion = (u) => {
    setEditandoId(u.id_usuario);
    setEditNombre(u.nombre);
  };

  const guardarNombre = async (id) => {
    if (!editNombre.trim()) return;
    try {
      await fetch(`${API}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: editNombre }),
      });
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === id ? { ...u, nombre: editNombre } : u
        )
      );
      setEditandoId(null);
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  const filtrados = usuarios.filter((u) =>
    [u.nombre, u.correo, u.rol].some((v) =>
      (v || "").toLowerCase().includes(busqueda.toLowerCase())
    )
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
              {["ID", "Nombre", "Correo", "Rol", "Estado", "Fecha registro", "Acciones"].map(
                (h) => (
                  <th key={h}>{h}</th>
                )
              )}
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
                      {editandoId === u.id_usuario ? (
                        <input
                          type="text"
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && guardarNombre(u.id_usuario)
                          }
                          style={{
                            background: "var(--bg2)",
                            border: "1px solid var(--teal)",
                            color: "var(--texto)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.85rem",
                            width: "140px",
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          onDoubleClick={() => iniciarEdicion(u)}
                          style={{ cursor: "pointer" }}
                          title="Doble clic para editar"
                        >
                          {u.nombre}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="admin-table__email">{u.correo}</td>
                  <td>
                    <span
                      className={`admin-role-badge admin-role-badge--${u.rol}`}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <Badge estado={u.estado} />
                  </td>
                  <td className="admin-table__date">
                    {formatFecha(u.fecha_registro)}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      {editandoId === u.id_usuario ? (
                        <>
                          <button
                            className="admin-btn-action admin-btn-action--success"
                            onClick={() => guardarNombre(u.id_usuario)}
                          >
                            Guardar
                          </button>
                          <button
                            className="admin-btn-action admin-btn-action--ghost"
                            onClick={() => setEditandoId(null)}
                          >
                            ✕
                          </button>
                        </>
                      ) : u.estado === "activo" ? (
                        <button
                          className="admin-btn-action admin-btn-action--warning"
                          onClick={() => suspender(u.id_usuario)}
                        >
                          Suspender
                        </button>
                      ) : (
                        <button
                          className="admin-btn-action admin-btn-action--success"
                          onClick={() => activar(u.id_usuario)}
                        >
                          Activar
                        </button>
                      )}
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
