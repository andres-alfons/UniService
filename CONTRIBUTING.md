<h1 align="center">Contribuyendo a UniService</h1>

<p align="center">
  <strong>Conectando el talento estudiantil en Valledupar, Cesar.</strong><br>
  Gracias por tu interes en colaborar. Este documento define los estandares para mantener la calidad y el proposito de UniService.
</p>

<hr />

<h2>Configuracion del Entorno</h2>

<h3>Requisitos Previos</h3>
<ul>
  <li><strong>.NET 8 SDK</strong></li>
  <li><strong>Node.js</strong> (v18 o superior)</li>

  <li><strong>Git</strong></li>
  <li><strong>Visual Studio 2022</strong> (recomendado) o cualquier editor con soporte C#</li>
</ul>

<h3>Instalacion Rapida</h3>
<ol>
  <li><strong>Fork</strong> del repositorio y clonacion local:
    <pre><code>git clone https://github.com/TU_USUARIO/Proyecto.git</code></pre>
  </li>
  <li><strong>Dependencias del frontend:</strong>
    <pre><code>cd frontend
npm install</code></pre>
  </li>
  <li><strong>Configurar variables de entorno:</strong> Copiar <code>.env.example</code> a <code>.env</code> en la raiz de <code>UniserviceAPI/</code> y completar los valores (conexion a BD, JWT, Google OAuth, email, Supabase).</li>
</ol>

<hr />

<h2>Flujo de Trabajo y Desarrollo</h2>

<h3>Ejecucion</h3>
<p>El proyecto se compone de dos partes que se inician por separado:</p>
<ul>
  <li><strong>Frontend:</strong> <code>cd frontend && npm run dev</code> (puerto 5173)</li>
  <li><strong>API:</strong> Abrir <code>UniserviceAPI/UniserviceAPI.sln</code> en Visual Studio y presionar F5, o ejecutar <code>dotnet run --project UniserviceAPI/UniserviceAPI</code> (puerto 5165)</li>
</ul>
<p>El comando <code>npm run dev</code> en la raiz inicia el frontend. La base de datos se conecta directamente a la instancia configurada en las variables de entorno.</p>

<hr />

<h2>Stack Tecnologico</h2>

<table>
  <tr>
    <th>Capa</th>
    <th>Tecnologias Principales</th>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>.NET 8 (ASP.NET Core), Entity Framework Core 8, Npgsql, JWT Bearer, BCrypt, MailKit, SignalR</td>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>React 18, Vite, React Router DOM 7, Bootstrap Icons, SignalR (@microsoft/signalr)</td>
  </tr>
  <tr>
    <td><strong>Base de Datos</strong></td>
    <td>PostgreSQL + Supabase</td>
  </tr>
  <tr>
    <td><strong>Servicios</strong></td>
    <td>Supabase Storage (imagenes), Google OAuth, MailKit SMTP</td>
  </tr>
</table>

<hr />

<h2>Estandares de Codigo</h2>

<ul>
  <li><strong>Controladores:</strong> Anade logica de API en <code>UniserviceAPI/UniserviceAPI/Controllers/</code>.</li>
  <li><strong>Componentes:</strong> Crea componentes reutilizables en <code>frontend/src/Components/</code>.</li>
  <li><strong>Paginas:</strong> Las vistas principales van en <code>frontend/src/Pages/</code>, organizadas por rol (<code>Principal/</code>, <code>Guest/</code>, <code>Admin/</code>, <code>shared/</code>).</li>
  <li><strong>Estilos:</strong> CSS plano en <code>frontend/src/styles/</code>. Tema claro en <code>frontend/src/styles/light_theme/</code>.</li>
  <li><strong>Llamadas API:</strong> Usar <code>fetch()</code> nativo. No se usa axios.</li>
  <li><strong>Sin TypeScript:</strong> El proyecto usa JavaScript/JSX plano, sin ESLint ni Prettier.</li>
</ul>

<h3>Convenciones de Git</h3>
<p>Utilizamos <strong>Conventional Commits</strong> para un historial limpio:</p>
<ul>
  <li><code>feat:</code> Nueva funcionalidad.</li>
  <li><code>fix:</code> Correccion de errores.</li>
  <li><code>docs:</code> Cambios en documentacion.</li>
  <li><code>style:</code> Ajustes visuales (CSS/Layout).</li>
</ul>

<hr />

<h2>Correo y Seguridad</h2>
<p>Al trabajar con el sistema de autenticacion de <strong>UniService</strong>:</p>
<ol>
  <li>La configuracion SMTP se define en las variables de entorno (<code>EmailSettings__*</code>).</li>
  <li>Las contrasenas se alamacenan con <strong>BCrypt</strong>.</li>
  <li>La autenticacion usa <strong>JWT Bearer tokens</strong> con expiracion configurable.</li>
  <li>El inicio de sesion con Google usa OAuth 2.0.</li>
</ol>

<hr />

<h2>Pull Requests (PRs)</h2>
<ul>
  <li>Describe los cambios realizados y su impacto funcional.</li>
  <li>Adjunta capturas de pantalla si hay cambios en la interfaz.</li>
  <li>Se requiere al menos <strong>una aprobacion</strong> de los mantenedores principales.</li>
</ul>

<hr />

<h2>Estructura del Repositorio</h2>

<pre>
Proyecto/
├── UniserviceAPI/              # Proyecto .NET 8 (Backend)
│   └── UniserviceAPI/
│       ├── Controllers/        # Endpoints de la API
│       ├── Data/               # DbContext y configuracion EF Core
│       ├── DTOs/               # Objetos de transferencia de datos
│       ├── Models/             # Entidades del sistema
│       ├── Services/           # Logica de negocio
│       ├── Hubs/               # SignalR hubs (chat en tiempo real)
│       ├── wwwroot/            # Archivos estaticos
│       ├── Program.cs          # Configuracion del pipeline
│       └── UniserviceAPI.csproj
│
├── frontend/                   # Aplicacion React + Vite
│   ├── src/
│   │   ├── Components/         # Componentes reutilizables
│   │   ├── Pages/              # Vistas principales
│   │   ├── styles/             # Hojas de estilo CSS
│   │   ├── utils/              # Funciones auxiliares
│   │   ├── App.jsx             # Enrutador principal
│   │   └── main.jsx            # Punto de entrada
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/                   # Migraciones SQL (numeradas 01, 02, ...)
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
</pre>

<p align="center">
  <sub><strong>UniService</strong> - Construido por estudiantes para transformar la vida universitaria.</sub>
</p>
