export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWtzaGF0LXRyaXYiLCJhIjoiY2tkdzFjbzBnMHdjcDJ1c2dsMnZoZmliMSJ9.TvRX7m7ZUfzW7D6fPPaNhg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/akshat-triv/ckdw5r6uv2su119nw6vcq9m23',
    scrollZoom: false,
    //   center: [-118.192043, 34.02699],
    //   zoom: 10,
    //   interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //1) Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 50,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
