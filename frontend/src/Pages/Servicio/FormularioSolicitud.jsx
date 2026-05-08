import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatHora } from "./utilidades";

const API_SOLICITUD = "https://localhost:7237/api/Solicitudes";

function FormSolicitud({
  servicioId,
  proveedorId,
  proveedorNombre,
  showModal,
}) {
  const [form, setForm] = useState({
    tipo_servicio: "",
    descripcion: "",
    fecha_deseada: "",
    hora_deseada: "",
    duracion: "",
    modalidad: "",
    metodo_pago: "",
    presupuesto: "",
    pago_anticipado: false,
    urgencia: "",
    archivo: null,
  });

  const [solicitudExiste, setSolicitudExiste] = useState(false);

  const [estado, setEstado] = useState("idle");

  useEffect(() => {
    const verificar = async () => {
      try {
        const id_cliente = Number(localStorage.getItem("usuarioId"));
        const res = await fetch(
          `${API_SOLICITUD}/verificar?id_cliente=${id_cliente}&id_servicio=${servicioId}`,
        );
        const data = await res.json();
        setSolicitudExiste(data.existe);
      } catch (error) {
        console.error(error);
      }
    };

    if (servicioId) verificar();
  }, [servicioId]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleAccionSolicitud = async () => {
    const id_cliente = Number(localStorage.getItem("usuarioId"));
    const id_servicio_num = Number(servicioId);
    const id_proveedor_num = Number(proveedorId);

    if (!id_cliente || !id_servicio_num || !id_proveedor_num) {
      showModal("error", "❌ Datos inválidos");
      return;
    }

    if (solicitudExiste) {
      try {
        const res = await fetch(
          `${API_SOLICITUD}/eliminar?id_cliente=${id_cliente}&id_servicio=${id_servicio_num}`,
          {
            method: "DELETE",
          },
        );

        const data = await res.json();

        if (res.ok) {
          setSolicitudExiste(false);
          showModal("success", "🗑️ Solicitud eliminada");
        } else {
          showModal("error", data.error || "Error al eliminar");
        }
      } catch (error) {
        showModal("error", "Error al eliminar solicitud");
      }

      return;
    }

    if (
      !form.tipo_servicio ||
      !form.descripcion ||
      !form.fecha_deseada ||
      !form.hora_deseada ||
      !form.duracion ||
      !form.modalidad ||
      !form.metodo_pago ||
      !form.presupuesto ||
      !form.urgencia
    ) {
      showModal("error", "❌ Completa todos los campos obligatorios");
      return;
    }

    if (Number(form.presupuesto) > 9999999) {
      showModal("error", "❌ El presupuesto es demasiado grande");
      return;
    }

    const payload = {
      id_cliente,
      id_proveedor: id_proveedor_num,
      id_servicio: id_servicio_num,

      tipo_servicio: form.tipo_servicio,
      descripcion: form.descripcion,
      fecha_deseada: form.fecha_deseada + "T00:00:00",
      hora_deseada: formatHora(form.hora_deseada) || null,
      tema: "sin tema",

      duracion: form.duracion,
      modalidad: form.modalidad,
      metodo_pago: form.metodo_pago,
      presupuesto: Number(form.presupuesto),
      pago_anticipado: form.pago_anticipado,
      urgencia: form.urgencia,
      archivo: form.archivo ? form.archivo.name : null,
    };

    try {
      const res = await fetch(API_SOLICITUD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSolicitudExiste(true);

        setForm({
          tipo_servicio: "",
          descripcion: "",
          fecha_deseada: "",
          hora_deseada: "",
          duracion: "",
          modalidad: "",
          metodo_pago: "",
          presupuesto: "",
          pago_anticipado: false,
          urgencia: "",
          archivo: null,
        });

        window.dispatchEvent(new CustomEvent("solicitud-actualizada"));

        showModal("success", "📩 Solicitud enviada");
      } else {
        console.log("❌ RESPUESTA COMPLETA BACKEND:", data);
        showModal("error", data.message || data.error || "Error al enviar");
      }
    } catch (error) {
      showModal("error", "Error al enviar solicitud");
    }
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;

    const soloNumeros = value.replace(/[^0-9]/g, "");
    const limitado = soloNumeros.slice(0, 10);

    setForm({
      ...form,
      [name]: limitado,
    });
  };

  return (
    <>
      <form className="form-solicitud">
        <h3>📝 Solicitar Servicio a {proveedorNombre}</h3>

        <div className="form-grupo-custom">
          <label>📌 Tipo de servicio *</label>
          <select
            name="tipo_servicio"
            value={form.tipo_servicio}
            onChange={handleChange}
            className="form-select-custom"
          >
            <option value="">Selecciona</option>
            <option>Tutoría</option>
            <option>Proyecto</option>
            <option>Ensayo</option>
            <option>Diseño</option>
            <option>Otro</option>
          </select>
        </div>

        <div className="form-grupo-custom">
          <label>📝 Descripción *</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="form-input-custom"
            placeholder="Describe lo que necesitas..."
          />
        </div>

        <div className="form-grupo-custom">
          <label className="form-label-custom">
            <span>📅 Fecha preferida</span>
            <span style={{ color: "var(--teal)" }}>*</span>
          </label>

          <DatePicker
            selected={
              form.fecha_deseada
                ? new Date(form.fecha_deseada + "T00:00:00")
                : null
            }
            onChange={(date) => {
              if (!date) return;

              setForm({
                ...form,
                fecha_deseada: date.toISOString().split("T")[0],
              });
            }}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            placeholderText="Selecciona una fecha"
            className="form-input-custom"
            calendarClassName="mi-calendario"
            dayClassName={() => "mi-dia"}
            required
          />
        </div>

        <div className="form-grupo-custom">
          <label>⏰ Hora deseada *</label>
          <input
            type="time"
            name="hora_deseada"
            value={form.hora_deseada || ""}
            onChange={handleChange}
            className="form-input-custom"
          />
        </div>

        <div className="form-grupo-custom">
          <label>⏱️ Duración *</label>
          <select
            name="duracion"
            value={form.duracion}
            onChange={handleChange}
            className="form-select-custom"
          >
            <option value="">Selecciona</option>
            <option>30 min</option>
            <option>1 hora</option>
            <option>2 horas</option>
            <option>3 horas</option>
          </select>
        </div>

        <div className="form-grupo-custom">
          <label>💻 Modalidad *</label>
          <select
            name="modalidad"
            value={form.modalidad}
            onChange={handleChange}
            className="form-select-custom"
          >
            <option value="">Selecciona</option>
            <option>Virtual</option>
            <option>Presencial</option>
            <option>Mixta</option>
          </select>
        </div>

        <div className="form-grupo-custom">
          <label>💳 Método de pago *</label>
          <select
            name="metodo_pago"
            value={form.metodo_pago}
            onChange={handleChange}
            className="form-select-custom"
          >
            <option value="">Selecciona</option>
            <option>Nequi</option>
            <option>Daviplata</option>
            <option>Efectivo</option>
            <option>Transferencia</option>
          </select>
        </div>

        <div className="form-grupo-custom">
          <label className="checkbox-custom">
            <input
              type="checkbox"
              name="pago_anticipado"
              checked={form.pago_anticipado}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            💵 Pago anticipado
          </label>
        </div>

        <div className="form-grupo-custom">
          <label>💰 Presupuesto *</label>
          <input
            className="form-input-custom"
            type="text"
            inputMode="numeric"
            name="presupuesto"
            value={form.presupuesto}
            onChange={handleNumericChange}
            placeholder="Ej: 50000"
            maxLength={10}
            pattern="[0-9]*"
            required
          />
        </div>

        <div className="form-grupo-custom">
          <label>⚡ Urgencia *</label>
          <select
            name="urgencia"
            value={form.urgencia}
            onChange={handleChange}
            className="form-select-custom"
          >
            <option value="">Selecciona</option>
            <option>Baja</option>
            <option>Media</option>
            <option>Alta</option>
          </select>
        </div>

        <div className="form-grupo-custom">
          <label className="custom-file-upload">
            📎 Adjuntar archivo
            <input
              type="file"
              name="archivo"
              onChange={handleChange}
              className="form-input-custom"
            />
          </label>

          {form.archivo && (
            <p className="nombre-archivo">✅ {form.archivo.name}</p>
          )}
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleAccionSolicitud}
          disabled={estado === "enviando"}
        >
          {solicitudExiste ? "🗑️ Eliminar solicitud" : "📩 Enviar solicitud"}
        </button>
      </form>
    </>
  );
}

export default FormSolicitud;
