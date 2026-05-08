export default function AdminModal({
  visible,
  adminMasterInput,
  setAdminMasterInput,
  adminError,
  adminBloqueado,
  adminShake,
  adminIntentos,
  onConfirmar,
  onCancelar,
}) {
  if (!visible) return null;

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 9999, backdropFilter: "blur(8px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg, #0d0d1a 0%, #0a0a16 100%)",
          border: "1px solid rgba(239,68,68,0.35)",
          borderRadius: "20px",
          padding: "44px 40px 36px",
          maxWidth: "460px",
          width: "90%",
          boxShadow:
            "0 0 60px rgba(239,68,68,0.15), 0 24px 48px rgba(0,0,0,0.6)",
          animation: adminShake
            ? "adminShake 0.45s ease"
            : "adminEntrada 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #EF4444, #DC2626, #EF4444)",
          }}
        />

        <div
          style={{
            fontSize: "3.5rem",
            textAlign: "center",
            marginBottom: "16px",
            filter: "drop-shadow(0 0 16px rgba(239,68,68,0.5))",
          }}
        >
          ⚠️
        </div>

        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "2rem",
            fontWeight: 800,
            color: "#e00a0ae9",
            textAlign: "center",
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
          }}
        >
          Zona restringida
        </p>
        <br />

        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "0.83rem",
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Estás intentando acceder a una{" "}
            <strong style={{ color: "#EF4444" }}>
              cuenta de administrador
            </strong>
            . Para continuar, introduce la contraseña exclusiva de admins.
          </p>
        </div>

        <input
          type="password"
          placeholder="Contraseña de administradores"
          value={adminMasterInput}
          onChange={(e) => setAdminMasterInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !adminBloqueado && onConfirmar()
          }
          disabled={adminBloqueado}
          style={{
            width: "100%",
            background: adminBloqueado
              ? "rgba(239,68,68,0.05)"
              : "rgba(255,255,255,0.06)",
            border: `1px solid ${adminError && !adminBloqueado ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "10px",
            color: "#fff",
            padding: "13px 16px",
            fontSize: "0.9rem",
            outline: "none",
            marginBottom: "12px",
            boxSizing: "border-box",
            cursor: adminBloqueado ? "not-allowed" : "text",
            letterSpacing: adminMasterInput ? "0.15em" : "normal",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background:
                  n <= adminIntentos ? "#EF4444" : "rgba(255,255,255,0.1)",
                boxShadow:
                  n <= adminIntentos
                    ? "0 0 8px rgba(239,68,68,0.6)"
                    : "none",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {adminError && (
          <p
            style={{
              color: adminBloqueado ? "#F87171" : "#FCA5A5",
              fontSize: "0.8rem",
              textAlign: "center",
              margin: "0 0 16px",
              fontWeight: 600,
            }}
          >
            {adminError}
          </p>
        )}

        {!adminBloqueado ? (
          <button
            type="button"
            onClick={onConfirmar}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              padding: "13px",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: "10px",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
            }}
          >
            Verificar y acceder al panel
          </button>
        ) : (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "10px",
              padding: "12px",
              textAlign: "center",
              marginBottom: "10px",
              fontSize: "0.82rem",
              color: "#F87171",
            }}
          >
            🔒 Acceso bloqueado por intentos fallidos
          </div>
        )}

        <button
          type="button"
          onClick={onCancelar}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            color: "rgba(255,255,255,0.45)",
            padding: "10px",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cancelar
        </button>
      </div>

      <style>{`
        @keyframes adminEntrada {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes adminShake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
