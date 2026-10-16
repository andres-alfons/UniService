import { useState, useEffect } from "react";
import "../styles/StyleLogin.css";
import "../styles/cartel.css";
import { useNavigate } from "react-router-dom";
import logoIcon from "../img/logo_color_noBG.png";
import ResetPasswordModal from "./Login/ModalRecuperarClave";
import VerificationCodeModal from "./Login/ModalVerificarCodigo";
import NotificationModal from "./Login/ModalNotificacion";
import { apiFetch, limpiarSesion, mensajeError } from "../utils/apiFetch";

// Sólo se admiten cuentas con correo institucional (la base de datos lo exige).
const REGEX_CORREO = /^[a-z0-9][a-z0-9._+-]*@unicesar\.edu\.co$/i;
const ERROR_CORREO = "Usa tu correo @unicesar.edu.co";

// Mismas reglas que la API: 8 a 72 caracteres, con letras y números.
function errorPassword(p) {
  if (p.length < 8) return "Mínimo 8 caracteres";
  if (p.length > 72) return "Máximo 72 caracteres";
  if (!/\p{L}/u.test(p) || !/\d/.test(p)) return "Combina letras y números";
  return "";
}

// Guarda la sesión que devuelven login y registro: { token, user: { id, nombre, correo, id_rol } }.
function guardarSesion({ token, user }) {
  limpiarSesion();
  localStorage.setItem("token", token);
  localStorage.setItem("usuarioId", user.id);
  localStorage.setItem("usuarioNombre", user.nombre || user.correo.split("@")[0]);
  localStorage.setItem("usuarioRol", user.id_rol);
  localStorage.setItem("logueado", "true");
}

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
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
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
  // JWT efímero (15 min) que devuelve verify-code y exige /api/auth/register
  const [verificacionToken, setVerificacionToken] = useState("");
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
  const [resetToken, setResetToken] = useState(""); // Token de verify-code para reset-password-verificado
  const [resetCargando, setResetCargando] = useState(false); // Deshabilita botones mientras espera la API

  // ════════════════════════════════
  // ESTADOS GENERALES DE UI
  // ════════════════════════════════
  const [tab, setTab] = useState("login"); // "login" | "registro"
  const [errores, setErrores] = useState({}); // Objeto con mensajes de error por campo (ej: { correo: "Inválido" })
  const [cargandoLogin, setCargandoLogin] = useState(false); // Evita doble clic en login
  const [cargandoRegistro, setCargandoRegistro] = useState(false); // Evita doble clic en registro
  const [transitionState, setTransitionState] = useState(null); // null | 'loading' — oculta el login y muestra loader

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

  // Valida que el correo sea institucional (@unicesar.edu.co)
  // El parámetro "tipo" diferencia si es el campo del login o el del registro
  const validarCorreo = (email, tipo = "login") => {
    const esValido = REGEX_CORREO.test(email.trim());
    if (tipo === "login") {
      setCorreo(email);
      setErrores((prev) => ({
        ...prev,
        correo: esValido ? "" : ERROR_CORREO,
      }));
    } else {
      setCorreoReg(email);
      setErrores((prev) => ({
        ...prev,
        correoReg: esValido ? "" : ERROR_CORREO,
      }));
    }
  };

  // En el login sólo se exige que haya contraseña: las cuentas antiguas pueden tener otras reglas
  const validarPassLogin = (value) => {
    setPass(value);
    setErrores((prev) => ({
      ...prev,
      pass: value ? "" : "Escribe tu contraseña",
    }));
  };

  // Nombre y apellido: sólo letras; entre los dos máximo 50 caracteres (límite de la base de datos)
  const errorNombre = (value, otro) => {
    const t = value.trim();
    if (t.length < 2) return "Mínimo 2 letras";
    if (!/^\p{L}[\p{L}\p{M}' .-]*$/u.test(t)) return "Sólo letras";
    if (`${t} ${otro.trim()}`.trim().length > 50) return "Nombre y apellido: máximo 50 caracteres entre ambos";
    return "";
  };

  const validarNombre = (value) => {
    setNombre(value);
    setErrores((prev) => ({ ...prev, nombre: errorNombre(value, apellido) }));
  };

  const validarApellido = (value) => {
    setApellido(value);
    setErrores((prev) => ({ ...prev, apellido: errorNombre(value, nombre) }));
  };

  // Teléfono: 7 a 12 dígitos (se permiten espacios, guiones, paréntesis y + al inicio)
  const errorTelefono = (value) =>
    /^\+?[0-9]{7,12}$/.test(value.replace(/[\s\-.()]/g, "")) ? "" : "De 7 a 12 dígitos";

  const validarTelefono = (value) => {
    setTelefono(value);
    setErrores((prev) => ({ ...prev, telefono: errorTelefono(value) }));
  };

  // Valida la contraseña del registro. También re-valida la confirmación
  // si ya tiene algo escrito, para que el error de "no coinciden" se actualice
  const validarPassReg = (value) => {
    setPassReg(value);
    setErrores((prev) => ({
      ...prev,
      passReg: errorPassword(value),
      ...(passReg2 && {
        passReg2: value !== passReg2 ? "Las contraseñas no coinciden" : "",
      }),
    }));
  };

  // Valida la confirmación de contraseña comparándola con la original
  const validarPassReg2 = (value) => {
    setPassReg2(value);
    setErrores((prev) => ({
      ...prev,
      passReg2: value !== passReg ? "Las contraseñas no coinciden" : "",
    }));
  };

  // ════════════════════════════════
  // VERIFICACIÓN DE CORREO (REGISTRO)
  // La API envía un código de 6 dígitos al correo institucional (válido 10 minutos).
  // Al verificarlo devuelve un token que autoriza a crear la cuenta durante 15 minutos.
  // ════════════════════════════════
  const enviarCodigo = (correoDestino) =>
    apiFetch("/api/auth/institutional-email/send-code", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ correo: correoDestino.trim().toLowerCase() }),
    });

  const verificarCodigo = (correoDestino, codigo) =>
    apiFetch("/api/auth/institutional-email/verify-code", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ correo: correoDestino.trim().toLowerCase(), codigo }),
    });

  const handleEnviarCodigo = async () => {
    if (!REGEX_CORREO.test(correoReg.trim())) {
      notificar(ERROR_CORREO);
      return;
    }
    setEnviandoCodigo(true); // Cambia el botón a "Enviando..."
    try {
      const { ok, data } = await enviarCodigo(correoReg);
      if (ok) {
        setCodigoEnviado(true);
        setCodigoInput("");
        setMostrarModalCodigo(true);
      } else {
        notificar(mensajeError(data, "Error al enviar el código"));
      }
    } catch {
      notificar("Error de conexión");
    } finally {
      setEnviandoCodigo(false); // Restaura el botón sin importar si fue exitoso o no
    }
  };

  // Envía el código que escribió el usuario a la API para verificarlo.
  // Si es correcto, guarda el token de verificación y habilita "Crear cuenta".
  const handleVerificarCodigo = async () => {
    if (codigoInput.length !== 6) {
      notificar("El código debe tener 6 dígitos");
      return;
    }
    try {
      const { ok, data } = await verificarCodigo(correoReg, codigoInput);
      if (!ok) {
        notificar(mensajeError(data, "Código incorrecto, intenta de nuevo"));
        return;
      }
      setMostrarModalCodigo(false);
      if (data.cuenta_existente) {
        notificar("Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.", "info");
        return;
      }
      setVerificacionToken(data.verificacion_token);
      setCorreoVerificado(true); // Habilita el botón de crear cuenta
      notificar("Correo verificado con éxito", "success");
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
    if (!REGEX_CORREO.test(resetCorreo.trim())) {
      notificar(ERROR_CORREO);
      return;
    }
    setResetCargando(true);
    try {
      const { ok, data } = await enviarCodigo(resetCorreo);
      if (ok) {
        setResetPaso("codigo");
      } else {
        notificar(mensajeError(data, "Error al enviar el código"));
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
      const { ok, data } = await enviarCodigo(resetCorreo);
      if (ok) notificar("Código reenviado", "success");
      else notificar(mensajeError(data, "Error al reenviar"));
    } catch {
      notificar("Error al reenviar");
    } finally {
      setResetCargando(false);
    }
  };

  // PASO 2: Verifica el código; la API devuelve un token para cambiar la contraseña
  const handleResetVerificarCodigo = async () => {
    if (resetCodigo.length !== 6) {
      notificar("El código debe tener 6 dígitos");
      return;
    }
    setResetCargando(true);
    try {
      const { ok, data } = await verificarCodigo(resetCorreo, resetCodigo);
      if (!ok) {
        notificar(mensajeError(data, "Código incorrecto o expirado"));
      } else if (!data.cuenta_existente) {
        notificar("No hay una cuenta con este correo. Regístrate primero.");
      } else {
        setResetToken(data.verificacion_token);
        setResetPaso("nueva"); // Avanza al paso 3: escribir la nueva contraseña
      }
    } catch {
      notificar("Error de conexión");
    } finally {
      setResetCargando(false);
    }
  };

  // PASO 3: Envía la nueva contraseña al backend para guardarla en la base de datos
  const handleResetGuardar = async () => {
    const error = errorPassword(resetPass);
    if (error) {
      notificar(`Contraseña: ${error.toLowerCase()}`);
      return;
    }
    if (resetPass !== resetPass2) {
      notificar("Las contraseñas no coinciden");
      return;
    }
    setResetCargando(true);
    try {
      const { ok, data } = await apiFetch("/api/auth/reset-password-verificado", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          correo: resetCorreo.trim().toLowerCase(),
          verificacion_token: resetToken,
          nueva_password: resetPass,
        }),
      });
      if (ok) {
        notificar(
          "Contraseña cambiada correctamente. Ya puedes iniciar sesión.",
          "success",
        );
        cerrarModalReset();
      } else {
        notificar(mensajeError(data, "Error al cambiar contraseña"));
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
    setResetToken("");
  };

  // ════════════════════════════════
  // LÓGICA DE LOGIN
  // La autenticación se realiza contra el backend para todos los usuarios.
  // Los administradores (id_rol = 1) van al panel, que pide su contraseña de administrador.
  // ════════════════════════════════
  const handleLogin = async () => {
    if (cargandoLogin) return;
    if (!correo || errores.correo) {
      notificar(ERROR_CORREO);
      return;
    }
    if (!pass) {
      notificar("Escribe tu contraseña");
      return;
    }

    setTransitionState("loading");
    setCargandoLogin(true);
    try {
      const { ok, data } = await apiFetch("/api/auth/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ correo: correo.trim().toLowerCase(), password: pass }),
      });

      if (ok && data?.token) {
        guardarSesion(data);
        // Si el invitado venía de un volante (/login?id=…), vuelve a ese servicio.
        const idServicio = new URLSearchParams(window.location.search).get("id");
        const destino = data.user.id_rol === 1 ? "/admin-dashboard"
          : /^\d+$/.test(idServicio || "") ? `/servicio?id=${idServicio}` : "/home";
        navigate(destino, { replace: true });
      } else {
        setTransitionState(null);
        notificar(mensajeError(data, "Credenciales incorrectas"));
      }
    } catch {
      setTransitionState(null);
      notificar("Error de conexión con el servidor");
    } finally {
      setCargandoLogin(false);
    }
  };

  // ════════════════════════════════
  // LÓGICA DE REGISTRO
  // Crea la cuenta con el token de verificación del correo y abre la sesión.
  // ════════════════════════════════
  const handleRegister = async () => {
    if (cargandoRegistro) return;
    // No permite registrar si el correo no fue verificado con el código
    if (!correoVerificado) {
      notificar("Debes verificar tu correo primero");
      return;
    }
    // Validación completa del formulario antes de enviar
    const erroresForm = {
      nombre: errorNombre(nombre, apellido),
      apellido: errorNombre(apellido, nombre),
      telefono: errorTelefono(telefono),
      passReg: errorPassword(passReg),
      passReg2: passReg !== passReg2 ? "Las contraseñas no coinciden" : "",
    };
    setErrores((prev) => ({ ...prev, ...erroresForm }));
    if (Object.values(erroresForm).some(Boolean) || !terminos) {
      notificar(terminos ? "Revisa los campos del formulario" : "Debes aceptar los términos y condiciones");
      return;
    }
    setCargandoRegistro(true);
    try {
      const { ok, status, data } = await apiFetch("/api/auth/register", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          correo: correoReg.trim().toLowerCase(),
          password: passReg,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim(),
          verificacion_token: verificacionToken,
        }),
      });
      if (ok && data?.token) {
        guardarSesion(data);
        navigate("/home", { replace: true });
        return;
      }
      // El token de verificación dura 15 minutos: si venció hay que pedir otro código
      if (status === 400 && /verificaci|venci/i.test(data?.error || "")) {
        setCorreoVerificado(false);
        setVerificacionToken("");
      }
      notificar(mensajeError(data, "No se pudo crear la cuenta"));
    } catch {
      notificar("Error de conexión");
    } finally {
      setCargandoRegistro(false);
    }
  };

  // Desde la portada: ?registro=1&correo=… abre el registro con el correo ya escrito.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registro") !== "1") return;
    setTab("registro");
    const correoInicial = params.get("correo");
    if (correoInicial) validarCorreo(correoInicial, "registro");
  }, []);

  // Aviso cuando el servidor cerró la sesión (token vencido o cuenta suspendida)
  useEffect(() => {
    const motivo = new URLSearchParams(window.location.search).get("sesion");
    if (motivo === "suspendida")
      notificar("Tu cuenta fue suspendida. Si crees que es un error, contacta al administrador.");
    else if (motivo === "expirada") notificar("Tu sesión terminó. Inicia sesión de nuevo.", "info");
  }, []);

  // ════════════════════════════════
  // RENDERIZADO (JSX)
  // A la izquierda el cartel amarillo; a la derecha el formulario sobre papel.
  // ════════════════════════════════
  const error = (campo, id) =>
    errores[campo] ? (
      <span id={id} className="us-error" role="alert">
        {errores[campo]}
      </span>
    ) : null;

  return (
    <div className="us us-login">
      <a className="us-saltar" href="#formulario">Saltar al formulario</a>

      <section className="us-login-lado" aria-labelledby="login-titulo">
        <a href="/home-guest" className="us-marca" aria-label="UniService, volver al inicio">
          <img src={logoIcon} alt="" width="44" height="44" />
          UniService
        </a>
        <h1 id="login-titulo" className="us-login-cartel">
          <span className="us-linea"><span data-line style={{ "--i": 0 }}>Entra</span></span>
          <span className="us-linea"><span data-line style={{ "--i": 1 }}>a la U.</span></span>
        </h1>
        <p className="us-lead">
          Para pedir, ofrecer y chatear necesitas una cuenta con tu correo de la Universidad Popular del Cesar.
        </p>
        <a href="/home-guest" className="us-enlace">Ver los servicios sin cuenta</a>
        <figure className="us-login-foto">
          <img
            src="/assets/rio-guatapuri-valledupar.jpg"
            alt="El río Guatapurí a su paso por Valledupar"
            width="1920"
            height="1440"
          />
          <figcaption className="us-credito-foto">
            Río Guatapurí · Jdvillalobos, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>
          </figcaption>
        </figure>
      </section>

      <main id="formulario" className="us-login-form" role="main">
        {transitionState === "loading" && (
          <div className="us-login-entrando" role="status">Entrando…</div>
        )}

        <div className="us-segmento us-login-tabs" role="tablist" aria-label="Acceso">
          <button
            type="button"
            role="tab"
            id="tab-login"
            aria-selected={tab === "login"}
            aria-pressed={tab === "login"}
            aria-controls="panel-login"
            onClick={() => setTab("login")}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            role="tab"
            id="tab-registro"
            aria-selected={tab === "registro"}
            aria-pressed={tab === "registro"}
            aria-controls="panel-reg"
            onClick={() => setTab("registro")}
          >
            Crear cuenta
          </button>
        </div>

        {tab === "login" ? (
          <form
            key="login"
            id="panel-login"
            role="tabpanel"
            aria-labelledby="tab-login"
            className="us-login-panel"
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            noValidate
          >
            <h2 className="us-login-titulo">Hola de nuevo</h2>
            <div className="us-login-campo">
              <label htmlFor="login-correo">Correo institucional</label>
              <input
                id="login-correo"
                className="us-campo-texto"
                type="email"
                inputMode="email"
                placeholder="tu@unicesar.edu.co"
                value={correo}
                onChange={(e) => validarCorreo(e.target.value, "login")}
                autoComplete="email"
                aria-invalid={!!errores.correo}
                aria-describedby={errores.correo ? "login-correo-error" : undefined}
              />
              {error("correo", "login-correo-error")}
            </div>
            <div className="us-login-campo">
              <label htmlFor="login-pass">Contraseña</label>
              <input
                id="login-pass"
                className="us-campo-texto"
                type="password"
                value={pass}
                onChange={(e) => validarPassLogin(e.target.value)}
                autoComplete="current-password"
                aria-invalid={!!errores.pass}
                aria-describedby={errores.pass ? "login-pass-error" : undefined}
              />
              {error("pass", "login-pass-error")}
            </div>
            <button type="submit" className="us-boton" disabled={cargandoLogin}>
              {cargandoLogin ? "Entrando…" : "Entrar"}
            </button>
            <button type="button" className="us-login-link" onClick={() => setResetPaso("correo")}>
              Olvidé mi contraseña
            </button>
          </form>
        ) : (
          <form
            key="registro"
            id="panel-reg"
            role="tabpanel"
            aria-labelledby="tab-registro"
            className="us-login-panel"
            onSubmit={(e) => { e.preventDefault(); handleRegister(); }}
            noValidate
          >
            <h2 className="us-login-titulo">Tu cuenta en dos minutos</h2>
            <div className="us-login-fila">
              <div className="us-login-campo">
                <label htmlFor="reg-nombre">Nombre</label>
                <input
                  id="reg-nombre"
                  className="us-campo-texto"
                  value={nombre}
                  onChange={(e) => validarNombre(e.target.value)}
                  autoComplete="given-name"
                  aria-invalid={!!errores.nombre}
                  aria-describedby={errores.nombre ? "reg-nombre-error" : undefined}
                />
                {error("nombre", "reg-nombre-error")}
              </div>
              <div className="us-login-campo">
                <label htmlFor="reg-apellido">Apellido</label>
                <input
                  id="reg-apellido"
                  className="us-campo-texto"
                  value={apellido}
                  onChange={(e) => validarApellido(e.target.value)}
                  autoComplete="family-name"
                  aria-invalid={!!errores.apellido}
                  aria-describedby={errores.apellido ? "reg-apellido-error" : undefined}
                />
                {error("apellido", "reg-apellido-error")}
              </div>
            </div>
            <div className="us-login-campo">
              <label htmlFor="reg-telefono">Teléfono</label>
              <input
                id="reg-telefono"
                className="us-campo-texto"
                type="tel"
                inputMode="tel"
                placeholder="300 123 4567"
                value={telefono}
                onChange={(e) => validarTelefono(e.target.value)}
                autoComplete="tel"
                aria-invalid={!!errores.telefono}
                aria-describedby={errores.telefono ? "reg-telefono-error" : undefined}
              />
              {error("telefono", "reg-telefono-error")}
            </div>
            <div className="us-login-campo">
              <label htmlFor="reg-correo">Correo institucional</label>
              <div className="us-login-correo">
                <input
                  id="reg-correo"
                  className="us-campo-texto"
                  type="email"
                  inputMode="email"
                  placeholder="tu@unicesar.edu.co"
                  value={correoReg}
                  onChange={(e) => validarCorreo(e.target.value, "registro")}
                  disabled={correoVerificado}
                  autoComplete="email"
                  aria-invalid={!!errores.correoReg}
                  aria-describedby={errores.correoReg ? "reg-correo-error" : undefined}
                />
                {correoVerificado ? (
                  <span className="us-login-verificado">Verificado</span>
                ) : (
                  <button type="button" className="us-boton us-boton--secundario" onClick={handleEnviarCodigo} disabled={enviandoCodigo}>
                    {enviandoCodigo ? "Enviando…" : codigoEnviado ? "Reenviar código" : "Enviar código"}
                  </button>
                )}
              </div>
              {error("correoReg", "reg-correo-error")}
            </div>
            <div className="us-login-fila">
              <div className="us-login-campo">
                <label htmlFor="reg-pass">Contraseña</label>
                <input
                  id="reg-pass"
                  className="us-campo-texto"
                  type="password"
                  value={passReg}
                  onChange={(e) => validarPassReg(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={!!errores.passReg}
                  aria-describedby="reg-pass-ayuda"
                />
                {errores.passReg ? error("passReg", "reg-pass-ayuda") : (
                  <span id="reg-pass-ayuda" className="us-login-ayuda">8 o más, con letras y números</span>
                )}
              </div>
              <div className="us-login-campo">
                <label htmlFor="reg-pass2">Repite la contraseña</label>
                <input
                  id="reg-pass2"
                  className="us-campo-texto"
                  type="password"
                  value={passReg2}
                  onChange={(e) => validarPassReg2(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={!!errores.passReg2}
                  aria-describedby={errores.passReg2 ? "reg-pass2-error" : undefined}
                />
                {error("passReg2", "reg-pass2-error")}
              </div>
            </div>
            <label className="us-login-terminos">
              <input type="checkbox" checked={terminos} onChange={(e) => setTerminos(e.target.checked)} />
              <span>
                Acepto los <a href="/terminos" className="us-enlace">términos</a> y la{" "}
                <a href="/privacidad" className="us-enlace">política de privacidad</a>.
              </span>
            </label>
            <button type="submit" className="us-boton" disabled={cargandoRegistro}>
              {cargandoRegistro ? "Creando tu cuenta…" : "Crear cuenta"}
            </button>
          </form>
        )}
      </main>

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
    </div>
  );
}
