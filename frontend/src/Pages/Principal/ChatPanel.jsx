import { useState, useEffect, useCallback } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { API_CHAT } from "../shared/constantes";
import {
  iniciarSignalR,
  on,
  detenerSignalR,
} from "../../Services/SignalRService";

export default function ChatPanel({ abierto, onCerrar }) {
  const [chats, setChats] = useState([]);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [usuariosOnline, setUsuariosOnline] = useState(new Set());
  const usuarioId = localStorage.getItem("usuarioId");

  const cargarChats = useCallback(() => {
    if (!usuarioId) return;
    fetch(`${API_CHAT}/mis-chats/${usuarioId}`)
      .then((r) => r.json())
      .then((data) => {
        setChats(Array.isArray(data) ? data : []);
      })
      .catch(console.error);
  }, [usuarioId]);

  useEffect(() => {
    if (abierto && usuarioId) {
      iniciarSignalR(parseInt(usuarioId));

      on("onMensaje", (data) => {
        cargarChats();
        if (chatSeleccionado && data.id_chat === chatSeleccionado.id_chat) {
          setChats((prev) =>
            prev.map((c) =>
              c.id_chat === data.id_chat
                ? { ...c, ultimo_mensaje_texto: data.mensaje, no_leidos: 0 }
                : c
            )
          );
        }
      });

      on("onUsuarioConectado", (id) => {
        setUsuariosOnline((prev) => new Set(prev).add(id));
      });

      on("onUsuarioDesconectado", (id) => {
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
        detenerSignalR();
      };
    }
  }, [abierto, usuarioId, cargarChats, chatSeleccionado]);

  if (!abierto) return null;

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
