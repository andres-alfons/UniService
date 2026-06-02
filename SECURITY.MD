<h1 align="center">Politicas de Seguridad de UniService</h1>

<h2>Versiones Soportadas</h2>

<p>Actualmente se brinda soporte de seguridad a la siguiente version:</p>

<table>
  <tr>
    <th>Version</th>
    <th>Soporte</th>
  </tr>
  <tr>
    <td>1.2.x</td>
    <td>Activo</td>
  </tr>
  <tr>
    <td>< 1.2</td>
    <td>Sin soporte</td>
  </tr>
</table>

<hr />

<h2>Reporte de Vulnerabilidades</h2>

<p>Si descubres una vulnerabilidad de seguridad en UniService, por favor reportala a traves de:</p>
<ol>
  <li><strong>GitHub Issues:</strong> Crea un issue en el repositorio con el label <code>security</code>. Si la vulnerabilidad es critica y no debe ser publica, omite este paso y usa el correo electronico.</li>
  <li><strong>Correo Electronico:</strong> Envia un correo al equipo de desarrollo describiendo el hallazgo, los pasos para reproducirlo y el impacto potencial.</li>
</ol>

<p>Esperamos recibir tu reporte y te garantizamos que:</p>
<ul>
  <li>Recibiras una confirmacion de recepcion dentro de las 48 horas habiles.</li>
  <li>Evaluaremos el reporte y te comunicaremos una estimacion del tiempo de correccion.</li>
  <li>Te mantendremos informado del progreso de la resolucion.</li>
</ul>

<p>Si el reporte es aceptado, trabajaremos en una correccion y publicaremos un aviso de seguridad. Agradecemos tu contribucion a mantener UniService seguro para la comunidad estudiantil.</p>

<hr />

<h2>Practicas de Seguridad Actuales</h2>

<h3>Autenticacion y Autorizacion</h3>
<ul>
  <li>Las contrasenas se alamacenan usando <strong>BCrypt</strong> con factor de costo configurable.</li>
  <li>La autenticacion se maneja con <strong>JWT Bearer tokens</strong> con expiracion por tiempo limitado.</li>
  <li>Soporte de inicio de sesion via <strong>Google OAuth 2.0</strong>.</li>
  <li>El token JWT se almacena en <code>localStorage</code> del navegador.</li>
</ul>

<h3>Comunicaciones</h3>
<ul>
  <li>Las credenciales de SMTP y conexion a base de datos se gestionan mediante variables de entorno.</li>
  <li>El envio de correos electronicos se realiza a traves de <strong>MailKit</strong> con conexion TLS.</li>
  <li>La API se comunica con la base de datos a traves de conexiones seguras configuradas en la cadena de conexion.</li>
</ul>

<h3>Infraestructura</h3>
<ul>
  <li>La base de datos en desarrollo corre en un contenedor Docker aislado.</li>
  <li>En produccion se utiliza <strong>Supabase PostgreSQL</strong> con conexion SSL/TLS.</li>
  <li>Las variables sensibles (JWT Key, credenciales de BD, claves de API) residen en archivos <code>.env</code> que no se incluyen en el repositorio.</li>
</ul>

<h3>Buenas Practicas</h3>
<ul>
  <li>No se exponen secretos ni claves en el codigo fuente.</li>
  <li>Los archivos <code>.env</code> estan incluidos en <code>.gitignore</code>.</li>
  <li>Se sigue el principio de privilegio minimo en las consultas a la base de datos.</li>
</ul>

<hr />

<p align="center">
  <sub><strong>UniService</strong> - Construido por estudiantes para transformar la vida universitaria.</sub>
</p>
