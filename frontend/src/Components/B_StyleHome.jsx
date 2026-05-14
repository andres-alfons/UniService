// ─── B_StyleHome.jsx ─────────────────────────────────────────────────────────
// Botón flotante para alternar entre tema oscuro y claro.
// Almacena la preferencia en localStorage y aplica el atributo data-theme
// en <html> para que puedas escribir tu CSS con [data-theme="oscuro"] y
// [data-theme="claro"].
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export default function BotonTema() {
  const [temaOscuro, setTemaOscuro] = useState(true);

  useEffect(() => {
    const temaGuardado = localStorage.getItem("tema");
    if (temaGuardado === "claro") {
      setTemaOscuro(false);
      document.documentElement.setAttribute("data-theme", "claro");
    } else {
      document.documentElement.setAttribute("data-theme", "oscuro");
    }
  }, []);

  const alternarTema = () => {
    const nuevoTema = !temaOscuro;
    setTemaOscuro(nuevoTema);
    const temaAttr = nuevoTema ? "oscuro" : "claro";
    document.documentElement.setAttribute("data-theme", temaAttr);
    localStorage.setItem("tema", temaAttr);
  };

  return (
    <div className="contenedor-tema">
      <button
        className="boton-tema"
        onClick={alternarTema}
        title={temaOscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      >
        <i className={`bi ${temaOscuro ? "bi-sun-fill" : "bi-moon-fill"}`}></i>
      </button>
    </div>
  );
}
