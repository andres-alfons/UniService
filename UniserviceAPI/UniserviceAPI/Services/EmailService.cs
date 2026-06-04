using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Concurrent;

namespace UniserviceAPI.Services
{
    public class EmailService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;
        private static readonly ConcurrentDictionary<string, (DateTime ultimoEnvio, CancellationTokenSource cts)> _spamControl = new();

        public EmailService(IWebHostEnvironment env, IConfiguration config)
        {
            _env = env;
            _config = config;
        }

        private (string host, int port, MailKit.Security.SecureSocketOptions secureOption) GetSmtpConfig()
        {
            string host = _config["EmailSettings:Host"] ?? "";
            int port = 587;
            if (int.TryParse(_config["EmailSettings:Port"], out var parsedPort))
                port = parsedPort;

            var secureOption = port == 465
                ? MailKit.Security.SecureSocketOptions.SslOnConnect
                : MailKit.Security.SecureSocketOptions.StartTls;

            return (host, port, secureOption);
        }

        public void EnviarNotificacionChat(string emailDestino, string nombreDestinatario, string nombreRemitente, string previewMensaje)
        {
            string key = $"chat_{emailDestino}";

            if (_spamControl.TryGetValue(key, out var existing))
            {
                existing.cts.Cancel();
            }

            var cts = new CancellationTokenSource();
            _spamControl[key] = (DateTime.UtcNow, cts);

            _ = Task.Run(async () =>
            {
                try
                {
                    await Task.Delay(45000, cts.Token);
                    if (cts.Token.IsCancellationRequested) return;

                    await EnviarEmailChativo(emailDestino, nombreDestinatario, nombreRemitente, previewMensaje);
                }
                catch (OperationCanceledException)
                {
                    // Cancelado por nuevo mensaje, no es error
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[EMAIL CHAT] ERROR: {ex.Message}");
                }
                finally
                {
                    _spamControl.TryRemove(key, out _);
                }
            });
        }

        private async Task EnviarEmailChativo(string emailDestino, string nombreDestinatario, string nombreRemitente, string previewMensaje)
        {
            var mensaje = new MimeMessage();
            mensaje.From.Add(new MailboxAddress("UniService", _config["EmailSettings:Email"]));
            mensaje.To.Add(new MailboxAddress(nombreDestinatario, emailDestino));
            mensaje.Subject = $"Nuevo mensaje de {nombreRemitente} - UniService";

            var builder = new BodyBuilder();

            string htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;'>
                <div style='max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px;'>
                    <h2 style='color: #2ecc71;'>Tienes un nuevo mensaje</h2>
                    <p><strong>{nombreRemitente}</strong> te ha enviado un mensaje:</p>
                    <div style='background: #f0f0f0; padding: 12px; border-radius: 8px; margin: 16px 0;'>
                        <p style='margin: 0; color: #333;'>{previewMensaje}</p>
                    </div>
                    <p style='color: #666; font-size: 14px;'>Inicia sesión en UniService para responder.</p>
                    <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                    <p style='color: #999; font-size: 12px;'>UniService &copy; {DateTime.Now.Year}</p>
                </div>
            </body>
            </html>";

            builder.HtmlBody = htmlBody;
            mensaje.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                var (host, port, secureOption) = GetSmtpConfig();
                Console.WriteLine($"[SMTP] Conectando a {host}:{port}...");
                await client.ConnectAsync(host, port, secureOption);

                await client.AuthenticateAsync(
                    _config["EmailSettings:Email"],
                    _config["EmailSettings:Password"]
                );

                await client.SendAsync(mensaje);
                Console.WriteLine($"[EMAIL CHAT] Correo enviado a {emailDestino}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL CHAT] ERROR SMTP: {ex.Message}");
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }

        public async Task EnviarNotificacionSolicitud(
            string emailProveedor,
            string nombreProveedor,
            string nombreCliente,
            string tituloServicio,
            string tipoServicio,
            string descripcion,
            string presupuesto = "",
            string urgencia = "")
        {
            var mensaje = new MimeMessage();
            mensaje.From.Add(new MailboxAddress("UniService", _config["EmailSettings:Email"]));
            mensaje.To.Add(new MailboxAddress(nombreProveedor, emailProveedor));
            mensaje.Subject = $"Nueva solicitud de servicio - UniService";

            var builder = new BodyBuilder();

            // 1. Buscar la plantilla en wwwroot/templates
            string pathHtml = Path.Combine(_env.WebRootPath, "templates", "email_solicitud.html");

            if (!File.Exists(pathHtml))
            {
                throw new FileNotFoundException($"No se encontró la plantilla en: {pathHtml}");
            }

            string htmlBody = await File.ReadAllTextAsync(pathHtml);

            // 2. Reemplazar los placeholders con la información real
            string presupuestoTexto = string.IsNullOrEmpty(presupuesto) ? "No especificado" : $"${presupuesto}";
            string urgenciaTexto = string.IsNullOrEmpty(urgencia) ? "Normal" : urgencia;

            htmlBody = htmlBody.Replace("{{nombreProveedor}}", nombreProveedor)
                               .Replace("{{nombreCliente}}", nombreCliente)
                               .Replace("{{tituloServicio}}", tituloServicio)
                               .Replace("{{tipoServicio}}", tipoServicio)
                               .Replace("{{descripcion}}", descripcion)
                               .Replace("{{presupuesto}}", presupuestoTexto)
                               .Replace("{{urgencia}}", urgenciaTexto);

            // 3. Embeber el logo
            string pathLogo = Path.Combine(_env.WebRootPath, "img", "logo_uniservice.png");
            if (File.Exists(pathLogo))
            {
                var image = builder.LinkedResources.Add(pathLogo);
                image.ContentId = "logo_uniservice";
            }

            builder.HtmlBody = htmlBody;
            mensaje.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                var (host, port, secureOption) = GetSmtpConfig();
                Console.WriteLine($"[SMTP] Conectando a {host}:{port}...");
                await client.ConnectAsync(host, port, secureOption);

                await client.AuthenticateAsync(
                    _config["EmailSettings:Email"],
                    _config["EmailSettings:Password"]
                );

                Console.WriteLine("Enviando correo...");

                await client.SendAsync(mensaje);

                Console.WriteLine("Correo enviado correctamente");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR SMTP: {ex.Message}");
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }

        public async Task EnviarCodigoVerificacion(string emailDestino, string codigo)
        {
            var mensaje = new MimeMessage();

            // Configuraci�n del Remitente usando EmailSettings del JSON
            mensaje.From.Add(new MailboxAddress("UniService", _config["EmailSettings:Email"]));
            mensaje.To.Add(new MailboxAddress("", emailDestino));
            mensaje.Subject = "Verifica tu cuenta - UniService";

            var builder = new BodyBuilder();

            // 1. Cargar la plantilla HTML desde wwwroot/templates
            string pathHtml = Path.Combine(_env.WebRootPath, "templates", "email_verificacion.html");

            if (!File.Exists(pathHtml))
            {
                throw new FileNotFoundException("No se encontr� la plantilla HTML en la ruta: " + pathHtml);
            }

            string htmlBody = await File.ReadAllTextAsync(pathHtml);

            // 2. Inyectar el c�digo din�mico
            htmlBody = htmlBody.Replace("{{codigo}}", codigo);

            // 3. Embeber el logo local mediante Content-ID (CID)
            string pathLogo = Path.Combine(_env.WebRootPath, "img", "logo_uniservice.png");

            if (File.Exists(pathLogo))
            {
                var image = builder.LinkedResources.Add(pathLogo);
                image.ContentId = "logo_uniservice";
            }

            builder.HtmlBody = htmlBody;
            mensaje.Body = builder.ToMessageBody();

            // 4. Configuraci�n y env�o mediante SMTP
            using var client = new MailKit.Net.Smtp.SmtpClient();

            try
            {
                var (host, port, secureOption) = GetSmtpConfig();
                Console.WriteLine($"[SMTP] Conectando a {host}:{port}...");
                await client.ConnectAsync(host, port, secureOption);

                await client.AuthenticateAsync(
                    _config["EmailSettings:Email"],
                    _config["EmailSettings:Password"]
                );

                await client.SendAsync(mensaje);
            }
            finally
            {
                await client.DisconnectAsync(true);
                client.Dispose();
            }
        }
        public async Task EnviarNotificacionNuevoServicio(
        string emailAdmin,
        string nombreAdmin,
        string nombreProveedor,
        string tituloServicio,
        int idServicio)
        {
            var mensaje = new MimeMessage();
            mensaje.From.Add(new MailboxAddress("UniService", _config["EmailSettings:Email"]));
            mensaje.To.Add(new MailboxAddress(nombreAdmin, emailAdmin));
            mensaje.Subject = $"Nuevo servicio pendiente de revisión - UniService";

            var builder = new BodyBuilder();
            builder.HtmlBody = $@"
    <html>
    <body style='font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;'>
        <div style='max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px;'>
            <h2 style='color: #f59e0b;'>⏳ Nuevo servicio pendiente</h2>
            <p>El usuario <strong>{nombreProveedor}</strong> ha enviado un nuevo servicio para aprobación:</p>
            <div style='background: #f0f0f0; padding: 14px; border-radius: 8px; margin: 16px 0;'>
                <p style='margin: 0; font-size: 1rem;'><strong>{tituloServicio}</strong></p>
                <p style='margin: 6px 0 0; color: #666; font-size: 0.85rem;'>ID del servicio: #{idServicio}</p>
            </div>
            <p style='color: #555;'>Ingresa al panel de administración para revisar y aprobar o rechazar el servicio.</p>
            <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
            <p style='color: #999; font-size: 12px;'>UniService &copy; {DateTime.Now.Year}</p>
        </div>
    </body>
    </html>";

            mensaje.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                var (host, port, secureOption) = GetSmtpConfig();
                Console.WriteLine($"[SMTP] Conectando a {host}:{port}...");
                await client.ConnectAsync(host, port, secureOption);
                await client.AuthenticateAsync(_config["EmailSettings:Email"], _config["EmailSettings:Password"]);
                await client.SendAsync(mensaje);
                Console.WriteLine($"[EMAIL] Notificación de nuevo servicio enviada a {emailAdmin}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL] ERROR: {ex.Message}");
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }

        public async Task EnviarResultadoRevision(
    string emailProveedor,
    string nombreProveedor,
    string tituloServicio,
    bool aprobado,
    string? razonRechazo = null)
        {
            var mensaje = new MimeMessage();
            mensaje.From.Add(new MailboxAddress("UniService", _config["EmailSettings:Email"]));
            mensaje.To.Add(new MailboxAddress(nombreProveedor, emailProveedor));
            mensaje.Subject = aprobado
                ? "Tu servicio fue aprobado - UniService"
                : "Tu servicio fue rechazado - UniService";

            string colorTitulo = aprobado ? "#4ac7b6" : "#ef4444";
            string titulo = aprobado ? "¡Tu servicio fue aprobado!" : "Tu servicio fue rechazado";
            string cuerpo = aprobado
                ? $"Tu servicio ha sido revisado por nuestro equipo y ha sido <strong style='color:#4ac7b6;'>aprobado</strong>. Ya está visible para todos los usuarios de UniService."
                : $"Tu servicio ha sido revisado por nuestro equipo y lamentablemente <strong style='color:#ef4444;'>no pudo ser aprobado</strong> en esta ocasión.";

            string bloqueRazon = (!aprobado && !string.IsNullOrEmpty(razonRechazo))
                ? $@"<div style='background-color:#1a0a0a;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:20px 0;'>
                <p style='color:#ef4444;font-size:13px;font-weight:700;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:0.5px;'>Motivo del rechazo</p>
                <p style='color:#ffffff;font-size:14px;line-height:1.6;margin:0;opacity:0.9;'>{razonRechazo}</p>
             </div>"
                : "";

            string bloqueExtra = aprobado
                ? @"<div style='text-align:center;margin:24px 0 8px 0;'>
                <a href='https://localhost:5173/home'
                   style='background-color:#4ac7b6;color:#031424;padding:14px 32px;text-decoration:none;border-radius:10px;font-weight:bold;font-size:16px;display:inline-block;'>
                    Ver mi servicio
                </a>
            </div>"
                : @"<p style='color:#ffffff;font-size:14px;line-height:1.6;opacity:0.75;margin:16px 0 0 0;'>
                Puedes crear un nuevo servicio corrigiendo los puntos mencionados y enviarlo nuevamente para revisión.
            </p>";

            string pathLogo = Path.Combine(_env.WebRootPath, "img", "logo_uniservice.png");

            var builder = new BodyBuilder();

            if (System.IO.File.Exists(pathLogo))
            {
                var image = builder.LinkedResources.Add(pathLogo);
                image.ContentId = "logo_uniservice";
            }

            builder.HtmlBody = $@"
<!DOCTYPE html>
<html lang='es'>
<body style='margin:0;padding:0;background-color:#031424;font-family:""Helvetica Neue"",Helvetica,Arial,sans-serif;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color:#031424;'>
        <tr>
            <td align='center' style='padding:20px 0;'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='max-width:500px;margin:0 auto;background-color:#051a2d;border-radius:16px;overflow:hidden;border:1px solid #10304a;'>
                    <!-- Logo -->
                    <tr>
                        <td align='center' style='padding:36px 40px 20px 40px;'>
                            <img src='cid:logo_uniservice' alt='UniService Logo' style='width:300px;height:auto;display:block;margin:0 auto;'>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='padding:0;'>
                            <div style='height:1px;background:#10304a;margin:0 40px;'></div>
                        </td>
                    </tr>
                    <!-- Contenido -->
                    <tr>
                        <td align='left' style='padding:28px 40px 20px 40px;'>
                            <h2 style='color:{colorTitulo};font-size:22px;font-weight:700;margin:0 0 12px 0;letter-spacing:-0.5px;'>{titulo}</h2>
                            <p style='color:#ffffff;font-size:15px;line-height:1.7;margin:0 0 20px 0;opacity:0.85;'>
                                Hola, <strong style='color:#4ac7b6;'>{nombreProveedor}</strong>.
                            </p>

                            <!-- Card del servicio -->
                            <div style='background-color:#031424;border-radius:14px;padding:24px;margin-bottom:20px;border:1px solid #10304a;'>
                                <p style='color:#ffffff;font-size:13px;opacity:0.5;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:0.5px;'>Servicio</p>
                                <h3 style='color:#4ac7b6;font-size:18px;margin:0 0 16px 0;'>{tituloServicio}</h3>
                                <p style='color:#ffffff;font-size:14px;line-height:1.7;margin:0;opacity:0.85;'>{cuerpo}</p>
                            </div>

                            {bloqueRazon}
                            {bloqueExtra}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align='center' style='padding:16px 20px;background-color:#031424;border-top:1px solid #10304a;'>
                            <p style='color:#4ac7b6;font-size:12px;margin:0;font-weight:600;opacity:0.8;'>© {DateTime.Now.Year} UniService. Tu socio de confianza.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

            mensaje.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                var (host, port, secureOption) = GetSmtpConfig();
                Console.WriteLine($"[SMTP] Conectando a {host}:{port}...");
                await client.ConnectAsync(host, port, secureOption);
                await client.AuthenticateAsync(
                    _config["EmailSettings:Email"],
                    _config["EmailSettings:Password"]);
                await client.SendAsync(mensaje);
                Console.WriteLine($"[EMAIL] Resultado de revisión enviado a {emailProveedor}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL] ERROR al enviar resultado: {ex.Message}");
                throw;
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
    }
}
