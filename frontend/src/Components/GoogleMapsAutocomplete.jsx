import { useState, useEffect, useRef } from 'react';
import { initAutocomplete, getMapStaticUrl } from '../utils/googleMaps';

export default function GoogleMapsAutocomplete({ onLocationSelect, initialValue = '' }) {
  const [direccion, setDireccion] = useState(initialValue);
  const [ubicacion, setUbicacion] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;

    let cancelled = false;
    const cleanup = initAutocomplete(inputRef.current);

    cleanup.then((result) => {
      if (cancelled || !result) return;
      
      setDireccion(result.direccion);
      setUbicacion({ lat: result.lat, lng: result.lng });
      onLocationSelect?.({
        direccion: result.direccion,
        lat: result.lat,
        lng: result.lng,
        nombre: result.nombre,
      });
    });

    return () => { cancelled = true; };
  }, [onLocationSelect]);

  return (
    <div className="google-maps-autocomplete">
      <div className="form-grupo">
        <label className="form-label">
          <i className="bi bi-geo-alt-fill"></i> Ubicación *
        </label>
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          placeholder="Busca una dirección o lugar..."
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </div>

      {ubicacion && (
        <div className="mapa-preview">
          <img
            src={getMapStaticUrl(ubicacion.lat, ubicacion.lng, 15, 400, 200)}
            alt="Vista previa de ubicación"
            className="mapa-preview-img"
          />
          <span className="mapa-preview-badge">
            <i className="bi bi-check-circle-fill"></i> Ubicación confirmada
          </span>
        </div>
      )}
    </div>
  );
}
