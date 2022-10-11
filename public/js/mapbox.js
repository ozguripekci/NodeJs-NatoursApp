

export const displayMap = (locations) => {
    
    mapboxgl.accessToken = 'pk.eyJ1Ijoib3pndXJpcGVrY2kiLCJhIjoiY2w5MWI5dnkxMTJ0bjNvbXQ2Z3loM3NvbCJ9.x90Vlap-mV8PTidtHr2HvQ';
    
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/ozguripekci/cl91c1b6g008314nrnfsjomwo',
      scrollZoom:false,
      // interactive: false
      // center: [-118.113491, 34.111745],
      // zoom: 7, 
    
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach(loc => {
        // Create marker
        const el= document.createElement('div');
        el.className = 'marker';
    
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        })
        .setLngLat(loc.coordinates)
        .addTo(map);
    
        // add popup marker
        new mapboxgl.Popup({
            offset:30,
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
    
        // extends map bounds to include current locations
        bounds.extend(loc.coordinates)
    })
    
    map.fitBounds(bounds, {
        padding: {
            top:200,
            bottom:150,
            left:100,
            right:100
        } 
    });
}