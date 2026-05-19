import { useState, useEffect, useRef } from 'react';
import { loadGoogleMapsApi, getGoogleMapsUrl } from '../utils/googleMaps';

export default function MapaModal({ lat, lng, direccion, onClose }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    loadGoogleMapsApi().then(() => {
      const location = { lat: Number(lat), lng: Number(lng) };
      
      const map = new google.maps.Map(mapRef.current, {
        center: location,
        zoom: 16,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
      });

      new google.maps.Marker({
        position: location,
        map,
        title: direccion || 'Ubicación del servicio',
      });

      setMapLoaded(true);
    });
  }, [lat, lng, direccion]);

  if (!lat || !lng) return null;

  return (
    <div className="modal-overlay mapa-modal-overlay" onClick={onClose}>
      <div className="modal-content mapa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mapa-modal-header">
          <h3>
            <i className="bi bi-geo-alt-fill"></i> Ubicación del servicio
          </h3>
          <button className="btn-cerrar" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {direccion && (
          <p className="mapa-modal-direccion">
            <i className="bi bi-signpost-2"></i> {direccion}
          </p>
        )}

        <div className="mapa-container" ref={mapRef} style={{ width: '100%', height: '400px', borderRadius: '12px' }}>
          {!mapLoaded && (
            <div className="mapa-loading">
              <div className="spinner" />
              <p>Cargando mapa...</p>
            </div>
          )}
        </div>

        <div className="mapa-modal-footer">
          <a
            href={getGoogleMapsUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-verde"
          >
            <i className="bi bi-box-arrow-up-right"></i> Abrir en Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
