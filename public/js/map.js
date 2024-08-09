

document.addEventListener('DOMContentLoaded', () => {
  mapboxgl.accessToken = mapToken;

  const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: listing.geometry.coordinates,
      zoom: 8
  });

  // Create a new marker
  const marker1 = new mapboxgl.Marker()
      .setLngLat(listing.geometry.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }) // Create a popup with an offset
          .setHTML(`<h4>${listing.location}</h4><p>Exact Location Provided</p>`) // Correct template literal syntax
      )
      .addTo(map);
});
