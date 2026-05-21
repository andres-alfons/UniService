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

        public async Task EnviarNotificacionChat(string emailDestino, string nombreDestinatario, string nombreRemitente, string previewMensaje)
        {
            string key = $"chat_{emailDestino}";

            if (_spamControl.TryGetValue(key, out var existing))
            {
                existing.cts.Cancel();
            }

            var cts = new CancellationTokenSource();
            _spamControl[key] = (DateTime.UtcNow, cts);

            await Task.Delay(45000, cts.Token).ContinueWith(async _ =>
            {
                if (cts.Token.IsCancellationRequested) return;

                await EnviarEmailChativo(emailDestino, nombreDestinatario, nombreRemitente, previewMensaje);

                _spamControl.TryRemove(key, out var _);
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
                await client.ConnectAsync(
                    _config["EmailSettings:Host"],
                    int.Parse(_config["EmailSettings:Port"]),
                    MailKit.Security.SecureSocketOptions.StartTls
                );

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
                await client.ConnectAsync(
                    _config["EmailSettings:Host"],
                    int.Parse(_config["EmailSettings:Port"]),
                    MailKit.Security.SecureSocketOptions.StartTls
                );

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
                // Conexi�n usando las llaves exactas de tu appsettings.json


                await client.ConnectAsync(
                    _config["EmailSettings:Host"],
                    int.Parse(_config["EmailSettings:Port"]),
                    MailKit.Security.SecureSocketOptions.StartTls
                );

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
    }
}