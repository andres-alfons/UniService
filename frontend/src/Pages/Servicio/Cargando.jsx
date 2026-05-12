// Componente de esqueleto de carga (skeleton) para mostrar mientras se cargan datos
// Muestra barras animadas simulando el layout del contenido
function Skeleton() {
  return (
    <div className="skeleton-wrapper">
      {/* Barra simulando un título */}
      <div className="skeleton sk-title" />
      {/* Barras simulando párrafos de texto */}
      <div className="skeleton sk-text" />
      <div className="skeleton sk-text sk-short" />
    </div>
  );
}

export default Skeleton;
