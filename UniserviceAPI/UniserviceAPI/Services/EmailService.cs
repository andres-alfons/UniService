using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;

namespace UniserviceAPI.Services
{
    public class EmailService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public EmailService(IWebHostEnvironment env, IConfiguration config)
        {
            _env = env;
            _config = config;
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

            string presupuestoTexto = string.IsNullOrEmpty(presupuesto) ? "No especificado" : $"${presupuesto}";
            string urgenciaTexto = string.IsNullOrEmpty(urgencia) ? "Normal" : urgencia;

            var builder = new BodyBuilder();

            string pathLogo = Path.Combine(_env.WebRootPath, "img", "logo_uniservice.png");
            string logoCid = null;

            if (File.Exists(pathLogo))
            {
                var imageResource = builder.LinkedResources.Add(pathLogo);
                logoCid = imageResource.ContentId = "logo_uniservice";
            }

            string logoHtml = logoCid != null
                ? $"<img src=\"cid:{logoCid}\" alt=\"UniService\" style=\"width:200px;height:auto;display:block;margin:0 auto;\" />"
                : "<h1 style=\"color:#4ac7b6;margin:0;font-size:28px;\">UniService</h1>";

            builder.HtmlBody = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
            </head>
            <body style=""margin:0;padding:0;background-color:#070d16;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;"">
                <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" border=""0"" style=""background-color:#070d16;"">
                    <tr>
                        <td align=""center"" style=""padding:30px 10px;"">
                            <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" border=""0"" style=""max-width:600px;margin:0 auto;background-color:#0d1f33;border-radius:16px;overflow:hidden;border:1px solid #1a2e48;box-shadow:0 8px 32px rgba(0,0,0,0.4);"">
                                <!-- Header con logo -->
                                <tr>
                                    <td align=""center"" style=""padding:30px 30px 20px;background:linear-gradient(135deg,#0a1929 0%,#0d1f33 100%);"">
                                        {logoHtml}
                                        <p style=""color:#8fa3bf;margin:12px 0 0;font-size:14px;"">Plataforma Universitaria de Servicios</p>
                                    </td>
                                </tr>
                                <!-- Divider -->
                                <tr>
                                    <td style=""padding:0 30px;"">
                                        <div style=""height:1px;background:linear-gradient(90deg,transparent,#1a2e48,transparent);""></div>
                                    </td>
                                </tr>
                                <!-- Contenido principal -->
                                <tr>
                                    <td style=""padding:30px;"">
                                        <h2 style=""color:#4ac7b6;font-size:22px;font-weight:700;margin:0 0 8px;"">Hola {nombreProveedor}!</h2>
                                        <p style=""color:#e8eef8;font-size:15px;margin:0 0 20px;line-height:1.6;"">
                                            Tienes una nueva solicitud de servicio de parte de <strong style=""color:#4ac7b6;"">{nombreCliente}</strong>.
                                        </p>
                                        
                                        <!-- Card del servicio -->
                                        <div style=""background-color:#0a1929;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #4ac7b6;"">
                                            <h3 style=""color:#ffffff;font-size:18px;font-weight:600;margin:0 0 14px;"">{tituloServicio}</h3>
                                            
                                            <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" border=""0"">
                                                <tr>
                                                    <td style=""padding:6px 0;color:#8fa3bf;font-size:13px;"">
                                                        <strong style=""color:#e8eef8;"">Tipo:</strong> {tipoServicio}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style=""padding:6px 0;color:#8fa3bf;font-size:13px;"">
                                                        <strong style=""color:#e8eef8;"">Presupuesto:</strong> <span style=""color:#f5c842;font-weight:600;"">{presupuestoTexto}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style=""padding:6px 0;color:#8fa3bf;font-size:13px;"">
                                                        <strong style=""color:#e8eef8;"">Urgencia:</strong> {urgenciaTexto}
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <div style=""background:#070d16;border-radius:8px;padding:12px;margin-top:14px;"">
                                                <p style=""color:#8fa3bf;font-size:12px;margin:0 0 4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;"">Descripcin:</p>
                                                <p style=""color:#e8eef8;font-size:14px;line-height:1.5;margin:0;"">{descripcion}</p>
                                            </div>
                                        </div>
                                        
                                        <!-- CTA Button -->
                                        <div style=""text-align:center;margin:28px 0 10px;"">
                                            <a href=""https://localhost:5173/home#solicitudes""
                                               style=""display:inline-block;background:linear-gradient(135deg,#0ea5a0,#14c7c1);color:#070d16;padding:14px 36px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 16px rgba(14,165,160,0.3);"">
                                                Ver solicitudes en UniService
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style=""padding:20px 30px;background-color:#070d16;border-top:1px solid #1a2e48;text-align:center;"">
                                        <p style=""color:#4a6080;font-size:12px;margin:0;line-height:1.6;"">
                                            Este es un mensaje automático enviado por <strong style=""color:#4ac7b6;"">UniService</strong>.<br>
                                            Por favor no respondas a este correo.<br>
                                            © 2026 UniService — Tu socio de confianza.
                                        </p>
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