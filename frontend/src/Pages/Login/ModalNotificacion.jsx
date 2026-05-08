export default function NotificationModal({ modal, setModal }) {
  if (!modal.visible) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => setModal({ ...modal, visible: false })}
    >
      <div
        className={`modal-box ${modal.tipo}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p>{modal.mensaje}</p>
        <button onClick={() => setModal({ ...modal, visible: false })}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
