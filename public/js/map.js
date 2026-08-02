mapboxgl.accessToken = mapToken;
let coords = [77.0738, 28.6388];
if (typeof coordinates !== 'undefined') {
    try {
        const parsed = Array.isArray(coordinates) ? coordinates : JSON.parse(coordinates);
        if (Array.isArray(parsed) && parsed.length === 2) {
            coords = parsed;
        }
    } catch (err) {
        console.warn('Invalid map coordinates, falling back to default', err);
    }
}
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: coords,
    zoom: 9
});

new mapboxgl.Marker({ color: 'red' }) // add a red marker with popup
    .setLngLat(coords)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h5>${listingTitle}</h5><p>${listingLocation}</p>`))
    .addTo(map);