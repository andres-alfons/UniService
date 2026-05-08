import { useState, useEffect } from "react";
import { formatFecha } from "./UtilidadesAdmin";

const API = "http://localhost:5165/api";

export default function SeccionServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API}/services`)
      .then((r) => r.json())
      .then((data) => setServicios(Array.isArray(data) ? data : []))
      .catch(() => setServicios([]))
      .finally(() => setCargando(false));
  }, []);

  const eliminar = async (id) => {
    if (!confirm("⚠️ ¿Eliminar este servicio?")) return;
    await fetch(`${API}/services/${id}`, { method: "DELETE" });
    setServicios((prev) => prev.filter((s) => s.id_servicio !== id));
  };

  const pausar = async (id) => {
    await fetch(`${API}/services/${id}/pausar`, { method: "PUT" });
    setServicios((prev) =>
      prev.map((s) =>
        s.id_servicio === id ? { ...s, estado: "inactivo" } : s,
      ),
    );
  };

  const filtrados = servicios.filter((s) =>
    [s.titulo, s.proveedor, s.nombre_categoria].some((v) =>
      (v || "").toLowerCase().includes(busqueda.toLowerCase()),
    ),
  );

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="admin-section__pre admin-section__pre--success">
            Gestión
          </p>
          <h2 className="admin-section__title">Servicios</h2>
        </div>
        <input
          className="admin-input-search"
          type="text"
          placeholder="🔍 Buscar servicio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {[
                "Servicio",
                "Proveedor",
                "Categoría",
                "Precio/hr",
                "Fecha",
                "Acciones",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={6} className="admin-table__status">
                  Cargando...
                </td>
              </tr>
            ) : (
              filtrados.map((s) => (
                <tr key={s.id_servicio}>
                  <td>
                    <div className="admin-table__service-info">
                      <span className="admin-table__service-icon">
                        {s.icono || "📌"}
                      </span>
                      <div>
                        <p className="admin-table__service-name">{s.titulo}</p>
                        <p className="admin-table__id">ID #{s.id_servicio}</p>
                      </div>
                    </div>
                  </td>
                  <td className="admin-table__provider">{s.proveedor}</td>
                  <td className="admin-table__category">
                    {s.nombre_categoria}
                  </td>
                  <td className="admin-table__price">
                    ${(s.precio_hora || 0).toLocaleString("es-CO")}
                  </td>
                  <td className="admin-table__date">
                    {formatFecha(s.fecha_publicacion)}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        className="admin-btn-action admin-btn-action--warning"
                        onClick={() => pausar(s.id_servicio)}
                      >
                        Pausar
                      </button>
                      <button
                        className="admin-btn-action admin-btn-action--danger"
                        onClick={() => eliminar(s.id_servicio)}
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
