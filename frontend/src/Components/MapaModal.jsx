import { useState, useEffect, useRef } from 'react';
import { loadGoogleMapsApi } from '../utils/googleMaps';

export default function MapaModal({ lat, lng, direccion, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    // Small delay to ensure modal is fully rendered
    const timer = setTimeout(() => {
      loadGoogleMapsApi().then(() => {
        try {
          const location = { lat: Number(lat), lng: Number(lng) };
          
          const map = new google.maps.Map(mapRef.current, {
            center: location,
            zoom: 15,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          });

          mapInstanceRef.current = map;

          new google.maps.Marker({
            position: location,
            map,
            title: direccion || 'Ubicacion del servicio',
          });

          // Trigger resize to fix black screen
          google.maps.event.trigger(map, 'resize');
          map.setCenter(location);

          setMapLoaded(true);
        } catch (err) {
          console.error('Error loading map:', err);
          setError('No se pudo cargar el mapa');
        }
      }).catch((err) => {
        console.error('Error loading Google Maps API:', err);
        setError('Error cargando Google Maps');
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [lat, lng, direccion]);

  if (!lat || !lng) return null;

  return (
    <div className="modal-overlay mapa-modal-overlay" onClick={onClose}>
      <div className="modal-content mapa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mapa-modal-header">
          <h3>
            <i className="bi bi-geo-alt-fill"></i> Ubicacion del servicio
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

        <div className="mapa-container" ref={mapRef}>
          {!mapLoaded && !error && (
            <div className="mapa-loading">
              <div className="spinner" />
              <p>Cargando mapa...</p>
            </div>
          )}
          {error && (
            <div className="mapa-loading">
              <p style={{ color: '#ef4444' }}>{error}</p>
            </div>
          )}
        </div>

        <div className="mapa-modal-footer">
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
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
