import { useState, useEffect } from "react";
import "../styles/styleLogin.css";
import { useNavigate } from "react-router-dom";
import logoIcon from "../img/logo_color_noBG.png";
import AdminModal from "./Login/ModalAdmin";
import ResetPasswordModal from "./Login/ModalRecuperarClave";
import VerificationCodeModal from "./Login/ModalVerificarCodigo";
import NotificationModal from "./Login/ModalNotificacion";
import BotonTema from "../Components/B_StyleHome";

// ══════════════════════════════════════════════════════════════════
// CREDENCIALES DE ADMINISTRADOR HARDCODEADAS
// Estas credenciales permiten acceso directo al panel de admin
// sin pasar por la base de datos. Solo para propósitos de prueba.
// IMPORTANTE: En producción deben eliminarse y manejarse desde el backend.
// Formato: { correo: "...", password: "..." }
// ══════════════════════════════════════════════════════════════════
const ADMIN_CREDENTIALS = [
  { correo: "admin@uniservice.co", password: "admin123" },
  { correo: "frank@uniservice.co", password: "frank2026" },
  { correo: "lenin@uniservice.co", password: "lenin2026" },
  { correo: "sayd@uniservice.co", password: "sayd2026" },
  { correo: "andres@uniservice.co", password: "andres2026" },
];

// Contraseña maestra adicional que se pide en el modal de confirmación de admin.
// Es un segundo factor de seguridad antes de entrar al panel de administración.
const ADMIN_MASTER_PASSWORD = "admin_2026";

export default function Login() {
  // Hook de React Router para redirigir al usuario entre páginas
  const navigate = useNavigate();

  // ════════════════════════════════
  // ESTADOS DEL FORMULARIO DE LOGIN
  // Guardan lo que el usuario escribe en los campos de inicio de sesión
  // ════════════════════════════════
  const [correo, setCorreo] = useState(""); // Campo correo del login
  const [pass, setPass] = useState(""); // Campo contraseña del login

  // ════════════════════════════════
  // ESTADOS DEL FORMULARIO DE REGISTRO
  // Guardan los datos del formulario de crear cuenta nueva
  // ════════════════════════════════
  const [nombre, setNombre] = useState("");
  const [correoReg, setCorreoReg] = useState("");
  const [passReg, setPassReg] = useState("");
  const [passReg2, setPassReg2] = useState("");
  const [terminos, setTerminos] = useState(false);

  // ════════════════════════════════
  // ESTADOS DEL FLUJO DE VERIFICACIÓN DE CORREO
  // Controlan el proceso de envío y validación del código de 6 dígitos
  // que se envía al correo antes de poder registrarse
  // ════════════════════════════════
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");
  const [correoVerificado, setCorreoVerificado] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);

  // ════════════════════════════════
  // ESTADOS DEL FLUJO "OLVIDÉ MI CONTRASEÑA"
  // Manejan los 3 pasos del proceso de recuperación:
  //   1. "correo"  → el usuario ingresa su correo
  //   2. "codigo"  → el usuario ingresa el código recibido
  //   3. "nueva"   → el usuario escribe su nueva contraseña
  // ════════════════════════════════
  const [resetPaso, setResetPaso] = useState(null); // Paso actual del flujo (null = modal cerrado)
  const [resetCorreo, setResetCorreo] = useState(""); // Correo ingresado para recuperar
  const [resetCodigo, setResetCodigo] = useState(""); // Código de verificación recibido
  const [resetPass, setResetPass] = useState(""); // Nueva contraseña
  const [resetPass2, setResetPass2] = useState(""); // Confirmación de nueva contraseña
  const [resetCargando, setResetCargando] = useState(false); // Deshabilita botones mientras espera la API

  // ════════════════════════════════
  // ESTADOS DEL MODAL DE ACCESO ADMIN
  // Controlan el comportamiento del modal que aparece cuando
  // se detecta que el usuario es administrador
  // ════════════════════════════════
  const [modalAdmin, setModalAdmin] = useState(false); // Si el modal está visible
  const [adminMasterInput, setAdminMasterInput] = useState(""); // Contraseña maestra que escribe el admin
  const [adminIntentos, setAdminIntentos] = useState(3); // Contador de intentos fallidos (máx 3)
  const [adminBloqueado, setAdminBloqueado] = useState(false); // Si se bloqueó por demasiados intentos
  const [adminError, setAdminError] = useState(""); // Mensaje de error dentro del modal
  const [adminLoginData, setAdminLoginData] = useState(null); // Datos del usuario admin (reservado para uso futuro)
  const [adminShake, setAdminShake] = useState(false); // Activa animación de "shake" cuando falla

  // ════════════════════════════════
  // ESTADOS GENERALES DE UI
  // ════════════════════════════════
  const [errores, setErrores] = useState({}); // Objeto con mensajes de error por campo (ej: { correo: "Inválido" })
  const [modal, setModal] = useState({
    // Modal genérico para mostrar mensajes al usuario
    visible: false,
    mensaje: "",
    tipo: "error", // Puede ser "error", "success" o "info"
  });

  // Función helper para mostrar el modal de notificación con un mensaje y tipo dados
  const notificar = (mensaje, tipo = "error") =>
    setModal({ visible: true, mensaje, tipo });

  // ════════════════════════════════
  // VALIDACIONES DE CAMPOS
  // Cada función valida un campo específico en tiempo real mientras el usuario escribe.
  // Actualiza el estado del campo Y el objeto de errores al mismo tiempo.
  // ════════════════════════════════

  // Valida que el correo tenga formato válido (algo@algo.algo)
  // El parámetro "tipo" diferencia si es el campo del login o el del registro
  const validarCorreo = (email, tipo = "login") => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const esValido = regex.test(email);
    if (tipo === "login") {
      setCorreo(email);
      setErrores((prev) => ({
        ...prev,
        correo: esValido ? "" : "Correo inválido",
      }));
    } else {
      setCorreoReg(email);
      setErrores((prev) => ({
        ...prev,
        correoReg: esValido ? "" : "Correo inválido",
      }));
    }
  };

  // Valida que la contraseña del login tenga al menos 8 caracteres
  const validarPassLogin = (value) => {
    setPass(value);
    setErrores((prev) => ({
      ...prev,
      pass: value.length < 8 ? "Mínimo 8 caracteres" : "",
    }));
  };

  // Valida el nombre: mínimo 3 caracteres, máximo 50
  const validarNombre = (value) => {
    setNombre(value);
    if (value.trim().length < 3)
      setErrores((prev) => ({ ...prev, nombre: "Mínimo 3 caracteres" }));
    else if (value.length > 50)
      setErrores((prev) => ({ ...prev, nombre: "Nombre muy largo" }));
    else setErrores((prev) => ({ ...prev, nombre: "" }));
  };

  // Valida la contraseña del registro. También re-valida la confirmación
  // si ya tiene algo escrito, para que el error de "no coinciden" se actualice
  const validarPassReg = (value) => {
    setPassReg(value);
    setErrores((prev) => ({
      ...prev,
      passReg: value.length < 8 ? "Mínimo 8 caracteres" : "",
      ...(passReg2 && {
        passReg2: value !== passReg2 ? "Las contraseñas no coinciden" : "",
      }),
    }));
  };

  // Valida la confirmación de contraseña comparándola con la original
  const validarPassReg2 = (value) => {
    setPassReg2(value);
    if (value.length < 8)
      setErrores((prev) => ({ ...prev, passReg2: "Mínimo 8 caracteres" }));
    else if (value !== passReg)
      setErrores((prev) => ({
        ...prev,
        passReg2: "Las contraseñas no coinciden",
      }));
    else setErrores((prev) => ({ ...prev, passReg2: "" }));
  };

  // ════════════════════════════════
  // VERIFICACIÓN DE CORREO (REGISTRO)
  // Llama a la API para enviar el código de 6 dígitos al correo del usuario.
  // El backend genera el código, lo guarda temporalmente (5 min) y lo envía por email.
  // ════════════════════════════════
  const handleEnviarCodigo = async () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoReg || !regex.test(correoReg)) {
      notificar("Ingresa un correo válido primero");
      return;
    }
    setEnviandoCodigo(true); // Cambia el botón a "Enviando..."
    try {
      const res = await fetch("https://localhost:7237/api/Auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoReg }),
      });
      if (res.ok) {
        setCodigoEnviado(true);
        setMostrarModalCodigo(true); // Abre el modal para que el usuario ingrese el código
      } else {
        notificar("Error al enviar el código");
      }
    } catch {
      notificar("Error de conexión");
    } finally {
      setEnviandoCodigo(false); // Restaura el botón sin importar si fue exitoso o no
    }
  };

  // Envía el código que escribió el usuario a la API para verificarlo.
  // Si es correcto, marca el correo como verificado y cierra el modal.
  const handleVerificarCodigo = async () => {
    if (codigoInput.length !== 6) {
      notificar("El código debe tener 6 dígitos");
      return;
    }
    try {
      const res = await fetch("https://localhost:7237/api/Auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoReg, codigo: codigoInput }),
      });
      const data = await res.json();
      if (data.valido) {
        setCorreoVerificado(true); // Habilita el botón de crear cuenta
        setMostrarModalCodigo(false); // Cierra el modal del código
        notificar("Correo verificado con éxito", "success");
      } else {
        notificar("Código incorrecto, intenta de nuevo");
      }
    } catch {
      notificar("Error en la verificación");
    }
  };

  // ════════════════════════════════
  // FLUJO "OLVIDÉ MI CONTRASEÑA"
  // Son 3 pasos: enviar código → verificar código → guardar nueva contraseña
  // ════════════════════════════════

  // PASO 1: Pide al backend que envíe un código de recuperación al correo ingresado
  const handleResetEnviarCodigo = async () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetCorreo || !regex.test(resetCorreo)) {
      notificar("Ingresa un correo válido");
      return;
    }
    setResetCargando(true);
    try {
      const res = await fetch(
        "https://localhost:7237/api/Auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: resetCorreo }),
        },
      );
      if (res.ok) {
        setResetPaso("codigo"); // Avanza al paso 2: ingresar el código
      } else {
        notificar("Error al enviar el código");
      }
    } catch {
      notificar("Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // Permite reenviar el código si el usuario no lo recibió o expiró
  const handleResetReenviarCodigo = async () => {
    setResetCargando(true);
    try {
      await fetch("https://localhost:7237/api/Auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: resetCorreo }),
      });
      notificar("Código reenviado", "success");
    } catch {
      notificar("Error al reenviar");
    } finally {
      setResetCargando(false);
    }
  };

  // PASO 2: Verifica que el código de recuperación ingresado sea correcto
  const handleResetVerificarCodigo = async () => {
    if (resetCodigo.length !== 6) {
      notificar("El código debe tener 6 dígitos");
      return;
    }
    setResetCargando(true);
    try {
      const res = await fetch("https://localhost:7237/api/Auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: resetCorreo, codigo: resetCodigo }),
      });
      const data = await res.json();
      if (data.valido) {
        setResetPaso("nueva"); // Avanza al paso 3: escribir la nueva contraseña
      } else {
        notificar("Código incorrecto o expirado");
      }
    } catch {
      notificar("Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // PASO 3: Envía la nueva contraseña al backend para guardarla en la base de datos
  const handleResetGuardar = async () => {
    if (resetPass.length < 8) {
      notificar("La contraseña debe tener mínimo 8 caracteres");
      return;
    }
    if (resetPass !== resetPass2) {
      notificar("Las contraseñas no coinciden");
      return;
    }
    setResetCargando(true);
    try {
      const res = await fetch(
        "https://localhost:7237/api/Auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: resetCorreo,
            codigo: resetCodigo,
            nuevaPassword: resetPass,
          }),
        },
      );
      const data = await res.json();
      if (data.ok) {
        notificar(
          "Contraseña cambiada correctamente. Ya puedes iniciar sesión.",
          "success",
        );
        // Limpia todos los estados del flujo de recuperación y cierra el modal
        setResetPaso(null);
        setResetCorreo("");
        setResetCodigo("");
        setResetPass("");
        setResetPass2("");
      } else {
        notificar(data.error || "Error al cambiar contraseña");
      }
    } catch {
      notificar("Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // Cierra el modal de recuperación y limpia todos sus campos
  const cerrarModalReset = () => {
    setResetPaso(null);
    setResetCorreo("");
    setResetCodigo("");
    setResetPass("");
    setResetPass2("");
  };

  // ════════════════════════════════
  // MODAL DE ACCESO ADMIN
  // Segundo factor de seguridad: aunque el login detecte un admin,
  // debe ingresar la contraseña maestra para entrar al panel.
  // Tiene un límite de 3 intentos antes de bloquearse.
  // ════════════════════════════════

  // Cierra el modal y resetea todos sus estados a valores iniciales
  const cerrarModalAdmin = () => {
    setModalAdmin(false);
    setAdminMasterInput("");
    setAdminError("");
    setAdminIntentos(0);
    setAdminBloqueado(false);
  };

  // Valida la contraseña maestra. Si es correcta redirige al dashboard.
  // Si es incorrecta, incrementa el contador. Al llegar a 3 bloquea el acceso.
  const handleAdminConfirmar = () => {
    if (adminBloqueado) return; // No hace nada si ya está bloqueado

    if (adminMasterInput === ADMIN_MASTER_PASSWORD) {
      notificar("Acceso concedido, Comandante", "success");
      setModalAdmin(false);

      // Guarda en localStorage que el usuario está logueado como admin
      localStorage.setItem("logueado", "true");
      localStorage.setItem("usuarioRol", "1");

      // Espera 1 segundo para que el usuario vea el mensaje de éxito antes de redirigir
      setTimeout(() => {
        navigate("/admin-dashboard", { replace: true });
      }, 1000);
    } else {
      const nuevosIntentos = adminIntentos + 1;
      setAdminIntentos(nuevosIntentos);

      // Activa la animación de shake (temblor) en el modal para indicar error
      setAdminShake(true);
      setTimeout(() => setAdminShake(false), 500);

      if (nuevosIntentos >= 3) {
        setAdminBloqueado(true); // Bloquea el formulario definitivamente
        setAdminError("DEMASIADOS INTENTOS FALLIDOS. ACCESO DENEGADO.");
      } else {
        setAdminError(`Contraseña incorrecta. Intento ${nuevosIntentos} de 3.`);
      }
    }
  };

  // ════════════════════════════════
  // LÓGICA DE LOGIN
  // Tiene dos caminos:
  //   1. Si el correo/pass coinciden con ADMIN_CREDENTIALS → abre el modal admin (sin ir al backend)
  //   2. Si no → llama al backend C# para autenticar normalmente
  // ════════════════════════════════
  const handleLogin = async () => {
    // Validaciones básicas antes de llamar a la API
    if (!correo || errores.correo) {
      notificar("Ingresa un correo válido");
      return;
    }
    if (pass.length < 8) {
      notificar("Mínimo 8 caracteres");
      return;
    }

    // BYPASS ADMIN: Busca si las credenciales coinciden con algún admin hardcodeado.
    // Si encuentra coincidencia, no va al backend: abre el modal directamente.
    const adminEncontrado = ADMIN_CREDENTIALS.find(
      (a) => a.correo === correo && a.password === pass,
    );

    if (adminEncontrado) {
      localStorage.setItem("usuario", adminEncontrado.correo.split("@")[0]);
      localStorage.setItem("usuarioRol", 1);
      setModalAdmin(true);
      notificar("Cuenta de administrador detectada", "info");
      return; // Detiene la función aquí, no llega al fetch del backend
    }

    // FLUJO NORMAL: Si no es un admin hardcodeado, autentica contra la base de datos
    try {
      const res = await fetch("http://localhost:5165/api/Users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password: pass }),
      });
      const data = await res.json();

      if (data.token) {
        // Guarda el token JWT y los datos del usuario en localStorage para mantener la sesión
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuarioId", data.user.id);
        localStorage.setItem("usuarioNombre", data.user.nombre || data.user.correo.split("@")[0]);
        localStorage.setItem("usuarioRol", data.user.id_rol);
        localStorage.setItem("logueado", "true");

        // Si el backend indica que es admin (rol 1), abre el modal de verificación
        // Si es usuario normal (rol 2), redirige directo al home
        if (data.user.id_rol === 1) {
          setModalAdmin(true);
        } else {
          navigate("/home", { replace: true });
        }
      } else {
        notificar(data.message || "Credenciales incorrectas");
      }
    } catch {
      notificar("Error de conexión con el servidor");
    }
  };

  // ════════════════════════════════
  // LÓGICA DE REGISTRO
  // Crea una cuenta nueva en el backend. Requiere que el correo
  // haya sido verificado previamente con el código de 6 dígitos.
  // ════════════════════════════════
  const handleRegister = async () => {
    // No permite registrar si el correo no fue verificado con el código
    if (!correoVerificado) {
      notificar("Debes verificar tu correo primero");
      return;
    }
    // Validación completa del formulario antes de enviar
    if (
      passReg.length < 8 ||
      passReg !== passReg2 ||
      nombre.trim().length < 3 ||
      !terminos
    ) {
      notificar("Revisa los campos del formulario");
      return;
    }
    try {
      const res = await fetch("https://localhost:7237/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correoReg,
          password: passReg,
          nombre: nombre.trim(),
          codigo: codigoInput, // El backend valida que el código siga siendo válido
        }),
      });
      const data = await res.json();
      if (data.error) {
        notificar(data.error);
      } else {
        notificar("Cuenta creada, ya puedes iniciar sesión", "success");
        // Limpia todos los campos del formulario de registro después de crear la cuenta
        setNombre("");
        setCorreoReg("");
        setPassReg("");
        setPassReg2("");
        setTerminos(false);
        setErrores({});
        setCorreoVerificado(false);
        setCodigoEnviado(false);
        setCodigoInput("");
      }
    } catch {
      notificar("Error de conexión");
    }
  };

  // ════════════════════════════════
  // EFECTO DE CLASE CSS EN EL BODY
  // Añade la clase "login-page" al body mientras esta página está montada.
  // Esto permite aplicar estilos globales específicos solo para la página de login
  // (como fondo diferente). Se elimina automáticamente al salir de la página.
  // ════════════════════════════════
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page"); // Limpieza al desmontar
  }, []);

  // ════════════════════════════════
  // RENDERIZADO (JSX)
  // La estructura visual usa dos radios ocultos (#r-login y #r-reg)
  // para controlar qué panel (login o registro) se muestra,
  // usando solo CSS sin necesidad de estado de React para el tab activo.
  // ════════════════════════════════
  return (
    <>
      <BotonTema />
      {/* Radios ocultos que controlan qué tab está activa mediante CSS puro */}
      <input
        type="radio"
        className="tab-radio"
        name="tab"
        id="r-login"
        defaultChecked
      />
      <input type="radio" className="tab-radio" name="tab" id="r-reg" />

      <div className="auth-wrapper">
        <div className="auth-box">
          {/* ── COLUMNA IZQUIERDA: Logo y descripción de la plataforma ── */}
          <div className="auth-lateral">
            <div className="lateral-contenido">
              <div className="lateral-icono">
                <img
                  src={logoIcon}
                  alt="UniServices Logo"
                  className="lateral-icono-img"
                />
              </div>
              <h2 className="lateral-titulo">
                Uni<span className="lateral-titulo-service">Service</span>
              </h2>
              <p className="lateral-desc">
                Intercambia tutorías, proyectos, diseño y más con otros
                estudiantes universitarios.
              </p>
              {/* Chips decorativos que muestran las categorías disponibles */}
              <div className="lateral-chips">
                {[
                  ["bi-book", "Tutorías"],
                  ["bi-code-slash", "Programación"],
                  ["bi-pencil", "Ensayos"],
                  ["bi-palette", "Diseño"],
                  ["bi-box", "Productos"],
                  ["bi-house", "Arriendo"],
                ].map(([icono, texto]) => (
                  <span key={texto} className="lateral-chip">
                    <i className={`bi ${icono}`}></i> {texto}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA: Formularios de login y registro ── */}
          <div className="auth-formulario">
            <div className="auth-logo">
              <p className="auth-pretitle">Bienvenido 👋</p>
              <h1 className="auth-title">
                Accede a la <span>plataforma</span>
              </h1>
              <p className="auth-subtitle">
                Convierte tu conocimiento en oportunidades y encuentra ayuda
                cuando la necesites.
              </p>
            </div>

            {/* Tabs que alternan entre "Iniciar sesión" y "Registrarse" usando CSS */}
            <div className="tabs">
              <label className="tab" htmlFor="r-login">
                Iniciar sesión
              </label>
              <label className="tab" htmlFor="r-reg">
                Registrarse
              </label>
            </div>

            {/* ── PANEL LOGIN ── */}
            <div className="form-panel" id="panel-login">
              {/* Campo de correo con validación en tiempo real */}
              <div className="campo">
                <label className="campo-label">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={correo}
                  onChange={(e) => validarCorreo(e.target.value, "login")}
                />
                {errores.correo && (
                  <span className="error-msg">{errores.correo}</span>
                )}
              </div>

              {/* Campo de contraseña con validación de longitud mínima */}
              <div className="campo">
                <label className="campo-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Tu contraseña"
                  value={pass}
                  onChange={(e) => validarPassLogin(e.target.value)}
                />
                {errores.pass && (
                  <span className="error-msg">{errores.pass}</span>
                )}
              </div>

              {/* Botón que abre el flujo de recuperación de contraseña */}
              <div className="olvide">
                <button
                  type="button"
                  className="btn-olvide"
                  onClick={() => setResetPaso("correo")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="botones-login">
                <button
                  className="btn-principal"
                  type="button"
                  onClick={handleLogin}
                >
                  Entrar →
                </button>
                {/* Permite explorar la app sin cuenta */}
                <button
                  className="btn-secundario"
                  onClick={() => navigate("/home-guest")}
                >
                  Entrar como invitado
                </button>
              </div>

              <p className="pie">
                ¿No tienes cuenta?{" "}
                <label className="pie-link" htmlFor="r-reg">
                  Regístrate gratis
                </label>
              </p>
            </div>

            {/* ── PANEL REGISTRO ── */}
            <div className="form-panel" id="panel-reg">
              {/* Campo nombre con validación de longitud */}
              <div className="campo">
                <label className="campo-label">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={nombre}
                  onChange={(e) => validarNombre(e.target.value)}
                />
                {errores.nombre && (
                  <span className="error-msg">{errores.nombre}</span>
                )}
              </div>

              {/* Campo correo con botón para enviar código de verificación.
                  Se deshabilita una vez que el correo fue verificado exitosamente. */}
              <div className="campo">
                <label className="campo-label">Correo electrónico</label>
                <div className="correo-verify-wrap">
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={correoReg}
                    onChange={(e) => validarCorreo(e.target.value, "registro")}
                    disabled={correoVerificado} // No editable si ya fue verificado
                    className={correoVerificado ? "input-verified" : ""}
                  />
                  {/* Muestra badge "Verificado" o el botón de enviar código según estado */}
                  {correoVerificado ? (
                    <span className="verified-badge">✓ Verificado</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-send-code"
                      onClick={handleEnviarCodigo}
                      disabled={enviandoCodigo}
                    >
                      {enviandoCodigo
                        ? "Enviando..."
                        : codigoEnviado
                          ? "Reenviar"
                          : "Enviar código"}
                    </button>
                  )}
                </div>
                {errores.correoReg && (
                  <span className="error-msg">{errores.correoReg}</span>
                )}
              </div>

              {/* Campo contraseña del registro */}
              <div className="campo">
                <label className="campo-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={passReg}
                  onChange={(e) => validarPassReg(e.target.value)}
                />
                {errores.passReg && (
                  <span className="error-msg">{errores.passReg}</span>
                )}
              </div>

              {/* Campo de confirmación — compara con el campo anterior */}
              <div className="campo">
                <label className="campo-label">Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={passReg2}
                  onChange={(e) => validarPassReg2(e.target.value)}
                />
                {errores.passReg2 && (
                  <span className="error-msg">{errores.passReg2}</span>
                )}
              </div>

              {/* Checkbox de aceptación de términos — obligatorio para registrarse */}
              <div className="terminos">
                <input
                  type="checkbox"
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                />
                <p>
                  Acepto los <a href="/terminos">Términos y Condiciones</a> y la
                  <a href="/privacidad"> Política de Privacidad</a>.
                </p>
              </div>

              <button
                type="button"
                className="btn-principal"
                onClick={handleRegister}
              >
                Crear cuenta →
              </button>
              <p className="pie">
                ¿Ya tienes cuenta?{" "}
                <label className="pie-link" htmlFor="r-login">
                  Inicia sesión
                </label>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AdminModal
        visible={modalAdmin}
        adminMasterInput={adminMasterInput}
        setAdminMasterInput={setAdminMasterInput}
        adminError={adminError}
        adminBloqueado={adminBloqueado}
        adminShake={adminShake}
        adminIntentos={adminIntentos}
        onConfirmar={handleAdminConfirmar}
        onCancelar={cerrarModalAdmin}
      />

      <ResetPasswordModal
        resetPaso={resetPaso}
        resetCorreo={resetCorreo}
        setResetCorreo={setResetCorreo}
        resetCodigo={resetCodigo}
        setResetCodigo={setResetCodigo}
        resetPass={resetPass}
        setResetPass={setResetPass}
        resetPass2={resetPass2}
        setResetPass2={setResetPass2}
        resetCargando={resetCargando}
        onEnviarCodigo={handleResetEnviarCodigo}
        onReenviarCodigo={handleResetReenviarCodigo}
        onVerificarCodigo={handleResetVerificarCodigo}
        onGuardar={handleResetGuardar}
        onCerrar={cerrarModalReset}
      />

      <VerificationCodeModal
        visible={mostrarModalCodigo}
        correoReg={correoReg}
        codigoInput={codigoInput}
        setCodigoInput={setCodigoInput}
        onVerificar={handleVerificarCodigo}
        onReenviar={handleEnviarCodigo}
        onCerrar={() => setMostrarModalCodigo(false)}
      />

      <NotificationModal modal={modal} setModal={setModal} />
    </>
  );
}
