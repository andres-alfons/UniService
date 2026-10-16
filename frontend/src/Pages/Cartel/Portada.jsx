// Primera pantalla: a la izquierda la frase y la acción; a la derecha el menú, el cartel
// en dos líneas y la Plaza Alfonso López de Valledupar con la cifra real de servicios.
import { useState } from "react";
import logo from "../../img/logo_color_noBG.png";

export default function Portada({ lineas, texto, accion, enlaces, total }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrar = () => setMenuAbierto(false);

  return (
    <header className="us-portada" id="inicio">
      <a href="#inicio" className="us-marca" aria-label="UniService, inicio">
        <img src={logo} alt="" width="44" height="44" />
        UniService
      </a>

      <nav className={`us-nav${menuAbierto ? " is-abierta" : ""}`} aria-label="Principal">
        <button
          type="button"
          className="us-nav-menu"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((v) => !v)}
        >
          {menuAbierto ? "Cerrar" : "Menú"}
        </button>
        {enlaces.map((e) =>
          e.onClick ? (
            <button key={e.label} type="button" onClick={() => { cerrar(); e.onClick(); }}>
              {e.label}
            </button>
          ) : (
            <a key={e.label} href={e.href} onClick={cerrar}>
              {e.label}
            </a>
          ),
        )}
      </nav>

      <div className="us-portada-cuerpo">
        <h1 className="us-cartel">
          {lineas.map((l, i) => (
            <span className="us-linea" key={l}>
              <span data-line style={{ "--i": i }}>{l}</span>
            </span>
          ))}
        </h1>

        <figure className="us-portada-foto">
          <img
            src="/assets/revolucion-en-marcha.jpg"
            alt="La Plaza Alfonso López de Valledupar, con el monumento Revolución en Marcha y la alcaldía al fondo"
            width="1920"
            height="1420"
            fetchpriority="high"
          />
          <p className="us-cifra" aria-live="polite">
            <strong>{total == null ? "…" : total.toLocaleString("es-CO")}</strong>
            <span>servicios publicados ahora mismo por estudiantes de la UPC</span>
          </p>
          <figcaption className="us-credito-foto">Plaza Alfonso López, Valledupar</figcaption>
        </figure>
      </div>

      <div className="us-portada-charla">
        <p className="us-lead">{texto}</p>
        {accion.onClick ? (
          <button type="button" className="us-boton" onClick={accion.onClick}>
            {accion.label}
          </button>
        ) : (
          <a href={accion.href} className="us-boton">
            {accion.label}
          </a>
        )}
      </div>
    </header>
  );
}
