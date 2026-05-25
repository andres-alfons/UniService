import { useState, useEffect, useRef, useCallback } from "react";
import ChatMessage from "./ChatMessage";
import { API_CHAT } from "../shared/constantes";
import { enviarMensaje, unirseChat, salirChat, on, enviarEscribiendo } from "../../Services/SignalRService";
import { apiImageUrl } from "../../utils/apiFetch";

export default function ChatWindow({ chat, usuarioId, usuariosOnline }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [escribiendo, setEscribiendo] = useState(false);
  const mensajesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!chat) return;
    setCargando(true);
    setMensajes([]);
    setEscribiendo(false);

    fetch(`${API_CHAT}/${chat.id_chat}/mensajes`)
      .then((r) => r.json())
      .then((data) => {
        setMensajes(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch(() => setCargando(false));

    // Marcar mensajes como leídos y refrescar contador global
    fetch(`${API_CHAT}/mensajes/${chat.id_chat}/leido`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_destinatario: parseInt(usuarioId) }),
    }).then(() => {
      // Disparar evento para que Notificaciones actualice el badge
      window.dispatchEvent(new CustomEvent("chat-leido"));
    });

    unirseChat(chat.id_chat);

    return () => {
      salirChat(chat.id_chat);
    };
  }, [chat, usuarioId]);

  useEffect(() => {
    if (!chat) return;

    const unsub = on("onMensaje", (data) => {
      if (data.id_chat === chat.id_chat) {
        setMensajes((prev) => {
          const exists = prev.some(
            (m) => m.id_mensaje === data.id_mensaje ||
            (m.mensaje === data.mensaje && m.id_remitente === data.id_remitente && Math.abs(new Date(m.fecha_envio) - new Date(data.fecha_envio)) < 5000)
          );
          if (exists) return prev;
          return [...prev, {
            id_mensaje: data.id_mensaje || Date.now(),
            id_chat: data.id_chat,
            id_remitente: data.id_remitente,
            id_destinatario: data.id_destinatario,
            mensaje: data.mensaje,
            fecha_envio: data.fecha_envio,
            leido: data.leido ?? false,
            tipo: data.tipo || "texto",
            nombre_remitente: data.id_remitente === parseInt(usuarioId) ? "Tú" : (data.nombre_remitente || ""),
          }];
        });
      }
    });

    const unsubTyping = on("onUsuarioEscribiendo", (data) => {
      if (data.id_chat === chat.id_chat && data.id_usuario !== parseInt(usuarioId)) {
        setEscribiendo(data.escribiendo);
      }
    });

    return () => {
      unsub();
      unsubTyping();
    };
  }, [chat, usuarioId]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, escribiendo]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [chat]);

  const handleInputChange = useCallback((e) => {
    setNuevoMensaje(e.target.value);

    if (chat) {
      const tieneTexto = e.target.value.trim().length > 0;
      enviarEscribiendo(chat.id_chat, parseInt(usuarioId), tieneTexto);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        enviarEscribiendo(chat.id_chat, parseInt(usuarioId), false);
      }, 3000);
    }
  }, [chat, usuarioId]);

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() || !chat) return;

    const texto = nuevoMensaje.trim();
    setNuevoMensaje("");
    enviarEscribiendo(chat.id_chat, parseInt(usuarioId), false);

    const msgOptimista = {
      id_mensaje: Date.now(),
      id_chat: chat.id_chat,
      id_remitente: parseInt(usuarioId),
      id_destinatario: chat.id_otro_usuario,
      mensaje: texto,
      fecha_envio: new Date().toISOString(),
      leido: false,
      tipo: "texto",
      nombre_remitente: "Tú",
    };

    setMensajes((prev) => [...prev, msgOptimista]);

    try {
      const res = await fetch(`${API_CHAT}/mensaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_chat: chat.id_chat,
          id_remitente: parseInt(usuarioId),
          id_destinatario: chat.id_otro_usuario,
          mensaje: texto,
        }),
      });

      const data = await res.json();
      if (data.id_mensaje) {
        setMensajes((prev) =>
          prev.map((m) =>
            m.id_mensaje === msgOptimista.id_mensaje
              ? { ...m, id_mensaje: data.id_mensaje, fecha_envio: data.fecha_envio }
              : m
          )
        );
      }

      enviarMensaje(
        chat.id_chat,
        parseInt(usuarioId),
        chat.id_otro_usuario,
        texto
      );
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  function estaOnline() {
    return usuariosOnline.has(chat?.id_otro_usuario);
  }

  if (!chat) {
    return (
      <div className="chat-window-empty">
        <i className="bi bi-chat-square-text" style={{ fontSize: "64px", color: "#555" }}></i>
        <p>Selecciona una conversación</p>
      </div>
    );
  }

  return (
    <div className="chat-window-container">
      <div className="chat-window-header">
        <div className="chat-window-user">
          <div className="chat-window-avatar">
            {chat.avatar_otro ? (
              <img
                src={apiImageUrl(chat.avatar_otro)}
                alt={chat.nombre_otro}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.querySelector(".avatar-placeholder-sm-fallback").style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="avatar-placeholder-sm-fallback"
              style={{ display: chat.avatar_otro ? "none" : "flex" }}
            >
              {chat.nombre_otro.charAt(0).toUpperCase()}
            </div>
            {estaOnline() && <span className="online-dot"></span>}
          </div>
          <div className="chat-window-info">
            <span className="chat-window-name">{chat.nombre_otro}</span>
            <span className={`chat-window-status ${estaOnline() ? "online" : "offline"}`}>
              {escribiendo ? (
                <span className="typing-indicator">
                  Escribiendo
                  <span className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </span>
              ) : estaOnline() ? "En línea" : "Desconectado"}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-messages-container">
        {cargando ? (
          <div className="chat-loading">
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        ) : (
          <>
            {mensajes.map((msg) => (
              <ChatMessage
                key={msg.id_mensaje}
                mensaje={msg}
                esPropio={parseInt(msg.id_remitente) === parseInt(usuarioId)}
              />
            ))}
            <div ref={mensajesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-container">
        <textarea
          ref={inputRef}
          value={nuevoMensaje}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="chat-input"
        />
        <button
          onClick={handleEnviar}
          disabled={!nuevoMensaje.trim()}
          className="chat-send-btn"
        >
          <i className="bi bi-send-fill"></i>
        </button>
      </div>
    </div>
  );
}
