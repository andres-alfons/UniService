import * as signalR from "@microsoft/signalr";

const HUB_URL = "http://localhost:5165/chathub";

let connection = null;
let callbacks = {};

export function iniciarSignalR(usuarioId) {
  if (connection) {
    connection.stop();
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();

  connection.on("RecibirMensaje", (data) => {
    if (callbacks.onMensaje) callbacks.onMensaje(data);
  });

  connection.on("MensajeEnviado", (data) => {
    if (callbacks.onMensajeEnviado) callbacks.onMensajeEnviado(data);
  });

  connection.on("UsuarioConectado", (id) => {
    if (callbacks.onUsuarioConectado) callbacks.onUsuarioConectado(id);
  });

  connection.on("UsuarioDesconectado", (id) => {
    if (callbacks.onUsuarioDesconectado) callbacks.onUsuarioDesconectado(id);
  });

  connection.on("NuevoChatNotification", (data) => {
    if (callbacks.onNuevoChat) callbacks.onNuevoChat(data);
  });

  connection.on("MensajesLeidos", (data) => {
    if (callbacks.onMensajesLeidos) callbacks.onMensajesLeidos(data);
  });

  connection
    .start()
    .then(() => {
      console.log("[SignalR] Conectado");
      connection.invoke("ConectarUsuario", usuarioId);
    })
    .catch((err) => console.error("[SignalR] Error:", err));

  return connection;
}

export function on(evento, callback) {
  callbacks[evento] = callback;
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
