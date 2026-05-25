import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getConfiguracionSolicitud } from "../shared/constantes";
import { apiFetch } from "../../utils/apiFetch";

const API_SOLICITUD = "/api/solicitudes";

function FormSolicitud({
  servicioId,
  proveedorId,
  proveedorNombre,
  categoria,
  showModal,
}) {
  const config = getConfiguracionSolicitud(categoria);

  const [form, setForm] = useState({});
  const [solicitudExiste, setSolicitudExiste] = useState(false);
  const [estado, setEstado] = useState("idle");

  useEffect(() => {
    const initial = {};
    config.campos.forEach((campo) => {
      initial[campo.nombre] = campo.tipo === "file" ? null : "";
    });
    setForm(initial);
  }, [config]);

  useEffect(() => {
    const verificar = async () => {
      try {
        const id_cliente = Number(localStorage.getItem("usuarioId"));
        const { data } = await apiFetch(
          `${API_SOLICITUD}/verificar?id_cliente=${id_cliente}&id_servicio=${servicioId}`,
        );
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

  const handleDateChange = (campo, date) => {
    if (!date) return;
    setForm((prev) => ({
      ...prev,
      [campo]: date.toISOString().split("T")[0],
    }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const soloNumeros = value.replace(/[^0-9]/g, "");
    const limitado = soloNumeros.slice(0, 10);
    setForm((prev) => ({ ...prev, [name]: limitado }));
  };

  const validarFormulario = () => {
    for (const campo of config.campos) {
      if (campo.obligatorio && (!form[campo.nombre] || form[campo.nombre] === "")) {
        showModal("error", `El campo '${campo.label}' es obligatorio`);
        return false;
      }
    }
    if (form.presupuesto && Number(form.presupuesto) > 9999999) {
      showModal("error", "El presupuesto es demasiado grande");
      return false;
    }
    return true;
  };

  const construirPayload = () => {
    const id_cliente = Number(localStorage.getItem("usuarioId"));
    const id_servicio_num = Number(servicioId);
    const id_proveedor_num = Number(proveedorId);

    const camposPersonalizados = {};
    config.campos.forEach((campo) => {
      if (!["descripcion", "fecha_deseada", "hora_deseada", "presupuesto", "archivo"].includes(campo.nombre)) {
        if (form[campo.nombre]) {
          camposPersonalizados[campo.nombre] = form[campo.nombre];
        }
      }
    });

    let fechaDeseada = null;
    if (form.fecha_deseada) {
      fechaDeseada = form.fecha_deseada + "T00:00:00";
    }
    if (form.fecha_inicio) {
      fechaDeseada = form.fecha_inicio + "T00:00:00";
      camposPersonalizados.fecha_inicio = form.fecha_inicio;
    }

    const payload = {
      id_cliente,
      id_proveedor: id_proveedor_num,
      id_servicio: id_servicio_num,
      tipo_servicio: categoria || "Otro",
      tema: "",
      descripcion: form.descripcion || "",
      fecha_deseada: fechaDeseada,
      hora_deseada: form.hora_deseada || null,
      duracion: form.duracion || form.dias_estadia || null,
      modalidad: null,
      metodo_pago: null,
      presupuesto: Number(form.presupuesto) || 0,
      pago_anticipado: false,
      urgencia: null,
      archivo: form.archivo ? form.archivo.name : null,
      campos_personalizados: JSON.stringify(camposPersonalizados),
    };

    return payload;
  };

  const handleAccionSolicitud = async () => {
    const id_cliente = Number(localStorage.getItem("usuarioId"));
    const id_servicio_num = Number(servicioId);

    if (!id_cliente || !id_servicio_num || !Number(proveedorId)) {
      showModal("error", "Datos inválidos");
      return;
    }

    if (solicitudExiste) {
      try {
        const { ok, data } = await apiFetch(
          `${API_SOLICITUD}/eliminar?id_cliente=${id_cliente}&id_servicio=${id_servicio_num}`,
          { method: "DELETE" },
        );
        if (ok) {
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

    if (!validarFormulario()) return;

    setEstado("enviando");
    const payload = construirPayload();

    try {
      const { ok, data } = await apiFetch(API_SOLICITUD, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (ok) {
        setSolicitudExiste(true);
        const initial = {};
        config.campos.forEach((campo) => {
          initial[campo.nombre] = campo.tipo === "file" ? null : "";
        });
        setForm(initial);
        window.dispatchEvent(new CustomEvent("solicitud-actualizada"));
        showModal("success", "Solicitud enviada");
      } else {
        showModal("error", data?.message || data?.error || "Error al enviar");
      }
    } catch (error) {
      showModal("error", "Error al enviar solicitud");
    } finally {
      setEstado("idle");
    }
  };

  const renderCampo = (campo) => {
    const valor = form[campo.nombre] || "";

    switch (campo.tipo) {
      case "textarea":
        return (
          <div className="form-grupo-custom" key={campo.nombre}>
            <label>
              <i className="bi bi-pencil-square"></i> {campo.label} {campo.obligatorio && "*"}
            </label>
            <textarea
              name={campo.nombre}
              value={valor}
              onChange={handleChange}
              className="form-input-custom"
              placeholder={campo.placeholder || ""}
            />
          </div>
        );

      case "date":
        return (
          <div className="form-grupo-custom" key={campo.nombre}>
            <label className="form-label-custom">
              <span><i className="bi bi-calendar3"></i> {campo.label}</span>
              {campo.obligatorio && <span style={{ color: "var(--teal)" }}>*</span>}
            </label>
            <DatePicker
              selected={valor ? new Date(valor + "T00:00:00") : null}
              onChange={(date) => handleDateChange(campo.nombre, date)}
              dateFormat="dd/MM/yyyy"
              minDate={campo.nombre.includes("inicio") ? new Date() : undefined}
              placeholderText="Selecciona una fecha"
              className="form-input-custom"
              calendarClassName="mi-calendario"
              dayClassName={() => "mi-dia"}
              required={campo.obligatorio}
            />
          </div>
        );

      case "time":
        return (
          <div className="form-grupo-custom" key={campo.nombre}>
            <label>
              <i className="bi bi-clock"></i> {campo.label} *
            </label>
            <input
              type="time"
              name={campo.nombre}
              value={valor}
              onChange={handleChange}
              className="form-input-custom"
            />
          </div>
        );

      case "number":
        return (
          <div className="form-grupo-custom" key={campo.nombre}>
            <label>
              <i className="bi bi-cash-coin"></i> {campo.label} *
            </label>
            <input
              className="form-input-custom"
              type="text"
              inputMode="numeric"
              name={campo.nombre}
              value={valor}
              onChange={handleNumericChange}
              placeholder={campo.placeholder || ""}
              maxLength={10}
              pattern="[0-9]*"
              required={campo.obligatorio}
            />
          </div>
        );

      case "select":
        return (
          <div className="form-grupo-custom" key={campo.nombre}>
            <label>
              <i className="bi bi-list-ul"></i> {campo.label} {campo.obligatorio && "*"}
            </label>
            <select
              name={campo.nombre}
              value={valor}
              onChange={handleChange}
              className="form-select-custom"
            >
              <option value="">{campo.placeholder || "Selecciona"}</option>
              {campo.opciones?.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
        );

      case "file":
        return (
          <div className="form-grupo-custom" key={campo.nombre}>
            <label className="custom-file-upload">
              <i className="bi bi-paperclip"></i> {campo.label}
              <input
                type="file"
                name={campo.nombre}
                onChange={handleChange}
                className="form-input-custom"
                accept={campo.accept || "*/*"}
              />
            </label>
            {form.archivo && (
              <p className="nombre-archivo">
                <i className="bi bi-check-circle"></i> {form.archivo.name}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <form className="form-solicitud">
        <h3>
          <i className="bi bi-pencil-square"></i> {config.titulo} a {proveedorNombre}
        </h3>

        {config.campos.map(renderCampo)}

        <button
          type="button"
          className="btn-primary"
          onClick={handleAccionSolicitud}
          disabled={estado === "enviando"}
          style={{ opacity: estado === "enviando" ? 0.6 : 1, cursor: estado === "enviando" ? "not-allowed" : "pointer" }}
        >
          {estado === "enviando" ? (
            <>
              <span className="spinner-mini"></span> Enviando...
            </>
          ) : solicitudExiste ? (
            <><i className="bi bi-trash"></i> Eliminar solicitud</>
          ) : (
            <><i className="bi bi-envelope"></i> Enviar solicitud</>
          )}
        </button>

        {solicitudExiste && (
          <p className="solicitud-existente-info">
            <><i className="bi bi-info-circle"></i> Ya tienes una solicitud activa para este servicio.</>
          </p>
        )}
      </form>
    </>
  );
}

export default FormSolicitud;
