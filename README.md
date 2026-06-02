<div align="center">
<br>
<!-- LOGO -->
<img src="./frontend/src/img/Logo+name_color_gnoBG_email.png" alt="UniServices Logo" width="700"/>
<!-- ESLOGAN -->
<h3><em>Convierte tu conocimiento en oportunidades.<br>La plataforma segura para el intercambio estudiantil.</em></h3>
<br><br>
<!-- BADGES ROW 1 -->
<img src="https://img.shields.io/badge/version-1.2.5-6366F1?style=for-the-badge&logo=git&logoColor=white" alt="version"/>
<img src="https://img.shields.io/badge/estado-updating-10B981?style=for-the-badge&logo=checkmarx&logoColor=white" alt="updating"/>
<img src="https://img.shields.io/badge/stack-Full Stack-F59E0B?style=for-the-badge" alt="licencia"/>
<br><br>
<!-- BADGES ROW 2 -- STACK -->
<img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/.NET-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt=".NET"/>
<img src="https://img.shields.io/badge/C%23-239120?style=flat-square&logo=csharp&logoColor=white" alt="C#"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
<br><br>

---

</div>

<h2>Objetivo del Proyecto</h2>
<p>
  <strong>UniService</strong> nace como una solucion tecnologica para profesionalizar el intercambio de conocimientos y servicios dentro del ambito universitario. El objetivo principal es erradicar la informalidad de los grupos de redes sociales, proporcionando un entorno centralizado donde los estudiantes pueden ofrecer tutorias, proyectos y asesorias tecnicas de manera organizada y confiable.
</p>

<h2>Publico Objetivo</h2>
<ul>
  <li><strong>Estudiantes Prestadores:</strong> Estudiantes de ingenieria y otras facultades en Valledupar que buscan monetizar sus habilidades academicas o tecnicas.</li>
  <li><strong>Estudiantes Usuarios:</strong> Miembros de la comunidad universitaria que requieren apoyo academico verificado y de calidad.</li>
  <li><strong>Comunidad Academica:</strong> Usuarios interesados en un repositorio de guias y material de estudio compartido.</li>
</ul>

<hr />

<h2>Desarrollo y Arquitectura</h2>
<p>
  El proyecto esta construido bajo una arquitectura de <strong>Fullstack .NET + React</strong>, optimizada para la escalabilidad y el despliegue rapido:
</p>

<ul>
  <li><strong>Frontend:</strong> Desarrollado con <strong>React 18</strong> y <strong>Vite</strong> para una interfaz de usuario agil y reactiva. Se enfoca en componentes modulares y estilos limpios para una experiencia joven. Incluye Bootstrap Icons y SignalR para chat en tiempo real.</li>
  <li><strong>Backend:</strong> API construida con <strong>.NET 8 (ASP.NET Core)</strong> que gestiona la logica de autenticacion con JWT y Google OAuth, envio de correos mediante <strong>MailKit</strong> y almacenamiento en <strong>Supabase Storage</strong>.</li>
  <li><strong>Base de Datos:</strong> <strong>PostgreSQL</strong> en Supabase, garantizando integridad transaccional y perfiles verificados.</li>
  <li><strong>Base de Datos:</strong> <strong>PostgreSQL</strong> en Supabase, garantizando integridad transaccional y perfiles verificados.</li>
</ul>

<hr />
<br>

<p align="center">
  <img src="./frontend/src/img/Img_Read_me.png" alt="UniService Banner" width="750" style="border-radius: 10px;">
</p>

<h2 align="center">Ejecucion y Puesta en marcha</h2>
<p>Para poner en marcha el ecosistema completo de desarrollo:</p>
<br>
<p>1. Iniciar el frontend (desde la raiz):</p>
<pre><code>npm run dev</code></pre>
<p>2. Iniciar la API desde Visual Studio (abrir <code>UniserviceAPI/UniserviceAPI.sln</code> y presionar F5) o con:</p>
<pre><code>dotnet run --project UniserviceAPI/UniserviceAPI</code></pre>
<br>
<p><em>El frontend corre en puerto 5173 y la API en puerto 5165. Vite redirige automaticamente las peticiones /api/* a la API.</em></p>

<hr />

<h2 align="center">
  Hecho por estudiantes, para estudiantes.<br>
  <sub>Valledupar, Cesar, Colombia.</sub>
</h2>

<p align="center">
  <sub><strong>UniService</strong> - Construido por estudiantes para transformar la vida universitaria.</sub>
</p>
