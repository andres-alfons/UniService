import { useState, useEffect, useRef, useCallback } from 'react';
import { loadGoogleMapsApi, getMapStaticUrl } from '../utils/googleMaps';

export default function GoogleMapsAutocomplete({ onLocationSelect, initialValue = '' }) {
  const [direccion, setDireccion] = useState(initialValue);
  const [ubicacion, setUbicacion] = useState(null);
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  // Keep ref in sync
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Initialize autocomplete
  useEffect(() => {
    if (!inputRef.current) return;

    loadGoogleMapsApi().then(() => {
      if (autocompleteRef.current) return; // Already initialized

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'co' },
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const result = {
          direccion: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          nombre: place.name || '',
        };

        setDireccion(result.direccion);
        setUbicacion({ lat: result.lat, lng: result.lng });
        onLocationSelectRef.current?.(result);
        updateMap(result.lat, result.lng);
      });
    });

    return () => {
      autocompleteRef.current = null;
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    loadGoogleMapsApi().then(() => {
      if (mapInstanceRef.current) return; // Already initialized

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 4.6, lng: -73.2 },
        zoom: 6,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else {
          markerRef.current = new google.maps.Marker({
            position: { lat, lng },
            map,
            draggable: true,
          });

          markerRef.current.addListener('dragend', (ev) => {
            const newLat = ev.latLng.lat();
            const newLng = ev.latLng.lng();
            reverseGeocode(newLat, newLng);
          });
        }

        reverseGeocode(lat, lng);
      });
    });
  }, []);

  const updateMap = useCallback((lat, lng) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter({ lat, lng });
    mapInstanceRef.current.setZoom(15);

    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      markerRef.current = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
      });

      markerRef.current.addListener('dragend', (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        reverseGeocode(newLat, newLng);
      });
    }
  }, []);

  const reverseGeocode = useCallback((lat, lng) => {
    loadGoogleMapsApi().then(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setDireccion(results[0].formatted_address);
          setUbicacion({ lat, lng });
          onLocationSelectRef.current?.({
            direccion: results[0].formatted_address,
            lat,
            lng,
            nombre: '',
          });
        }
      });
    });
  }, []);

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
          placeholder="Busca una dirección..."
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </div>

      <div className="mapa-preview-wrapper">
        <div className="mapa-preview mapa-clickable" ref={mapRef} />
        
        {!ubicacion && (
          <div className="mapa-instruccion-overlay">
            <i className="bi bi-geo-alt"></i>
            <p>Haz clic en el mapa para seleccionar la ubicación</p>
            <small>O arrastra el marcador para ajustar</small>
          </div>
        )}
        
        {ubicacion && (
          <span className="mapa-preview-badge">
            <i className="bi bi-check-circle-fill"></i> Ubicación confirmada
          </span>
        )}
      </div>
    </div>
  );
}
