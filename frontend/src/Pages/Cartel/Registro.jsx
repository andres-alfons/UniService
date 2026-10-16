// El primer paso ya abierto: el visitante escribe su correo institucional aquí mismo
// y el botón lo lleva al registro con el correo puesto. Con sesión iniciada, el mismo
// cuadro empieza a publicar un servicio.
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CORREO = /^[a-z0-9][a-z0-9._+-]*@unicesar\.edu\.co$/i;

export default function Registro({ conSesion = false, onPublicar }) {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [modo, setModo] = useState(conSesion ? "hora" : "pedir");
  const [error, setError] = useState("");

  const enviar = (e) => {
    e.preventDefault();
    if (conSesion) {
      onPublicar({ titulo: titulo.trim(), unidad: modo });
      return;
    }
    if (!CORREO.test(correo.trim())) {
      setError("Escribe tu correo @unicesar.edu.co");
      return;
    }
    navigate(`/login?registro=1&correo=${encodeURIComponent(correo.trim().toLowerCase())}`);
  };

  const opciones = conSesion
    ? [["hora", "Cobro por hora"], ["proyecto", "Cobro por proyecto"]]
    : [["pedir", "Quiero pedir ayuda"], ["ofrecer", "Quiero ofrecer"]];

  return (
    <section className="us-campo us-campo--verde" id="registro" aria-labelledby="registro-titulo">
      <div className="us-registro us-ancho">
        <div className="us-registro-cierre" data-revela>
          <h2 id="registro-titulo" className="us-titulo">
            {conSesion ? <>Publica<br />lo tuyo</> : <>Solo tu<br />correo U</>}
          </h2>
          <p>
            {conSesion
              ? "Escribe el título y elige cómo cobras. En el siguiente paso pones la descripción, el precio y las fotos; un administrador lo revisa antes de publicarlo."
              : "Te enviamos un código de 6 dígitos a tu correo institucional. Con tu nombre, tu teléfono y una contraseña, en dos minutos tienes cuenta."}
          </p>
        </div>

        <img className="us-acordeon" src="/assets/gon-2993.jpg" alt="" width="1920" height="1281" loading="lazy" decoding="async" />

        <form className="us-dialogo" data-ui onSubmit={enviar} noValidate data-revela style={{ "--i": 1 }}>
          <h3>{conSesion ? "Nuevo servicio" : "Crear cuenta"}</h3>
          {conSesion ? (
            <>
              <label htmlFor="us-titulo-servicio">Título del servicio</label>
              <input
                id="us-titulo-servicio"
                className="us-campo-texto"
                value={titulo}
                maxLength={100}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Tutoría de Cálculo Integral"
              />
            </>
          ) : (
            <>
              <label htmlFor="us-correo">Correo institucional</label>
              <input
                id="us-correo"
                className="us-campo-texto"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={correo}
                onChange={(e) => { setCorreo(e.target.value); setError(""); }}
                placeholder="mariajose.pertuz@unicesar.edu.co"
                aria-invalid={!!error}
                aria-describedby={error ? "us-correo-error" : undefined}
              />
              {error && <p className="us-error" id="us-correo-error" role="alert">{error}</p>}
            </>
          )}
          <div className="us-segmento" role="group" aria-label={conSesion ? "Cómo cobras" : "Qué quieres hacer"}>
            {opciones.map(([v, l]) => (
              <button key={v} type="button" aria-pressed={modo === v} onClick={() => setModo(v)}>
                {l}
              </button>
            ))}
          </div>
          <button type="submit" className="us-boton">
            {conSesion ? "Seguir con los detalles" : "Recibir mi código"}
          </button>
        </form>
      </div>
    </section>
  );
}
