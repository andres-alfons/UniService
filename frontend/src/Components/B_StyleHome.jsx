// ─── B_StyleHome.jsx ─────────────────────────────────────────────────────────
// Botón flotante para alternar entre tema oscuro y claro.
// Almacena la preferencia en localStorage y aplica el atributo data-theme
// en <html> para que puedas escribir tu CSS con [data-theme="oscuro"] y
// [data-theme="claro"].
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

export default function BotonTema() {
  const [temaOscuro, setTemaOscuro] = useState(true);
  const [transicionando, setTransicionando] = useState(false);
  const overlayRef = useRef(null);

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
    if (transicionando) return;

    setTransicionando(true);
    const targetOscuro = !temaOscuro;

    const overlay = document.createElement("div");
    overlay.className = "theme-transition-overlay";
    if (targetOscuro) {
      overlay.style.setProperty("--overlay-bg1", "#07070f");
      overlay.style.setProperty("--overlay-bg2", "#080816");
      overlay.style.setProperty("--decor-dot", "rgba(255,255,255,0.08)");
      overlay.style.setProperty("--decor-blob", "rgba(255,255,255,0.10)");
      overlay.style.setProperty("--decor-ring", "rgba(255,255,255,0.16)");
      overlay.style.setProperty("--decor-ring2", "rgba(255,255,255,0.12)");
      overlay.style.setProperty("--decor-line", "rgba(255,255,255,0.12)");
    } else {
      overlay.style.setProperty("--overlay-bg1", "#b8b9be");
      overlay.style.setProperty("--overlay-bg2", "#c0c2c5");
      overlay.style.setProperty("--decor-dot", "rgba(0,0,0,0.12)");
      overlay.style.setProperty("--decor-blob", "rgba(0,0,0,0.14)");
      overlay.style.setProperty("--decor-ring", "rgba(0,0,0,0.20)");
      overlay.style.setProperty("--decor-ring2", "rgba(0,0,0,0.16)");
      overlay.style.setProperty("--decor-line", "rgba(0,0,0,0.16)");
    }
    // Elementos decorativos
    const grid = document.createElement("div");
    grid.className = "overlay-grid";
    overlay.appendChild(grid);
    const blob2 = document.createElement("div");
    blob2.className = "overlay-blob2";
    overlay.appendChild(blob2);
    const blob3 = document.createElement("div");
    blob3.className = "overlay-blob3";
    overlay.appendChild(blob3);
    const ring2 = document.createElement("div");
    ring2.className = "overlay-ring2";
    overlay.appendChild(ring2);
    const ring3 = document.createElement("div");
    ring3.className = "overlay-ring3";
    overlay.appendChild(ring3);
    const ring4 = document.createElement("div");
    ring4.className = "overlay-ring4";
    overlay.appendChild(ring4);
    const ring5 = document.createElement("div");
    ring5.className = "overlay-ring5";
    overlay.appendChild(ring5);
    const lineV = document.createElement("div");
    lineV.className = "overlay-line-v";
    overlay.appendChild(lineV);
    const lineH = document.createElement("div");
    lineH.className = "overlay-line-h";
    overlay.appendChild(lineH);
    const lineDiag = document.createElement("div");
    lineDiag.className = "overlay-line-diag";
    overlay.appendChild(lineDiag);
    const cross = document.createElement("div");
    cross.className = "overlay-cross";
    overlay.appendChild(cross);
    const plus = document.createElement("div");
    plus.className = "overlay-plus";
    overlay.appendChild(plus);
    const diamond = document.createElement("div");
    diamond.className = "overlay-diamond";
    overlay.appendChild(diamond);
    const dot1 = document.createElement("div");
    dot1.className = "overlay-dotlarge";
    overlay.appendChild(dot1);
    const dot2 = document.createElement("div");
    dot2.className = "overlay-dotlarge2";
    overlay.appendChild(dot2);
    const texto = document.createElement("div");
    texto.className = "overlay-texto";
    texto.textContent = "CAMBIANDO TEMA";
    overlay.appendChild(texto);
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    requestAnimationFrame(() => {
      overlay.classList.add("animating");
    });

    // Switch theme at midpoint (when fully covered)
    setTimeout(() => {
      setTemaOscuro(targetOscuro);
      const temaAttr = targetOscuro ? "oscuro" : "claro";
      document.documentElement.setAttribute("data-theme", temaAttr);
      localStorage.setItem("tema", temaAttr);
    }, 1800);

    // Remove overlay after animation
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
      overlayRef.current = null;
      setTransicionando(false);
    }, 3000);
  };

  return (
    <div className="contenedor-tema">
      <button
        className="boton-tema"
        onClick={alternarTema}
        disabled={transicionando}
        title={temaOscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      >
        <i className={`bi ${temaOscuro ? "bi-sun-fill" : "bi-moon-fill"}`}></i>
      </button>
    </div>
  );
}
