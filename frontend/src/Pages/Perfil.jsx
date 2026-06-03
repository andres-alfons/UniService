import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Components/Navbar_Perfil";
import Modal from "../Components/Modal";
import "../styles/styleHome.css";
import "../styles/stylePerfil.css";
import StatItem from "./Perfil/ElementoEstadistica";
import MenuItem from "./Perfil/ElementoMenu";
import InfoItem from "./Perfil/ElementoInfo";
import BotonTema from "../Components/B_StyleHome";
import ChatPanel from "./Principal/ChatPanel";
import ModalReporte from "../Components/ModalReporte";
import { apiFetch, apiImageUrl } from "../utils/apiFetch";

const API_USUARIO = "/api/users";

const Perfil = () => {
  // Hook de navegación — redirige programáticamente a otras rutas
  const navigate = useNavigate();
  // Referencia al input de archivo sin re-renderizar el componente
  const FileInputRef = useRef(null);

  // useParams permite leer el :id de la URL, por ejemplo /perfil/12
  // Si no hay id en la URL, el usuario está viendo su propio perfil
  const { id: idUrl } = useParams();

  // ID del usuario que inició sesión (guardado en localStorage al hacer login)
  const id_usuario_logueado = localStorage.getItem("usuarioId");

  // Si la URL trae un ID distinto al del usuario logueado, es un perfil ajeno
  const esPerfilExterno = idUrl && idUrl !== id_usuario_logueado;

  // Dependiendo de si es externo o propio, consultamos un ID diferente
  const id_a_consultar = esPerfilExterno ? idUrl : id_usuario_logueado;

  // Estado para saber si el usuario logueado ya sigue al dueño del perfil externo
  const [siguiendo, setSiguiendo] = useState(false);

  // Estado principal con todos los datos del perfil a mostrar
  // Se inicializa con valores por defecto mientras llega la respuesta del API
  const [userData, setUserData] = useState({
    nombre: "Cargando...",
    avatar: "../src/img/default-avatar.png",
    descripcion: "Cargando información...",
    telefono: "No disponible",
    correo: "usuario@ejemplo.com",
    fecha_registro: "2024-01-01",
    estado: 0, // 0 = desconectado por defecto mientras carga
    total_publicaciones: 0,
    total_seguidores: 0,
    total_siguiendo: 0,
    reputacion: null, // null hasta que llegue el dato real
    universidad: "Sin universidad",
  });

  // Flag antirrebote: impide múltiples clics en "Seguir/Dejar de seguir"
  const [enviandoSeguimiento, setEnviandoSeguimiento] = useState(false);

  // Controla qué modal está visible: "info", "imagen", "actividad", "seguridad" o null
  const [activeModal, setActiveModal] = useState(null);

  // Lista de servicios publicados por el usuario (solo se carga si es perfil propio)
  const [misServicios, setMisServicios] = useState([]);
  const [modalServicios, setModalServicios] = useState(false);
  // Almacena el servicio que se está editando (con todos sus campos)
  const [editando, setEditando] = useState(null);
  // Guarda el ID del servicio que se quiere eliminar, para mostrar confirmación
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  // Modal de seguidores
  const [modalSeguidores, setModalSeguidores] = useState(false);
  const [listaSeguidores, setListaSeguidores] = useState([]);
  const [cargandoSeguidores, setCargandoSeguidores] = useState(false);

  // Agregar junto a los otros estados
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);

  // Modal de siguiendo
  const [modalSiguiendo, setModalSiguiendo] = useState(false);

  // Modal de alertas (reemplaza alert())
  const [modalAlerta, setModalAlerta] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
  });
  const [chatPanelAbierto, setChatPanelAbierto] = useState(false);

  const mostrarAlerta = (type, title, message) => {
    setModalAlerta({ show: true, type, title, message });
  };

  // Estados para el modal de seguridad
  const [seguridadSubPaso, setSeguridadSubPaso] = useState(null);
  const [seguridadCargando, setSeguridadCargando] = useState(false);

  // Formulario de cambio de contraseña
  const [formPassword, setFormPassword] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  // Formulario de cambio de correo
  const [formCorreo, setFormCorreo] = useState({
    nuevoCorreo: "",
    password: "",
  });

  const resetSeguridadForms = () => {
    setSeguridadSubPaso(null);
    setSeguridadCargando(false);
    setFormPassword({ actual: "", nueva: "", confirmar: "" });
    setFormCorreo({ nuevoCorreo: "", password: "" });
  };

  const handleCambiarPassword = async () => {
    if (!formPassword.actual || !formPassword.nueva || !formPassword.confirmar) {
      mostrarAlerta("error", "Error", "Todos los campos son requeridos.");
      return;
    }
    if (formPassword.nueva.length < 8) {
      mostrarAlerta("error", "Error", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (formPassword.nueva !== formPassword.confirmar) {
      mostrarAlerta("error", "Error", "Las contraseñas no coinciden.");
      return;
    }
    setSeguridadCargando(true);
    try {
      const { ok, data } = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          contrasenaActual: formPassword.actual,
          contrasenaNueva: formPassword.nueva,
        }),
      });
      if (ok) {
        mostrarAlerta("success", "Hecho", "Contraseña cambiada correctamente.");
        resetSeguridadForms();
        setActiveModal(null);
      } else {
        mostrarAlerta("error", "Error", data?.error || "No se pudo cambiar la contraseña.");
      }
    } catch {
      mostrarAlerta("error", "Error", "Error de conexión con el servidor.");
    } finally {
      setSeguridadCargando(false);
    }
  };

  const handleCambiarCorreo = async () => {
    if (!formCorreo.nuevoCorreo || !formCorreo.password) {
      mostrarAlerta("error", "Error", "Todos los campos son requeridos.");
      return;
    }
    if (!formCorreo.nuevoCorreo.includes("@")) {
      mostrarAlerta("error", "Error", "Ingresa un correo electrónico válido.");
      return;
    }
    setSeguridadCargando(true);
    try {
      const { ok, data } = await apiFetch("/api/auth/change-email", {
        method: "POST",
        body: JSON.stringify({
          nuevoCorreo: formCorreo.nuevoCorreo,
          password: formCorreo.password,
        }),
      });
      if (ok) {
        setUserData((prev) => ({ ...prev, correo: formCorreo.nuevoCorreo }));
        mostrarAlerta("success", "Hecho", "Correo cambiado correctamente.");
        resetSeguridadForms();
        setActiveModal(null);
      } else {
        mostrarAlerta("error", "Error", data?.error || "No se pudo cambiar el correo.");
      }
    } catch {
      mostrarAlerta("error", "Error", "Error de conexión con el servidor.");
    } finally {
      setSeguridadCargando(false);
    }
  };
  const [listaSiguiendo, setListaSiguiendo] = useState([]);
  const [cargandoSiguiendo, setCargandoSiguiendo] = useState(false);

  // Modal de gestión de imágenes
  const [editandoImagenes, setEditandoImagenes] = useState(null);
  const [imagenesServicio, setImagenesServicio] = useState([]);
  const [cargandoImagenes, setCargandoImagenes] = useState(false);
  const fileInputRefImagenes = useRef(null);

  const abrirModalSeguidores = async () => {
    setModalSeguidores(true);
    setCargandoSeguidores(true);
    try {
      const { data } = await apiFetch(
        `/api/seguidores/lista?id_usuario=${id_a_consultar}`,
      );
      setListaSeguidores(data);
    } catch (err) {
      console.error("Error al cargar seguidores:", err);
    } finally {
      setCargandoSeguidores(false);
    }
  };

  const abrirModalSiguiendo = async () => {
    setModalSiguiendo(true);
    setCargandoSiguiendo(true);
    try {
      const { data } = await apiFetch(
        `/api/seguidores/siguiendo?id_usuario=${id_a_consultar}`,
      );
      setListaSiguiendo(data);
    } catch (err) {
      console.error("Error al cargar siguiendo:", err);
    } finally {
      setCargandoSiguiendo(false);
    }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/img/default_avatar.png";
    if (avatar === "img/default_avatar.png") return "/img/default_avatar.png";
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/avatars/") || avatar.startsWith("/imagenes-servicios/")) {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      return `${API_BASE}${avatar}`;
    }
    if (avatar.startsWith("/src") || avatar.startsWith("../")) return avatar;
    return `/${avatar}`;
  };

  // ════════════════════════════════════════════════════════════
  // SABER SI YA SEGUIMOS A ESTE USUARIO (solo en perfil externo)
  // ════════════════════════════════════════════════════════════

  useEffect(() => {
    if (esPerfilExterno && id_usuario_logueado && id_a_consultar) {
      apiFetch(
        `/api/seguidores/estado?seguidor=${id_usuario_logueado}&seguido=${id_a_consultar}`,
      )
        .then(({ data }) => setSiguiendo(data.sigues))
        .catch((err) => console.error("Error al verificar seguimiento:", err));
    }
  }, [id_a_consultar, esPerfilExterno, id_usuario_logueado]);

  // ════════════════════════
  // CARGAR DATOS DEL USUARIO
  // ════════════════════════
  useEffect(() => {
    // Guardamos para no hacer fetch con un ID inválido
    if (!id_a_consultar || id_a_consultar === "undefined") {
      console.warn("No hay ID guardado. Debes iniciar sesión.");
      return;
    }

    // GET al endpoint de usuarios con el token JWT en el header para autenticar
    apiFetch(`/api/users/${id_a_consultar}`)
      .then(({ data }) => {
        if (!data.error) {
          let enLinea = false;
          if (data.ultima_actividad) {
            const ultima = new Date(data.ultima_actividad);
            const ahora = new Date();
            const diffMinutos = (ahora - ultima) / 60000;
            enLinea = diffMinutos < 2;
          }
          setUserData({
            ...data,
            estado: enLinea,
          });
        }
      })
      .catch((err) => console.error("Error al cargar perfil:", err));

    // Permitimos cerrar cualquier modal con la tecla Escape
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    // Limpiamos el evento al desmontar el componente para evitar memory leaks
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id_a_consultar]);

  // ═════════════════════════════════
  // CARGAR DATOS DE SERVICIOS PROPIOS
  // ═════════════════════════════════
  useEffect(() => {
    // Los servicios solo se cargan si es el perfil propio
    if (esPerfilExterno || !id_a_consultar || id_a_consultar === "undefined")
      return;

    // Traemos servicios del usuario con paginación (pedimos más para asegurar)
    apiFetch(`/api/services?page=1&pageSize=50&orden=recientes`)
      .then(({ data }) => {
        const lista = data.servicios || data;
        if (!Array.isArray(lista)) return;
        setMisServicios(
          lista.filter((s) => s.id_proveedor === parseInt(id_a_consultar)),
        );
      })
      .catch(console.error);
  }, [id_a_consultar, esPerfilExterno]);

  // ════════════════════════════════════════════════════════
  // ACTUALIZAR INFO EN LA BASE DE DATOS (solo perfil propio)
  // ════════════════════════════════════════════════════════
  // Función genérica: recibe el nombre del campo y el nuevo valor
  // Esto permite reusar la misma función para nombre, descripción, teléfono, etc.
  const handleUpdate = async (campo, valor) => {
    try {
      const { ok, data } = await apiFetch(`/api/users/${id_usuario_logueado}`, {
        method: "PUT",
        body: JSON.stringify({ [campo]: valor }),
      });
      if (ok) {
        setUserData((prev) => ({ ...prev, [campo]: valor }));
        setActiveModal(null);
      }
    } catch {
      mostrarAlerta("error", "Error", "No se pudo actualizar el campo.");
    }
  };

  // ═════════════
  // CERRAR SESIÓN
  // ═════════════
  const handleCerrarSesion = async () => {
    try {
      await apiFetch(`/api/users/${id_usuario_logueado}`, {
        method: "PUT",
        body: JSON.stringify({ estado: 0 }),
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      localStorage.clear();
      navigate("/home-guest");
    }
  };

  // Prepara y envía los datos del servicio editado al backend
  const guardarEdicion = async (s) => {
    const body = {
      id_proveedor: parseInt(id_usuario_logueado),
      titulo: s.titulo || "",
      descripcion: s.descripcion || "",
      precio_hora: Number(s.precio_hora) || 0,
      contacto: s.contacto || "",
      icono: s.icono || "bi-pin",
    };

    const { ok, data } = await apiFetch(`/api/services/${s.id_servicio}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (ok) {
      setMisServicios((prev) =>
        prev.map((x) =>
          x.id_servicio === s.id_servicio ? { ...x, ...body } : x,
        ),
      );
      setEditando(null);
    } else {
      mostrarAlerta("error", "Error", data?.error || "No se pudo guardar.");
    }
  };

  // Llama al endpoint DELETE y elimina el servicio de la lista local si el servidor responde OK
  const confirmarEliminar = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `/api/services/${confirmEliminar}?id_proveedor=${id_usuario_logueado}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      },
    );
    if (res.ok) {
      // Filtramos el servicio eliminado del estado para que desaparezca de la UI
      setMisServicios((prev) =>
        prev.filter((s) => s.id_servicio !== confirmEliminar),
      );
      setConfirmEliminar(null);
    } else {
      mostrarAlerta("error", "Error", "No se pudo eliminar el servicio.");
    }
  };

  // ════════════════════════════════
  // GESTIÓN DE IMÁGENES DEL SERVICIO
  // ════════════════════════════════
  const abrirEditorImagenes = async (servicio) => {
    setEditandoImagenes(servicio);
    setCargandoImagenes(true);
    try {
      const { data } = await apiFetch(`/api/services/${servicio.id_servicio}`);
      const imgs = (data.imagenes || [])
        .filter(
          (img) =>
            !img.url_imagen?.includes("default") &&
            !img.url_imagen?.startsWith("img/"),
        )
        .sort((a, b) => new Date(a.fecha_subida) - new Date(b.fecha_subida));
      setImagenesServicio(imgs);
    } catch (err) {
      console.error("Error cargando imágenes:", err);
      setImagenesServicio([]);
    } finally {
      setCargandoImagenes(false);
    }
  };

  const handleSubirImagenesServicio = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Contar solo imágenes reales (excluir default)
    const imagenesReales = imagenesServicio.filter(
      (img) =>
        !img.url_imagen?.includes("default") &&
        !img.url_imagen?.startsWith("img/"),
    );

    if (imagenesReales.length + files.length > 5) {
      mostrarAlerta(
        "advertencia",
        "Límite alcanzado",
        `Máximo 5 imágenes permitidas. Puedes subir ${5 - imagenesReales.length} más.`,
      );
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("imagenes", file));

    try {
      const res = await apiFetch(
        `/api/services/${editandoImagenes.id_servicio}/imagenes`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (res.ok) {
        const { data: servicioData } = await apiFetch(
          `/api/services/${editandoImagenes.id_servicio}`,
        );
        const imgs = (servicioData.imagenes || [])
          .filter(
            (img) =>
              !img.url_imagen?.includes("default") &&
              !img.url_imagen?.startsWith("img/"),
          )
          .sort((a, b) => new Date(a.fecha_subida) - new Date(b.fecha_subida));
        setImagenesServicio(imgs);
        mostrarAlerta(
          "exito",
          "Imágenes subidas",
          "Las imágenes se subieron correctamente.",
        );
      } else {
        mostrarAlerta(
          "error",
          "Error",
          res.data?.error || "No se pudieron subir las imágenes.",
        );
      }
    } catch (err) {
      console.error("Error subiendo imágenes:", err);
      mostrarAlerta(
        "error",
        "Error de conexión",
        "No se pudo conectar con el servidor para subir las imágenes.",
      );
    }

    event.target.value = "";
  };

  const eliminarImagenServicio = async (idImagen) => {
    if (!confirm("¿Eliminar esta imagen?")) return;

    try {
      const { ok } = await apiFetch(
        `/api/services/${editandoImagenes.id_servicio}/imagenes/${idImagen}`,
        {
          method: "DELETE",
        },
      );
      if (ok) {
        setImagenesServicio((prev) =>
          prev.filter((img) => img.id_imagen !== idImagen),
        );
      } else {
        mostrarAlerta("error", "Error", "No se pudo eliminar la imagen.");
      }
    } catch (err) {
      console.error("Error eliminando imagen:", err);
      mostrarAlerta(
        "error",
        "Error de conexión",
        "No se pudo conectar con el servidor para eliminar la imagen.",
      );
    }
  };

  const moverImagen = (index, direccion) => {
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= imagenesServicio.length) return;

    setImagenesServicio((prev) => {
      const nuevo = [...prev];
      [nuevo[index], nuevo[nuevoIndex]] = [nuevo[nuevoIndex], nuevo[index]];
      return nuevo;
    });
  };

  const guardarOrdenImagenes = async () => {
    try {
      for (let i = 0; i < imagenesServicio.length; i++) {
        const img = imagenesServicio[i];
        await apiFetch(
          `/api/services/${editandoImagenes.id_servicio}/imagenes/${img.id_imagen}/orden`,
          {
            method: "PUT",
            body: JSON.stringify({ orden: i, es_principal: i === 0 }),
          },
        );
      }
      mostrarAlerta(
        "exito",
        "Orden guardado",
        "El orden de las imágenes se guardó correctamente.",
      );
      setEditandoImagenes(null);
    } catch (err) {
      console.error("Error guardando orden:", err);
      mostrarAlerta(
        "error",
        "Error",
        "No se pudo guardar el orden de las imágenes.",
      );
    }
  };

  // ════════════════════════════════
  // COMPARTIR PERFIL
  // ════════════════════════════════
  const handleShare = async () => {
    try {
      // Usamos la Web Share API si el navegador la soporta (principalmente móvil)
      if (navigator.share) {
        await navigator.share({
          title: "UniServices - Perfil de " + userData.nombre,
          url: window.location.href,
        });
      } else {
        // Fallback: copiar el enlace al portapapeles en navegadores de escritorio
        await navigator.clipboard.writeText(window.location.href);
        mostrarAlerta(
          "exito",
          "Enlace copiado",
          "¡El enlace de tu perfil se copió al portapapeles!",
        );
      }
    } catch (err) {
      console.error("Error al compartir:", err);
    }
  };

  // ════════════════════════════════
  // SUBIR IMAGEN LOCAL
  // ════════════════════════════════
  const handleSubirImagenLocal = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // FormData permite enviar archivos binarios al servidor (multipart/form-data)
    const formData = new FormData();
    formData.append("file", file); // Debe coincidir con el nombre del parámetro IFormFile en C#
    formData.append("id_usuario", id_usuario_logueado);

    try {
      const response = await apiFetch("/api/usuarios/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (response.ok && response.data?.ok) {
        setUserData((prev) => ({ ...prev, avatar: response.data.avatarUrl }));
        setActiveModal(null);
      } else {
        mostrarAlerta(
          "error",
          "Error al subir",
          response.data?.error || "Error en el servidor.",
        );
      }
    } catch (err) {
      console.error("Error en subida:", err);
      mostrarAlerta(
        "error",
        "Error de conexión",
        "No se pudo conectar con el servidor.",
      );
    }
  };

  // Convierte una fecha ISO en texto legible: "mayo 2024"
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha desconocida";
    try {
      const partes = fecha.split("T")[0].split("-");
      if (partes.length !== 3) return "Fecha desconocida";
      return new Date(
        +partes[0],
        +partes[1] - 1,
        +partes[2],
      ).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Fecha desconocida";
    }
  };

  // Abrevia números grandes para que no rompan el diseño: 1200 → "1.2k"
  const formatearNumero = (num) => {
    if (!num) return 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num;
  };

  // Boolean que indica si el usuario está activo/disponible según la BD
  const estaConectado = userData.estado;

  // Si no hay calificaciones, mostramos un texto en lugar de "0/5.0"
  const reputacionTexto =
    userData.reputacion && userData.reputacion !== "N/A"
      ? parseFloat(userData.reputacion).toFixed(1) + "/5.0"
      : "Sin calificaciones";

  // Maneja la lógica de seguir/dejar de seguir
  // Usa el flag enviandoSeguimiento para bloquear el botón mientras espera respuesta
  const toggleSeguir = async () => {
    if (enviandoSeguimiento) return;
    setEnviandoSeguimiento(true);

    // Guardamos el estado ANTES de llamar al API
    const accionActual = siguiendo;

    try {
      const response = await apiFetch(`/api/seguidores/toggle`, {
        method: "POST",
        body: JSON.stringify({
          id_seguidor: parseInt(id_usuario_logueado),
          id_seguido: parseInt(id_a_consultar),
        }),
      });

      if (response.ok) {
        const ahoraSigue = !accionActual;
        setSiguiendo(ahoraSigue);
        setUserData((prev) => ({
          ...prev,
          total_seguidores: ahoraSigue
            ? (prev.total_seguidores || 0) + 1
            : Math.max(0, (prev.total_seguidores || 0) - 1),
        }));
      } else {
        mostrarAlerta("error", "Error", "No se pudo procesar el seguimiento.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      mostrarAlerta(
        "error",
        "Error de conexión",
        "No se pudo conectar con el servidor para procesar el seguimiento.",
      );
    } finally {
      setEnviandoSeguimiento(false);
    }
  };

  // ════════════════════════════════
  // JSX
  // ════════════════════════════════

  return (
    <>
      <Navbar onCerrarSesion={handleCerrarSesion} />
      <BotonTema />
      <button
        className="btn-reportar-flotante"
        onClick={() => setModalReporteAbierto(true)}
        aria-label="Reportar problema"
        title="Reportar problema"
      >
        <i className="bi bi-bug-fill"></i>
      </button>

      <div className="profile-page-wrapper">
        <div className="dynamic-bg" aria-hidden="true">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
            <div className="shape shape-6"></div>
          </div>
          <div className="floating-glows">
            <div className="glow glow-1"></div>
            <div className="glow glow-2"></div>
            <div className="glow glow-3"></div>
            <div className="glow glow-4"></div>
            <div className="glow glow-5"></div>
          </div>
          <div className="floating-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
          <div className="floating-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
          </div>
          <div className="floating-lines">
            <div className="float-line float-line-1"></div>
            <div className="float-line float-line-2"></div>
            <div className="float-line float-line-3"></div>
          </div>
          <div className="dots-container" aria-hidden="true">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
            <div className="dot dot-4"></div>
            <div className="dot dot-5"></div>
            <div className="dot dot-6"></div>
            <div className="dot dot-7"></div>
            <div className="dot dot-8"></div>
            <div className="dot dot-9"></div>
            <div className="dot dot-10"></div>
            <div className="dot dot-11"></div>
            <div className="dot dot-12"></div>
            <div className="dot dot-13"></div>
            <div className="dot dot-14"></div>
            <div className="dot dot-15"></div>
            <div className="dot dot-16"></div>
            <div className="dot dot-17"></div>
            <div className="dot dot-18"></div>
            <div className="dot dot-19"></div>
            <div className="dot dot-20"></div>
            <div className="dot dot-21"></div>
            <div className="dot dot-22"></div>
            <div className="dot dot-23"></div>
            <div className="dot dot-24"></div>
          </div>
        </div>

        <main id="main-content" className="main-container" role="main">
          <div className="profile-wrapper">
            {/* ══ TARJETA IZQUIERDA ══ */}
            <div className="profile-card">
              <div className="profile-header">
                {/* Avatar — solo es clickeable para cambiar si es el perfil propio */}
                <div
                  className="avatar-wrapper"
                  onClick={() => !esPerfilExterno && setActiveModal("imagen")}
                  style={{ cursor: esPerfilExterno ? "default" : "pointer" }}
                >
                  <div className="avatar-ring"></div>
                  <img
                    src={apiImageUrl(userData.avatar) || "/img/default_avatar.png"}
                    alt={`Avatar de ${userData.nombre || "usuario"}`}
                    className="avatar"
                    loading="eager"
                    fetchpriority="high"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/img/default_avatar.png";
                    }}
                  />
                  {esPerfilExterno && (
                    <div
                      className={`status-badge ${estaConectado ? "online" : "busy"}`}
                    ></div>
                  )}
                </div>
                <h1 className="profile-name">{userData.nombre}</h1>
                <p className="profile-username">
                  @
                  {userData.nombre?.toLowerCase().replace(/\s/g, "") ||
                    "usuario"}
                </p>
              </div>

              <div className="profile-body">
                <p className="profile-bio">{userData.descripcion}</p>

                <div className="stats-grid">
                  <StatItem
                    value={userData.total_publicaciones}
                    label="Publicaciones"
                  />
                  <div
                    onClick={abrirModalSeguidores}
                    style={{ cursor: "pointer" }}
                    title="Ver seguidores"
                  >
                    <StatItem
                      value={formatearNumero(userData.total_seguidores)}
                      label="Seguidores"
                    />
                  </div>
                  <div
                    onClick={abrirModalSiguiendo}
                    style={{ cursor: "pointer" }}
                    title="Ver siguiendo"
                  >
                    <StatItem
                      value={userData.total_siguiendo}
                      label="Siguiendo"
                    />
                  </div>
                </div>

                <div className="action-buttons">
                  {esPerfilExterno ? (
                    <>
                      <button
                        className={`btn-action btn-seguir ${siguiendo ? "btn-siguiendo" : ""}`}
                        onClick={toggleSeguir}
                        disabled={enviandoSeguimiento}
                      >
                        {siguiendo ? (
                          <>
                            <i className="bi bi-check-lg"></i> Siguiendo
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-lg"></i> Seguir
                          </>
                        )}
                      </button>
                      <button
                        className="btn-action btn-chatear"
                        onClick={() => setChatPanelAbierto(true)}
                      >
                        <i className="bi bi-chat-dots-fill"></i> Chatear
                      </button>
                      <button
                        className="btn-action btn-compartir"
                        onClick={handleShare}
                      >
                        <i className="bi bi-link-45deg"></i> Compartir
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-action btn-editar"
                        onClick={() => setActiveModal("info")}
                      >
                        <i className="bi bi-pencil"></i> Editar Perfil
                      </button>
                      <button
                        className="btn-action btn-compartir"
                        onClick={handleShare}
                      >
                        <i className="bi bi-link-45deg"></i> Compartir
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ══ PANEL DERECHO ══ */}
            <div className="right-panel">
              {/* Información del perfil */}
              <section className="menu-section">
                <div className="section-title">
                  <i className="bi bi-clipboard-data"></i> Información
                </div>
                <div className="info-grid">
                  <InfoItem label="Correo" value={userData.correo} />
                  <InfoItem
                    label="Miembro desde"
                    value={formatearFecha(userData.fecha_registro)}
                  />
                  <InfoItem
                    label="Universidad"
                    value={userData.universidad || "Sin universidad"}
                  />
                  {/* La reputación se calcula en el backend promediando las calificaciones recibidas */}
                  <InfoItem label="Reputación" value={reputacionTexto} />
                  <InfoItem
                    label="Teléfono"
                    value={userData.telefono || "No disponible"}
                  />
                  {/* Opciones solo para perfil propio */}
                  {!esPerfilExterno && (
                    <div className="menu-list">
                      <MenuItem
                        icon={<i className="bi bi-shield-lock-fill"></i>}
                        title="Seguridad"
                        desc="Gestiona tu cuenta"
                        onClick={() => setActiveModal("seguridad")}
                      />
                    </div>
                  )}

                  {/* Reportar usuario — visible solo en perfiles externos */}
                  {esPerfilExterno && (
                    <div className="menu-list">
                      <MenuItem
                        icon={
                          <i
                            className="bi bi-flag-fill"
                            style={{ color: "#ff6b6b" }}
                          ></i>
                        }
                        title="Reportar usuario"
                        desc="Acoso, fraude, abuso u otro motivo"
                        onClick={() => setModalReporteAbierto(true)}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* ══ MIS SERVICIOS — Solo visible en el perfil propio ══ */}
              {!esPerfilExterno && (
                <section className="menu-section">
                  <div className="section-title">
                    <i className="bi bi-box-seam-fill"></i> TODOS MIS SERVICIOS
                  </div>
                  <div className="menu-list">
                    <MenuItem
                      icon={<i className="bi bi-box-seam-fill"></i>}
                      title={`Mis servicios (${misServicios.length})`}
                      desc="Administra tus servicios publicados"
                      onClick={() => setModalServicios(true)}
                    />
                  </div>
                </section>
              )}

              {/* ══ MODAL: Confirmar eliminar ══ 
                  Aparece solo cuando confirmEliminar tiene un ID guardado
                  Clic fuera del modal lo cierra sin eliminar nada */}
              {confirmEliminar && (
                <div
                  className="image-menu-overlay active"
                  onClick={() => setConfirmEliminar(null)}
                >
                  <div
                    className="image-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="image-menu-title">
                      <i className="bi bi-trash"></i> Eliminar servicio
                    </h3>
                    <p
                      style={{
                        opacity: 0.7,
                        fontSize: "0.88rem",
                        margin: "0 0 20px",
                      }}
                    >
                      ¿Estás seguro? Esto eliminará también todas las
                      solicitudes asociadas y no se puede deshacer.
                    </p>
                    <div className="image-menu-options">
                      <button
                        className="image-option"
                        onClick={() => setConfirmEliminar(null)}
                      >
                        <span className="image-option-icon">
                          <i className="bi bi-arrow-return-left"></i>
                        </span>
                        <div className="image-option-text">
                          <b>Cancelar</b>
                        </div>
                      </button>
                      <button
                        className="image-option"
                        onClick={confirmarEliminar}
                        style={{ borderColor: "rgba(239,68,68,0.3)" }}
                      >
                        <span className="image-option-icon">
                          <i className="bi bi-trash"></i>
                        </span>
                        <div
                          className="image-option-text"
                          style={{ color: "#f87171" }}
                        >
                          <b>Sí, eliminar</b>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ MODAL: Editar servicio ══
                  e.stopPropagation() evita que el clic dentro del modal cierre el overlay */}
              {editando && (
                <div
                  className="image-menu-overlay active"
                  onClick={() => setEditando(null)}
                >
                  <div
                    className="image-menu"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      maxWidth: "500px",
                      maxHeight: "85vh",
                      overflowY: "auto",
                    }}
                  >
                    <h3 className="image-menu-title">
                      <i className="bi bi-pencil"></i> Editar servicio
                    </h3>

                    {/* Generamos los campos del formulario dinámicamente desde un array */}
                    {[
                      ["Título", "titulo", "text"],
                      ["Precio/hora", "precio_hora", "number"],
                      ["Contacto", "contacto", "text"],
                      ["Ícono", "icono", "text"],
                    ].map(([label, field, type]) => (
                      <div key={field} style={{ marginBottom: "14px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.82rem",
                            opacity: 0.7,
                            marginBottom: "5px",
                          }}
                        >
                          {label}
                        </label>
                        <input
                          type={type}
                          value={editando[field] || ""}
                          onChange={(e) =>
                            setEditando({
                              ...editando,
                              [field]: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            color: "inherit",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                    ))}

                    <div style={{ marginBottom: "14px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.82rem",
                          opacity: 0.7,
                          marginBottom: "5px",
                        }}
                      >
                        Descripción
                      </label>
                      <textarea
                        rows={4}
                        value={editando.descripcion || ""}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            descripcion: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          resize: "vertical",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          color: "inherit",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>

                    <div className="image-menu-options">
                      <button
                        className="image-option"
                        onClick={() => setEditando(null)}
                      >
                        <span className="image-option-icon">
                          <i className="bi bi-arrow-return-left"></i>
                        </span>
                        <div className="image-option-text">
                          <b>Cancelar</b>
                        </div>
                      </button>
                      <button
                        className="image-option"
                        onClick={() => guardarEdicion(editando)}
                      >
                        <span className="image-option-icon">
                          <i className="bi bi-save"></i>
                        </span>
                        <div className="image-option-text">
                          <b>Guardar cambios</b>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ MODAL: Gestionar imágenes del servicio ══ */}
              {editandoImagenes && (
                <div
                  className="image-menu-overlay active"
                  onClick={() => setEditandoImagenes(null)}
                >
                  <div
                    className="image-menu"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      maxWidth: "550px",
                      maxHeight: "85vh",
                      overflowY: "auto",
                    }}
                  >
                    <h3 className="image-menu-title">
                      <i className="bi bi-images"></i> Imágenes de "
                      {editandoImagenes.titulo}"
                    </h3>
                    <p
                      style={{
                        opacity: 0.6,
                        fontSize: "0.85rem",
                        margin: "0 0 16px",
                      }}
                    >
                      {imagenesServicio.length}/5 — Usa ↑↓ para cambiar el
                      orden. La primera es la portada.
                    </p>

                    <input
                      type="file"
                      ref={fileInputRefImagenes}
                      onChange={handleSubirImagenesServicio}
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      style={{ display: "none" }}
                    />

                    {cargandoImagenes ? (
                      <p
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          opacity: 0.6,
                        }}
                      >
                        <i className="bi bi-hourglass-split"></i> Cargando...
                      </p>
                    ) : imagenesServicio.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          opacity: 0.5,
                        }}
                      >
                        No hay imágenes. ¡Agrega una!
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginBottom: "16px",
                        }}
                      >
                        {imagenesServicio.map((img, index) => (
                          <div
                            key={img.id_imagen}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "8px",
                              borderRadius: "8px",
                              background:
                                index === 0
                                  ? "rgba(52, 211, 153, 0.08)"
                                  : "rgba(255,255,255,0.03)",
                              border:
                                index === 0
                                  ? "1px solid rgba(52, 211, 153, 0.3)"
                                  : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {/* Número de orden */}
                            <span
                              style={{
                                minWidth: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background:
                                  index === 0
                                    ? "#34d399"
                                    : "rgba(255,255,255,0.1)",
                                color: index === 0 ? "#000" : "inherit",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}
                            </span>

                            {/* Miniatura */}
                            <img
                              src={img.url_imagen}
                              alt={`Imagen ${index + 1} del servicio ${editandoImagenes?.titulo || "servicio"}`}
                              loading="lazy"
                              decoding="async"
                              style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "6px",
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                e.currentTarget.src = "/img/default_avatar.png";
                              }}
                            />

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: "bold",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {index === 0 && "⭐ Portada"}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.7rem",
                                  opacity: 0.5,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                                onClick={() =>
                                  window.open(img.url_imagen, "_blank")
                                }
                                title="Click para ver imagen"
                              >
                                Click para ver imagen
                              </div>
                            </div>

                            {/* Flechas de orden */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                flexShrink: 0,
                              }}
                            >
                              <button
                                onClick={() => moverImagen(index, -1)}
                                disabled={index === 0}
                                style={{
                                  background: "transparent",
                                  border: "1px solid rgba(255,255,255,0.15)",
                                  color:
                                    index === 0
                                      ? "rgba(255,255,255,0.2)"
                                      : "inherit",
                                  width: "28px",
                                  height: "24px",
                                  borderRadius: "4px",
                                  cursor: index === 0 ? "default" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.7rem",
                                }}
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moverImagen(index, 1)}
                                disabled={index === imagenesServicio.length - 1}
                                style={{
                                  background: "transparent",
                                  border: "1px solid rgba(255,255,255,0.15)",
                                  color:
                                    index === imagenesServicio.length - 1
                                      ? "rgba(255,255,255,0.2)"
                                      : "inherit",
                                  width: "28px",
                                  height: "24px",
                                  borderRadius: "4px",
                                  cursor:
                                    index === imagenesServicio.length - 1
                                      ? "default"
                                      : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.7rem",
                                }}
                              >
                                ↓
                              </button>
                            </div>

                            {/* Eliminar */}
                            <button
                              onClick={() =>
                                eliminarImagenServicio(img.id_imagen)
                              }
                              style={{
                                background: "rgba(239,68,68,0.15)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                color: "#f87171",
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.8rem",
                                flexShrink: 0,
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón agregar más */}
                    {imagenesServicio.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRefImagenes.current?.click()}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "2px dashed rgba(255,255,255,0.15)",
                          background: "transparent",
                          cursor: "pointer",
                          color: "inherit",
                          opacity: 0.6,
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <i className="bi bi-plus-lg"></i> Agregar imágenes
                      </button>
                    )}

                    <div className="image-menu-options">
                      <button
                        className="image-option"
                        onClick={() => setEditandoImagenes(null)}
                      >
                        <span className="image-option-icon">
                          <i className="bi bi-arrow-return-left"></i>
                        </span>
                        <div className="image-option-text">
                          <b>Cancelar</b>
                        </div>
                      </button>
                      <button
                        className="image-option"
                        onClick={guardarOrdenImagenes}
                        disabled={imagenesServicio.length === 0}
                      >
                        <span className="image-option-icon">
                          <i className="bi bi-save"></i>
                        </span>
                        <div className="image-option-text">
                          <b>Guardar orden</b>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ══ MODAL: Mis Servicios ══ */}
        {modalServicios && (
          <div
            className="image-menu-overlay active"
            onClick={() => setModalServicios(false)}
          >
            <div
              className="image-menu"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "624px", width: "90%" }}
            >
              <h3 className="image-menu-title">
                <i className="bi bi-box-seam-fill"></i> Mis servicios ({misServicios.length})
              </h3>

              {misServicios.length === 0 ? (
                <p style={{ opacity: 0.5, fontSize: "0.85rem", padding: "12px 0" }}>
                  Aún no has publicado ningún servicio.
                </p>
              ) : (
                <div className="menu-list" style={{ marginTop: "8px" }}>
                  {misServicios.map((s) => (
                    <div
                      key={s.id_servicio}
                      className="menu-item"
                      style={{ cursor: "default", display: "flex", alignItems: "center", padding: "10px" }}
                    >
                      <div className="menu-icon">
                        <i className={`bi ${s.icono?.startsWith("bi-") ? s.icono : "bi-pin"}`}></i>
                      </div>
                      <div className="menu-text" style={{ flex: 1, minWidth: 0, marginLeft: "10px" }}>
                        <div className="menu-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "bold" }}>
                          {s.titulo}
                        </div>
                        <div className="menu-desc" style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                          ${s.precio_hora}/hr · {s.nombre_categoria || "Sin categoría"}
                        </div>
                      </div>
                      <div className="servicio-actions">
                        <button className="btn btn-primary" style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", padding: 0, margin: 0, lineHeight: 1, background: "transparent", borderColor: "rgba(52, 211, 153, 0.4)", color: "#34d399" }}
                          onClick={() => abrirEditorImagenes(s)} title="Gestionar imágenes">
                          <i className="bi bi-images"></i>
                        </button>
                        <button className="btn btn-primary" style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", padding: 0, margin: 0, lineHeight: 1 }}
                          onClick={() => setEditando({ ...s })}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-primary" style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", padding: 0, margin: 0, lineHeight: 1, background: "transparent", borderColor: "rgba(177, 52, 52, 0.4)", color: "#f87171" }}
                          onClick={() => setConfirmEliminar(s.id_servicio)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ MODAL: Editar información del perfil (solo perfil propio) ══ */}
        {activeModal === "info" && (
          <div
            className="image-menu-overlay active"
            onClick={() => setActiveModal(null)}
          >
            <div className="image-menu" onClick={(e) => e.stopPropagation()}>
              <h3 className="image-menu-title">
                <i className="bi bi-pencil"></i> Editar Perfil
              </h3>
              <div className="image-menu-options">
                {/* Cada botón usa prompt() para pedir el nuevo valor y llama a handleUpdate */}

                <button
                  className="image-option"
                  onClick={() => {
                    const n = prompt("Nuevo nombre:", userData.nombre);
                    if (n) handleUpdate("nombre", n);
                  }}
                >
                  <span className="image-option-icon">
                    <i className="bi bi-pencil"></i>
                  </span>
                  <div className="image-option-text">
                    <b>Cambiar Nombre</b>
                  </div>
                </button>

                <button
                  className="image-option"
                  onClick={() => {
                    const d = prompt(
                      "Nueva descripción:",
                      userData.descripcion,
                    );
                    if (d) handleUpdate("descripcion", d);
                  }}
                >
                  <span className="image-option-icon">
                    <i className="bi bi-book"></i>
                  </span>
                  <div className="image-option-text">
                    <b>Cambiar Descripción</b>
                  </div>
                </button>

                <button
                  className="image-option"
                  onClick={() => {
                    const e = prompt(
                      "Nueva universidad:",
                      userData.universidad,
                    );
                    if (e) handleUpdate("universidad", e);
                  }}
                >
                  <span className="image-option-icon">
                    <i className="bi bi-buildings"></i>
                  </span>
                  <div className="image-option-text">
                    <b>Cambiar Universidad</b>
                  </div>
                </button>

                <button
                  className="image-option"
                  onClick={() => {
                    const u = prompt(
                      "Nuevo número de teléfono:",
                      userData.telefono,
                    );
                    if (u) handleUpdate("telefono", u);
                  }}
                >
                  <span className="image-option-icon">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <div className="image-option-text">
                    <b>Cambiar Teléfono</b>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ MODAL: Cambiar avatar (solo perfil propio) ══ 
            Dos opciones: URL externa o archivo local desde el dispositivo */}
        {activeModal === "imagen" && (
          <div
            className="image-menu-overlay active"
            onClick={() => setActiveModal(null)}
          >
            <div className="image-menu" onClick={(e) => e.stopPropagation()}>
              <h3 className="image-menu-title">📸 Cambiar Avatar</h3>
              {/* Input oculto: se activa programáticamente con FileInputRef.current.click() */}
              <input
                type="file"
                ref={FileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleSubirImagenLocal}
              />
              <div className="image-menu-options">
                <button
                  className="image-option"
                  onClick={() => {
                    const url = prompt("URL de la imagen:");
                    if (url) handleUpdate("avatar", url);
                  }}
                >
                  <span className="image-option-icon">
                    <i className="bi bi-globe2"></i>
                  </span>
                  <div className="image-option-text">
                    <b>Usar URL</b>
                  </div>
                </button>
                <button
                  className="image-option"
                  onClick={() => FileInputRef.current?.click()}
                >
                  <span className="image-option-icon">
                    <i className="bi bi-folder"></i>
                  </span>
                  <div className="image-option-text">
                    <b>Subir Imagen</b>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ MODAL: Seguridad (solo perfil propio) ══ */}
        {activeModal === "seguridad" && (
          <div
            className="image-menu-overlay active"
            onClick={() => {
              setActiveModal(null);
              resetSeguridadForms();
            }}
          >
            <div className="image-menu" onClick={(e) => e.stopPropagation()}>
              <h3 className="image-menu-title">
                <i className="bi bi-shield-lock-fill"></i> Seguridad de la Cuenta
              </h3>

              {!seguridadSubPaso && (
                <div className="image-menu-options">
                  <button
                    className="image-option"
                    onClick={() => setSeguridadSubPaso("password")}
                  >
                    <span className="image-option-icon">
                      <i className="bi bi-key-fill"></i>
                    </span>
                    <div className="image-option-text">
                      <b>Cambiar Contraseña</b>
                    </div>
                  </button>
                  <button
                    className="image-option"
                    onClick={() => setSeguridadSubPaso("correo")}
                  >
                    <span className="image-option-icon">
                      <i className="bi bi-envelope-fill"></i>
                    </span>
                    <div className="image-option-text">
                      <b>Cambiar Correo Electrónico</b>
                    </div>
                  </button>
                </div>
              )}

              {seguridadSubPaso === "password" && (
                <div className="image-menu-options" style={{ padding: "8px 0" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", opacity: 0.8 }}>
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      value={formPassword.actual}
                      onChange={(e) => setFormPassword((p) => ({ ...p, actual: e.target.value }))}
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "inherit",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", opacity: 0.8 }}>
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={formPassword.nueva}
                      onChange={(e) => setFormPassword((p) => ({ ...p, nueva: e.target.value }))}
                      placeholder="Mínimo 8 caracteres"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "inherit",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", opacity: 0.8 }}>
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={formPassword.confirmar}
                      onChange={(e) => setFormPassword((p) => ({ ...p, confirmar: e.target.value }))}
                      placeholder="Repite la nueva contraseña"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "inherit",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="image-option"
                      onClick={() => setSeguridadSubPaso(null)}
                      disabled={seguridadCargando}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <span className="image-option-icon">
                        <i className="bi bi-arrow-left"></i>
                      </span>
                      <div className="image-option-text">
                        <b>Volver</b>
                      </div>
                    </button>
                    <button
                      className="image-option"
                      onClick={handleCambiarPassword}
                      disabled={seguridadCargando}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <span className="image-option-icon">
                        <i className="bi bi-check-lg"></i>
                      </span>
                      <div className="image-option-text">
                        <b>{seguridadCargando ? "Guardando..." : "Guardar"}</b>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {seguridadSubPaso === "correo" && (
                <div className="image-menu-options" style={{ padding: "8px 0" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", opacity: 0.8 }}>
                      Nuevo correo electrónico
                    </label>
                    <input
                      type="email"
                      value={formCorreo.nuevoCorreo}
                      onChange={(e) => setFormCorreo((c) => ({ ...c, nuevoCorreo: e.target.value }))}
                      placeholder="nuevo@correo.com"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "inherit",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", opacity: 0.8 }}>
                      Contraseña actual (para confirmar)
                    </label>
                    <input
                      type="password"
                      value={formCorreo.password}
                      onChange={(e) => setFormCorreo((c) => ({ ...c, password: e.target.value }))}
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "inherit",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="image-option"
                      onClick={() => setSeguridadSubPaso(null)}
                      disabled={seguridadCargando}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <span className="image-option-icon">
                        <i className="bi bi-arrow-left"></i>
                      </span>
                      <div className="image-option-text">
                        <b>Volver</b>
                      </div>
                    </button>
                    <button
                      className="image-option"
                      onClick={handleCambiarCorreo}
                      disabled={seguridadCargando}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <span className="image-option-icon">
                        <i className="bi bi-check-lg"></i>
                      </span>
                      <div className="image-option-text">
                        <b>{seguridadCargando ? "Guardando..." : "Guardar"}</b>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ MODAL: Lista de seguidores ══ */}
        {modalSeguidores && (
          <div
            className="image-menu-overlay active"
            onClick={() => setModalSeguidores(false)}
          >
            <div
              className="image-menu"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "420px", width: "90%" }}
            >
              <h3 className="image-menu-title">
                <i className="bi bi-people-fill"></i> Seguidores (
                {listaSeguidores.length})
              </h3>

              {/* Cuerpo */}
              <div
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {cargandoSeguidores ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "1.5rem",
                      opacity: 0.6,
                    }}
                  >
                    <i className="bi bi-hourglass-split"></i> Cargando...
                  </p>
                ) : listaSeguidores.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "1.5rem",
                      opacity: 0.5,
                      fontSize: "0.9rem",
                    }}
                  >
                    Aún no tienes seguidores.
                  </p>
                ) : (
                  listaSeguidores.map((seguidor) => (
                    <div
                      key={seguidor.id_usuario}
                      className="menu-item"
                      onClick={() => {
                        setModalSeguidores(false);
                        navigate(`/perfil/${seguidor.id_usuario}`);
                      }}
                      style={{
                        cursor: "pointer",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      {/* Avatar */}
                      <img
                        src={getAvatarUrl(seguidor.avatar)}
                        alt={`Avatar de ${seguidor.nombre}`}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // evita bucle infinito
                          e.currentTarget.src = "/img/default_avatar.png";
                        }}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid rgba(255,255,255,0.15)",
                          flexShrink: 0,
                        }}
                      />
                      {/* Nombre y universidad */}
                      <div className="menu-text">
                        <div className="menu-title">{seguidor.nombre}</div>
                        <div className="menu-desc">
                          <i
                            className="bi bi-buildings"
                            style={{ marginRight: "4px" }}
                          ></i>
                          {seguidor.universidad || "Sin universidad"}
                        </div>
                      </div>
                      {/* Flecha */}
                      <span className="menu-arrow">→</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ MODAL: Lista de siguiendo ══ */}
        {modalSiguiendo && (
          <div
            className="image-menu-overlay active"
            onClick={() => setModalSiguiendo(false)}
          >
            <div
              className="image-menu"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "420px", width: "90%" }}
            >
              <h3 className="image-menu-title">
                <i className="bi bi-person-check-fill"></i> Siguiendo (
                {listaSiguiendo.length})
              </h3>

              {/* Cuerpo */}
              <div
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {cargandoSiguiendo ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "1.5rem",
                      opacity: 0.6,
                    }}
                  >
                    <i className="bi bi-hourglass-split"></i> Cargando...
                  </p>
                ) : listaSiguiendo.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "1.5rem",
                      opacity: 0.5,
                      fontSize: "0.9rem",
                    }}
                  >
                    Aún no sigues a nadie.
                  </p>
                ) : (
                  listaSiguiendo.map((usuario) => (
                    <div
                      key={usuario.id_usuario}
                      className="menu-item"
                      onClick={() => {
                        setModalSiguiendo(false);
                        navigate(`/perfil/${usuario.id_usuario}`);
                      }}
                      style={{
                        cursor: "pointer",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      {/* Avatar */}
                      <img
                        src={getAvatarUrl(usuario.avatar)}
                        alt={`Avatar de ${usuario.nombre}`}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // evita bucle infinito
                          e.currentTarget.src = "/img/default_avatar.png";
                        }}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid rgba(255,255,255,0.15)",
                          flexShrink: 0,
                        }}
                      />
                      {/* Nombre y universidad */}
                      <div className="menu-text">
                        <div className="menu-title">{usuario.nombre}</div>
                        <div className="menu-desc">
                          <i
                            className="bi bi-buildings"
                            style={{ marginRight: "4px" }}
                          ></i>
                          {usuario.universidad || "Sin universidad"}
                        </div>
                      </div>
                      {/* Flecha */}
                      <span className="menu-arrow">→</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        show={modalAlerta.show}
        onClose={() => setModalAlerta({ ...modalAlerta, show: false })}
        type={modalAlerta.type}
        title={modalAlerta.title}
        message={modalAlerta.message}
      />

      <ChatPanel
        abierto={chatPanelAbierto}
        onCerrar={() => setChatPanelAbierto(false)}
        targetUsuario={{
          id: parseInt(id_a_consultar),
          nombre: userData.nombre,
          avatar: userData.avatar || "",
        }}
      />
      {/* ══ MODAL: Enviar Reporte ══ */}
      {modalReporteAbierto && (
        <ModalReporte
          onClose={() => setModalReporteAbierto(false)}
          contexto={esPerfilExterno ? "usuario" : "pagina"}
          idUsuarioReportado={esPerfilExterno ? parseInt(id_a_consultar) : null}
        />
      )}
    </>
  );
};
export default Perfil;
