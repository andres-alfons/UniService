// Por qué es seguro: hechos que la plataforma cumple de verdad (verificación del correo,
// revisión de cada servicio, reseñas atadas a un trabajo completado, reportes).
const FICHAS = [
  { titulo: "Solo correos @unicesar.edu.co", texto: "Cada cuenta confirma su correo institucional con un código de 6 dígitos antes de existir." },
  { titulo: "Cada servicio pasa revisión", texto: "Un administrador lo aprueba antes de que aparezca en la cartelera, y otra vez si lo editan." },
  { foto: "/assets/rio-guatapuri-valledupar.jpg", alt: "El río Guatapurí a su paso por Valledupar, con piedras en la orilla y bañistas", pie: "Río Guatapurí, Valledupar" },
  { titulo: "Reseñas de quien contrató", texto: "Solo puede calificar quien tuvo una solicitud completada con ese servicio." },
  { foto: "/assets/sierra-nevada-de-santa-marta.jpg", alt: "Los picos nevados de la Sierra Nevada de Santa Marta sobre la vegetación del Cesar", pie: "Sierra Nevada, vista desde el Cesar" },
  { titulo: "Reportar es un botón", texto: "Fraude, acoso o un servicio engañoso: el equipo lo revisa y puede suspender la cuenta." },
];

export default function Confianza() {
  return (
    <section className="us-campo us-campo--amarillo" aria-labelledby="confianza-titulo">
      <div className="us-fichas us-ancho">
        <div className="us-ficha us-ficha--cabeza" data-revela>
          <h2 id="confianza-titulo">Entre gente de la U</h2>
        </div>
        {FICHAS.map((f, i) =>
          f.foto ? (
            <figure className="us-ficha us-ficha--foto" key={f.foto} data-revela style={{ "--i": i + 1 }}>
              <img src={f.foto} alt={f.alt} width="960" height="720" loading="lazy" decoding="async" />
              <figcaption>{f.pie}</figcaption>
            </figure>
          ) : (
            <div className="us-ficha" key={f.titulo} data-revela style={{ "--i": i + 1 }}>
              <strong>{f.titulo}</strong>
              <p>{f.texto}</p>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
