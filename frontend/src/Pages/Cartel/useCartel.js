// Ganchos compartidos por las páginas con el diseño "Cartel".
import { useEffect, useState } from "react";
import { listarServicios } from "../shared/servicios";
import { CHIPS_CATEGORIA, mapaCategoriaId } from "../shared/constantes";

// Activa las entradas: añade .us-js a la raíz y marca con .is-in cada [data-revela]
// cuando entra en pantalla (una sola vez). La foto de portada se pausa fuera de pantalla.
export function useEntradas(raizRef, dependencias = []) {
  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;
    raiz.classList.add("us-js");

    const entradas = new IntersectionObserver(
      (lista) =>
        lista.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            entradas.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    raiz.querySelectorAll("[data-revela]:not(.is-in)").forEach((el) => entradas.observe(el));

    const foto = raiz.querySelector(".us-portada-foto");
    const pausa = foto
      ? new IntersectionObserver(([e]) => raiz.classList.toggle("us-pausado", !e.isIntersecting))
      : null;
    if (foto) pausa.observe(foto);

    return () => {
      entradas.disconnect();
      pausa?.disconnect();
    };
  }, dependencias);
}

// Lo que hay hoy en la cartelera: cuántos servicios por categoría y desde qué precio.
export function useCartelera() {
  const [datos, setDatos] = useState({ total: null, categorias: {} });

  useEffect(() => {
    let vivo = true;
    const categorias = CHIPS_CATEGORIA.filter((c) => mapaCategoriaId[c.valor]);
    Promise.all([
      listarServicios({ porPagina: 1 }),
      ...categorias.map((c) => listarServicios({ categoria: c.valor, porPagina: 1, orden: "precio-menor" })),
    ])
      .then(([todos, ...porCategoria]) => {
        if (!vivo) return;
        setDatos({
          total: todos.total,
          categorias: Object.fromEntries(
            categorias.map((c, i) => [
              c.valor,
              { total: porCategoria[i].total, desde: porCategoria[i].servicios[0] || null },
            ]),
          ),
        });
      })
      .catch(() => vivo && setDatos((d) => ({ ...d, total: d.total ?? 0 })));
    return () => {
      vivo = false;
    };
  }, []);

  return datos;
}
