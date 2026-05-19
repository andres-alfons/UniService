const GOOGLE_MAPS_API_KEY = 'AIzaSyBCWHkRgm8a_7mRLXWQlp08RzSvl22mphA';

let mapsLoaded = false;
let loadPromise = null;

export function loadGoogleMapsApi() {
  if (mapsLoaded) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      mapsLoaded = true;
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      mapsLoaded = true;
      resolve(window.google);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function initAutocomplete(inputElement) {
  return new Promise((resolve) => {
    loadGoogleMapsApi().then(() => {
      const autocomplete = new google.maps.places.Autocomplete(inputElement, {
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'co' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          resolve(null);
          return;
        }

        const result = {
          direccion: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          nombre: place.name || '',
        };

        resolve(result);
      });
    });
  });
}

export function getMapStaticUrl(lat, lng, zoom = 15, width = 400, height = 300) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
}

export function getGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
