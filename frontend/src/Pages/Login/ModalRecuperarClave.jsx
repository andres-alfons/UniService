export default function ResetPasswordModal({
  resetPaso,
  resetCorreo,
  setResetCorreo,
  resetCodigo,
  setResetCodigo,
  resetPass,
  setResetPass,
  resetPass2,
  setResetPass2,
  resetCargando,
  onEnviarCodigo,
  onReenviarCodigo,
  onVerificarCodigo,
  onGuardar,
  onCerrar,
}) {
  if (!resetPaso) return null;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>
        {resetPaso === "correo" && (
          <>
            <div className="modal-codigo-icon">🔑</div>
            <h3>¿Olvidaste tu contraseña?</h3>
            <p>
              Ingresa tu correo y te enviaremos un código de verificación
            </p>
            <input
              type="email"
              className="input-codigo"
              style={{
                letterSpacing: "normal",
                fontSize: "0.9rem",
                textAlign: "left",
                padding: "12px 14px",
              }}
              placeholder="tu@correo.com"
              value={resetCorreo}
              onChange={(e) => setResetCorreo(e.target.value)}
            />
            <button
              className="btn-principal"
              onClick={onEnviarCodigo}
              disabled={resetCargando}
            >
              {resetCargando
                ? "Enviando..."
                : "Enviar código de verificación"}
            </button>
            <button className="btn-cerrar-modal" onClick={onCerrar}>
              Cancelar
            </button>
          </>
        )}

        {resetPaso === "codigo" && (
          <>
            <div className="modal-codigo-icon">📧</div>
            <h3>Revisa tu correo</h3>
            <p>
              Enviamos un código de 6 dígitos a{" "}
              <strong>{resetCorreo}</strong>
            </p>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              className="input-codigo"
              value={resetCodigo}
              onChange={(e) =>
                setResetCodigo(e.target.value.replace(/\D/g, ""))
              }
            />
            <button
              className="btn-principal"
              onClick={onVerificarCodigo}
              disabled={resetCargando}
            >
              {resetCargando ? "Verificando..." : "Confirmar código"}
            </button>
            <button
              className="btn-reenviar"
              onClick={onReenviarCodigo}
              disabled={resetCargando}
            >
              Reenviar código
            </button>
            <button className="btn-cerrar-modal" onClick={onCerrar}>
              Cancelar
            </button>
          </>
        )}

        {resetPaso === "nueva" && (
          <>
            <div className="modal-codigo-icon">🔒</div>
            <h3>Nueva contraseña</h3>
            <p>Elige una contraseña segura de mínimo 8 caracteres</p>
            <input
              type="password"
              className="input-codigo"
              style={{
                letterSpacing: "normal",
                fontSize: "0.9rem",
                textAlign: "left",
                padding: "12px 14px",
              }}
              placeholder="Nueva contraseña"
              value={resetPass}
              onChange={(e) => setResetPass(e.target.value)}
            />
            <input
              type="password"
              className="input-codigo"
              style={{
                letterSpacing: "normal",
                fontSize: "0.9rem",
                textAlign: "left",
                padding: "12px 14px",
                marginTop: "10px",
              }}
              placeholder="Confirmar contraseña"
              value={resetPass2}
              onChange={(e) => setResetPass2(e.target.value)}
            />
            <button
              className="btn-principal"
              onClick={onGuardar}
              disabled={resetCargando}
            >
              {resetCargando ? "Guardando..." : "Guardar contraseña"}
            </button>
            <button className="btn-cerrar-modal" onClick={onCerrar}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
