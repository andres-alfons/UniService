import { useState, useEffect, useCallback, useRef } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { API_CHAT } from "../shared/constantes";
import {
  iniciarSignalR,
  on,
  detenerSignalR,
} from "../../Services/SignalRService";

export default function ChatPanel({ abierto, onCerrar, targetUsuario = null }) {
  const [chats, setChats] = useState([]);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [usuariosOnline, setUsuariosOnline] = useState(new Set());
  const [cargando, setCargando] = useState(false);
  const usuarioId = localStorage.getItem("usuarioId");
  const targetProcessed = useRef(false);

  const token = localStorage.getItem("token");

  const cargarChats = useCallback(() => {
    if (!usuarioId) return;
    return fetch(`${API_CHAT}/mis-chats/${usuarioId}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
     }
    )
      .then((r) => r.json())
      .then((data) => {
        const chatsData = Array.isArray(data) ? data : [];
        setChats(chatsData);
        return chatsData;
      })
      .catch((err) => {
        console.error("Error cargando chats:", err);
        return [];
      });
  }, [usuarioId, token]);

  useEffect(() => {
    if (abierto && usuarioId) {
      iniciarSignalR(parseInt(usuarioId));

      const unsubMensaje = on("onMensaje", (data) => {
        cargarChats();
        window.dispatchEvent(new CustomEvent("nuevo-mensaje-chat"));
      });

      const unsubEscribiendo = on("onUsuarioEscribiendo", () => {
        cargarChats();
      });

      const unsubConectado = on("onUsuarioConectado", (id) => {
        setUsuariosOnline((prev) => new Set(prev).add(id));
      });

      const unsubDesconectado = on("onUsuarioDesconectado", (id) => {
        setUsuariosOnline((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });

      cargarChats();
      const interval = setInterval(cargarChats, 30000);

      return () => {
        clearInterval(interval);
        unsubMensaje();
        unsubEscribiendo();
        unsubConectado();
        unsubDesconectado();
      };
    }
  }, [abierto, usuarioId, cargarChats]);

  useEffect(() => {
    if (abierto && targetUsuario && usuarioId && !targetProcessed.current) {
      targetProcessed.current = true;
      const targetId = targetUsuario.id;
      console.log("[ChatPanel] Iniciando chat con:", targetUsuario);

      cargarChats().then((chatsData) => {
        console.log("[ChatPanel] Chats cargados:", chatsData);
        const chatExistente = chatsData.find(
          (c) => c.id_otro_usuario === targetId
        );
        if (chatExistente) {
          console.log("[ChatPanel] Chat existente encontrado:", chatExistente);
          setChatSeleccionado(chatExistente);
        } else {
          console.log("[ChatPanel] Creando nuevo chat...");
          setCargando(true);
          fetch(`${API_CHAT}/iniciar`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              ...(token && { "Authorization": `Bearer ${token}` }),
            },
            body: JSON.stringify({
              id_usuario1: parseInt(usuarioId),
              id_usuario2: targetId,
            }),
          })
            .then((r) => r.json())
            .then((data) => {
              console.log("[ChatPanel] Respuesta del servidor:", data);
              if (data.id_chat) {
                const nuevoChat = {
                  id_chat: data.id_chat,
                  id_otro_usuario: targetId,
                  nombre_otro: targetUsuario.nombre,
                  avatar_otro: targetUsuario.avatar || "",
                  no_leidos: 0,
                  ultimo_mensaje_texto: null,
                  ultimo_mensaje_fecha: null,
                };
                setChatSeleccionado(nuevoChat);
                cargarChats();
              }
            })
            .catch((err) => console.error("[ChatPanel] Error creando chat:", err))
            .finally(() => setCargando(false));
        }
      });
    }

    if (!abierto) {
      targetProcessed.current = false;
      setChatSeleccionado(null);
    }
  }, [abierto, targetUsuario, usuarioId, cargarChats, token]);

  if (!abierto) {
    window.dispatchEvent(new CustomEvent("chat-cerrado"));
    return null;
  }

  return (
    <div className="chat-panel-overlay" onClick={onCerrar}>
      <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
        <button className="chat-panel-close" onClick={onCerrar}>
          <i className="bi bi-x-lg"></i>
        </button>
        <div className="chat-panel-content">
          <ChatList
            chats={chats}
            chatSeleccionado={chatSeleccionado}
            onSelectChat={setChatSeleccionado}
            usuariosOnline={usuariosOnline}
          />
          <ChatWindow
            chat={chatSeleccionado}
            usuarioId={usuarioId}
            usuariosOnline={usuariosOnline}
          />
        </div>
      </div>
    </div>
  );
}
