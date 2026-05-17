// Modal para verificar el código de 6 dígitos enviado al correo durante el registro
export default function VerificationCodeModal({
  visible,
  correoReg,
  codigoInput,
  setCodigoInput,
  onVerificar,
  onReenviar,
  onCerrar,
}) {
  // No renderiza si el modal no está visible
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-codigo-icon"><i className="bi bi-envelope-fill"></i></div>
        <h3>Revisa tu correo</h3>
        <p>
          Enviamos un código de 6 dígitos a <strong>{correoReg}</strong>
        </p>
        {/* Campo de código numérico de máximo 6 dígitos */}
        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={codigoInput}
          onChange={(e) =>
            setCodigoInput(e.target.value.replace(/\D/g, ""))
          }
          className="input-codigo"
        />
        <button className="btn-principal" onClick={onVerificar}>
          Confirmar código
        </button>
        <button className="btn-reenviar" onClick={onReenviar}>
          Reenviar código
        </button>
        <button className="btn-cerrar-modal" onClick={onCerrar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
