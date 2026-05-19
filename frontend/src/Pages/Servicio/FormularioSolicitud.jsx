// Formulario para solicitar un servicio a un proveedor
// Permite crear, validar y eliminar solicitudes con múltiples campos
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatHora } from "./utilidades";

const API_SOLICITUD = "/api/solicitudes";

function FormSolicitud({
  servicioId,
  proveedorId,
  proveedorNombre,
  showModal,
}) {
  // Estado del formulario con todos los campos de la solicitud
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

  // Indica si ya existe una solicitud del usuario para este servicio
  const [solicitudExiste, setSolicitudExiste] = useState(false);

  const [estado, setEstado] = useState("idle");

  // Al cargar el componente, verifica si ya hay una solicitud previa
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

  // Maneja cambios en campos del formulario (input, checkbox, file)
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  // Envía o elimina la solicitud según el estado actual
  const handleAccionSolicitud = async () => {
    const id_cliente = Number(localStorage.getItem("usuarioId"));
    const id_servicio_num = Number(servicioId);
    const id_proveedor_num = Number(proveedorId);

    // Validar que los datos del usuario sean correctos
    if (!id_cliente || !id_servicio_num || !id_proveedor_num) {
      showModal("error", "Datos inválidos");
      return;
    }

    // Si ya existe una solicitud, la elimina
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
          showModal("success", "Solicitud eliminada");
        } else {
          showModal("error", data.error || "Error al eliminar");
        }
      } catch (error) {
        showModal("error", "Error al eliminar solicitud");
      }

      return;
    }

    // Validar campos obligatorios del formulario
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
      showModal("error", "Completa todos los campos obligatorios");
      return;
    }

    // Validar límite de presupuesto
    if (Number(form.presupuesto) > 9999999) {
      showModal("error", "El presupuesto es demasiado grande");
      return;
    }

    // Construir el payload para la API
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
      // Enviar solicitud al backend
      const res = await fetch(API_SOLICITUD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSolicitudExiste(true);

        // Reiniciar formulario tras envío exitoso
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

        // Notificar a otros componentes que la solicitud cambió
        window.dispatchEvent(new CustomEvent("solicitud-actualizada"));

        showModal("success", "Solicitud enviada");
      } else {
        console.log("ERROR RESPUESTA COMPLETA BACKEND:", data);
        showModal("error", data.message || data.error || "Error al enviar");
      }
    } catch (error) {
      showModal("error", "Error al enviar solicitud");
    }
  };

  // Filtra el campo de presupuesto para aceptar solo dígitos numéricos (máx 10)
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
        <h3><i className="bi bi-pencil-square"></i> Solicitar Servicio a {proveedorNombre}</h3>

        <div className="form-grupo-custom">
          <label><i className="bi bi-pin"></i> Tipo de servicio *</label>
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
          <label><i className="bi bi-pencil-square"></i> Descripción *</label>
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
            <span><i className="bi bi-calendar3"></i> Fecha preferida</span>
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
          <label><i className="bi bi-clock"></i> Hora deseada *</label>
          <input
            type="time"
            name="hora_deseada"
            value={form.hora_deseada || ""}
            onChange={handleChange}
            className="form-input-custom"
          />
        </div>

        <div className="form-grupo-custom">
          <label><i className="bi bi-stopwatch"></i> Duración *</label>
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
          <label><i className="bi bi-laptop"></i> Modalidad *</label>
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
          <label><i className="bi bi-credit-card-2-front"></i> Método de pago *</label>
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
            <i className="bi bi-cash"></i> Pago anticipado
          </label>
        </div>

        <div className="form-grupo-custom">
          <label><i className="bi bi-cash-coin"></i> Presupuesto *</label>
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
          <label><i className="bi bi-lightning-fill"></i> Urgencia *</label>
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
            <i className="bi bi-paperclip"></i> Adjuntar archivo
            <input
              type="file"
              name="archivo"
              onChange={handleChange}
              className="form-input-custom"
            />
          </label>

          {form.archivo && (
            <p className="nombre-archivo"><i className="bi bi-check-circle"></i> {form.archivo.name}</p>
          )}
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleAccionSolicitud}
          disabled={estado === "enviando"}
        >
          {solicitudExiste ? <><i className="bi bi-trash"></i> Eliminar solicitud</> : <><i className="bi bi-envelope"></i> Enviar solicitud</>}
        </button>
      </form>
    </>
  );
}

export default FormSolicitud;
