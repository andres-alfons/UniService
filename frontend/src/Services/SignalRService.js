import * as signalR from "@microsoft/signalr";

const HUB_URL = "/chathub";

let connection = null;
let callbacks = {};

export function iniciarSignalR(usuarioId) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log("[SignalR] Ya conectado");
    return connection;
  }

  if (connection) {
    connection.stop();
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();

  connection.on("RecibirMensaje", (data) => {
    console.log("[SignalR] Mensaje recibido:", data);
    (callbacks.onMensaje || []).forEach((cb) => cb(data));
  });

  connection.on("MensajeEnviado", (data) => {
    console.log("[SignalR] Mensaje enviado confirmado:", data);
    (callbacks.onMensaje || []).forEach((cb) => cb(data));
  });

  connection.on("UsuarioConectado", (id) => {
    console.log("[SignalR] Usuario conectado:", id);
    (callbacks.onUsuarioConectado || []).forEach((cb) => cb(id));
  });

  connection.on("UsuarioDesconectado", (id) => {
    console.log("[SignalR] Usuario desconectado:", id);
    (callbacks.onUsuarioDesconectado || []).forEach((cb) => cb(id));
  });

  connection.on("NuevoChatNotification", (data) => {
    (callbacks.onNuevoChat || []).forEach((cb) => cb(data));
  });

  connection.on("MensajesLeidos", (data) => {
    (callbacks.onMensajesLeidos || []).forEach((cb) => cb(data));
  });

  connection.on("UsuarioEscribiendo", (data) => {
    (callbacks.onUsuarioEscribiendo || []).forEach((cb) => cb(data));
  });

  connection
    .start()
    .then(() => {
      console.log("[SignalR] Conectado como usuario:", usuarioId);
      connection.invoke("ConectarUsuario", usuarioId);
    })
    .catch((err) => console.error("[SignalR] Error:", err));

  return connection;
}

export function on(evento, callback) {
  if (!callbacks[evento]) callbacks[evento] = [];
  callbacks[evento].push(callback);
  return () => {
    callbacks[evento] = (callbacks[evento] || []).filter((cb) => cb !== callback);
  };
}

export function enviarMensaje(idChat, remitenteId, destinatarioId, mensaje, tipo = "texto") {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection.invoke(
      "EnviarMensajeDirecto",
      idChat,
      remitenteId,
      destinatarioId,
      mensaje,
      tipo
    ).catch((err) => console.error("[SignalR] Error enviando mensaje:", err));
  }
  console.warn("[SignalR] No conectado");
}

export function unirseChat(chatId) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection.invoke("UnirseChat", chatId);
  }
}

export function salirChat(chatId) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection.invoke("SalirChat", chatId);
  }
}

export function marcarLeido(chatId, usuarioId) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection.invoke("MarcarLeidoNotificacion", chatId, usuarioId);
  }
}

export function enviarEscribiendo(chatId, usuarioId, escribiendo) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection.invoke("EnviarEscribiendo", chatId, usuarioId, escribiendo);
  }
}

export function notificarNuevoChat(idChat, remitenteId, destinatarioId, nombreRemitente, preview) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection.invoke(
      "NotificarNuevoChat",
      idChat,
      remitenteId,
      destinatarioId,
      nombreRemitente,
      preview
    );
  }
}

export function detenerSignalR() {
  if (connection) {
    connection.stop();
    connection = null;
    callbacks = {};
  }
}

export function obtenerConexion() {
  return connection;
}
