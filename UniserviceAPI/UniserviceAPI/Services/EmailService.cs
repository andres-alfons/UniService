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
            mensaje.Subject = $"📩 Nueva solicitud para tu servicio: {tituloServicio}";

            string presupuestoTexto = string.IsNullOrEmpty(presupuesto) ? "No especificado" : $"${presupuesto}";
            string urgenciaTexto = string.IsNullOrEmpty(urgencia) ? "Normal" : urgencia;

            var builder = new BodyBuilder();

            builder.HtmlBody = $@"
                <div style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif; background: #07111f; padding: 32px 16px; box-sizing: border-box;'>
                  <div style='max-width: 600px; margin: auto; background: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid rgba(74,199,182,0.18);'>

                    <!-- HEADER -->
                    <div style='background: linear-gradient(135deg, #0ea5a0 0%, #4ac7b6 100%); padding: 36px 28px 32px; text-align: center;'>
                      <div style='width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.18); margin: auto; display: flex; align-items: center; justify-content: center;'>
                        <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
                          <rect x='2' y='4' width='20' height='16' rx='2'/>
                          <path d='M2 7l10 7 10-7'/>
                        </svg>
                      </div>
                      <h1 style='color: white; margin: 16px 0 6px; font-size: 26px; font-weight: 700; letter-spacing: -0.3px;'>Nueva Solicitud</h1>
                      <p style='color: rgba(255,255,255,0.88); font-size: 14px; margin: 0;'>Tienes una nueva solicitud en UniService</p>
                    </div>

                    <!-- BODY -->
                    <div style='padding: 32px 28px; color: white;'>

                      <p style='color: #4ac7b6; font-size: 22px; font-weight: 700; margin: 0 0 10px;'>Hola {nombreProveedor} 👋</p>

                      <p style='color: #94a3b8; font-size: 15px; line-height: 1.65; margin: 0 0 24px;'>
                        <strong style='color: white;'>{nombreCliente}</strong> ha enviado una solicitud para tu servicio.
                      </p>

                      <!-- SERVICE CARD -->
                      <div style='background: #1e293b; border: 1px solid rgba(74,199,182,0.18); border-radius: 16px; padding: 22px; margin-bottom: 28px;'>

                        <p style='color: #4ac7b6; font-size: 18px; font-weight: 700; margin: 0 0 18px;'>{tituloServicio}</p>

                        <!-- Row: Tipo -->
                        <table style='width: 100%; border-collapse: collapse;'>
                          <tr style='border-bottom: 1px solid rgba(255,255,255,0.05);'>
                            <td style='padding: 10px 0; color: #64748b; font-size: 14px; width: 50%;'>&#128205; Tipo</td>
                            <td style='padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px; color: white;'>{tipoServicio}</td>
                          </tr>
                          <tr style='border-bottom: 1px solid rgba(255,255,255,0.05);'>
                            <td style='padding: 10px 0; color: #64748b; font-size: 14px;'>&#128176; Presupuesto</td>
                            <td style='padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px; color: #4ac7b6;'>{presupuestoTexto}</td>
                          </tr>
                          <tr>
                            <td style='padding: 10px 0; color: #64748b; font-size: 14px;'>&#9889; Urgencia</td>
                            <td style='padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px; color: white;'>{urgenciaTexto}</td>
                          </tr>
                        </table>

                        <!-- Descripcion -->
                        <div style='margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.04); border-radius: 12px; color: #94a3b8; font-size: 14px; line-height: 1.7;'>
                          {descripcion}
                        </div>

                      </div>

                      <!-- CTA BUTTON -->
                      <div style='text-align: center; margin-top: 4px; margin-bottom: 4px;'>
                        <a href='https://localhost:5173/home#solicitudes'
                           style='display: inline-block; background: linear-gradient(135deg, #4ac7b6, #0ea5a0); color: #07111f; padding: 15px 32px; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700;'>
                          Ver solicitudes &rarr;
                        </a>
                      </div>

                    </div>

                    <!-- FOOTER -->
                    <div style='background: #0b1220; padding: 22px 28px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);'>
                      <p style='color: #475569; font-size: 12px; margin: 0; line-height: 1.7;'>
                        Mensaje automático de UniService &middot; No respondas este correo
                      </p>
                    </div>

                  </div>
                </div>";

            mensaje.Body = builder.ToMessageBody();

            using var client = new SmtpClient();

            try
            {
                Console.WriteLine("Conectando SMTP...");

                await client.ConnectAsync(
                    _config["EmailSettings:Host"],
                    int.Parse(_config["EmailSettings:Port"]),
                    MailKit.Security.SecureSocketOptions.StartTls
                );

                Console.WriteLine("Autenticando SMTP...");

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