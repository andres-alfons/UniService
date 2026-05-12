// Elemento de información con etiqueta y valor (ej. correo, teléfono)
const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <div className="info-label">{label}</div>
    <div className="info-value">{value}</div>
  </div>
);

export default InfoItem;
