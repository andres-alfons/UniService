using Microsoft.EntityFrameworkCore;
using UniServiceAPI.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UniserviceAPI.Services;
using UniserviceAPI.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Cargar variables de entorno desde archivo .env si existe (solo desarrollo local)
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
        
        var parts = trimmed.Split('=', 2);
        if (parts.Length == 2)
        {
            var key = parts[0].Trim();
            var value = parts[1].Trim();
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

// 1. Configuración de Autenticación JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    var key = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrEmpty(key))
        key = Environment.GetEnvironmentVariable("Jwt__Key");
    if (string.IsNullOrEmpty(key))
        key = "uniservice_super_secret_key_2026_segura_12345";
    
    Console.WriteLine($"[CONFIG] JWT Key: {(key.Length >= 16 ? "OK" : "ERROR - clave muy corta")}");
    
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddAuthorization();

// 2. Configuración de Base de Datos (PostgreSQL - Supabase)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

// Agregar parámetros de pooling si no están presentes
if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("Pooling"))
{
    connectionString += ";Pooling=true;Minimum Pool Size=5;Maximum Pool Size=50;Connection Idle Lifetime=300;Connection Pruning Interval=10";
}

if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("[ERROR] No se encontró ConnectionString. Verifica appsettings.json o variables de entorno.");
}
else
{
    Console.WriteLine("[CONFIG] ConnectionString configurada correctamente con pooling optimizado");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
);

builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<SupabaseStorageService>();
builder.Services.AddHttpClient();

// 3. Configuración de CORS
// IMPORTANTE: Se agregan los puertos 5173 y 5174 por si Vite cambia de puerto automáticamente
// Para producción, configurar la variable AllowedOrigins
var allowedOrigins = Environment.GetEnvironmentVariable("AllowedOrigins")
                     ?? "http://localhost:5173,http://localhost:5174,https://uniservice.onrender.com,https://uni-service-omega.vercel.app,https://uni-service-git-main-andres-alfons-projects.vercel.app,https://uni-service-ibtg33vqj-andres-alfons-projects.vercel.app,https://uni-service-2y75ekg9c-andres-alfons-projects.vercel.app";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            var origins = allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(o => o.Trim()).ToArray();
            
            if (origins.Contains("*"))
            {
                policy.SetIsOriginAllowed(_ => true)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials()
                      .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
            }
            else
            {
                policy.WithOrigins(origins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials()
                      .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
            }
        });
});

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value.Errors.Count > 0)
                .Select(e => new { campo = e.Key, error = e.Value.Errors.First().ErrorMessage })
                .ToList();
            
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new
            {
                error = "Datos de entrada inválidos",
                detalles = errors
            });
        };
    });

builder.Services.AddSignalR();
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800; // 50MB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});
builder.Services.AddEndpointsApiExplorer();

// 4. Configuración de Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Escribe: Bearer {tu_token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// --- CONFIGURACIÓN DEL PIPELINE DE HTTP (ORDEN CRÍTICO) ---

// Middleware de manejo de errores global
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var ex = exceptionHandlerPathFeature?.Error;
        
        Console.WriteLine($"[ERROR GLOBAL] {ex?.GetType().Name}: {ex?.Message}");
        Console.WriteLine($"[ERROR GLOBAL] Stack: {ex?.StackTrace}");
        
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        // En producción, no exponer detalles del error
        var isDevelopment = app.Environment.IsDevelopment();
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Error interno del servidor",
            detalle = isDevelopment ? ex?.Message : null,
            timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        });
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseResponseCompression();

app.UseStaticFiles();

// A. EL CORS debe ir antes de cualquier middleware que maneje rutas o seguridad
app.UseCors("AllowReact");

// B. El orden de estos es vital para el funcionamiento de los controladores
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// C. Mantenemos comentada la redirección HTTPS para facilitar la conexión local
// app.UseHttpsRedirection();

app.MapControllers();

app.MapHub<ChatHub>("/chathub");

app.Run();

