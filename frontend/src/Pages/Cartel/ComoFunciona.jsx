// El recorrido de una solicitud como una sola barra de progreso: el ancho de cada tramo
// sigue lo que de verdad tarda (pedir es un instante; el trabajo es casi todo).
const TRAMOS = [
  { duracion: "Dos minutos", texto: "Primero pides: cuentas qué necesitas, para cuándo y tu presupuesto.", peso: 1, color: "var(--amarillo)" },
  { duracion: "Unas horas", texto: "Luego el estudiante acepta, rechaza o te propone otro precio.", peso: 2.4, color: "var(--verde)" },
  { duracion: "Lo que dure el trabajo", texto: "Después lo hacen juntos y hablan por el chat de UniService.", peso: 6, color: "var(--papel)" },
  { duracion: "Un minuto", texto: "Al final calificas, y tu reseña queda en su perfil.", peso: 1, color: "var(--amarillo)" },
];

export default function ComoFunciona() {
  return (
    <section className="us-campo us-campo--negro" id="como" aria-labelledby="como-titulo">
      <div className="us-ancho">
        <h2 id="como-titulo" className="us-titulo" data-revela>
          Así se pide ayuda
        </h2>
        <ol className="us-barra" data-ui style={{ listStyle: "none", padding: 0 }}>
          {TRAMOS.map((t, i) => (
            <li className="us-tramo" key={t.duracion} style={{ flexGrow: t.peso, flexBasis: 0, "--i": i }} data-revela>
              <div className="us-tramo-bloque" style={{ background: t.color }}>
                {t.duracion}
              </div>
              <p>{t.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
