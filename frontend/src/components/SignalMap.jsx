import { useEffect } from 'react';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import L from 'leaflet';

import map_marker from '../assets/map_marker.png'


// Component to cluster and render markers
function MarkerClusterWrapper({ intersections, selectedID, onMarkerClick }) {
  const map = useMap();

  useEffect(() => {
    const markerClusterGroup = L.markerClusterGroup();

    intersections.forEach((int) => {
      // Default and red marker styles (optional fallback)
      // const redIcon = new L.Icon({
      //   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png',
      //   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      //   iconSize: [25, 41],
      //   iconAnchor: [12, 41],
      // });
      // const defaultIcon = new L.Icon.Default();

      // Custom modern-style marker icon
      const customIcon = new L.Icon({
        iconUrl: map_marker, 
        iconSize: [36, 36],
        iconAnchor: [18, 48],
        popupAnchor: [0, -48],
        shadowUrl: null,
      });

      const marker = L.marker([int.latitude, int.longitude], {
        icon: customIcon // Use custom marker
        // icon: isSelected ? redIcon : defaultIcon // Previous setup (commented out)
      });

      marker.bindPopup(`<strong>${int.intersectionName}</strong><br/>Signal ID: ${int.signalID}`);
      marker.on('click', () => onMarkerClick(int.signalID));
      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);
    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [intersections, selectedID, onMarkerClick, map]);

  return null;
}

// Fly to selected marker
function FlyToMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
}

// Main SignalMap component
function SignalMap({ intersections, selectedID, onMarkerClick }) {
  const selectedIntersection = intersections.find(i => i.signalID === selectedID);

  return (
    <MapContainer center={[28.65, -81.35]} zoom={12} className="map-section">
      {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
      {/* <TileLayer
        url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      /> */}
      {/* <TileLayer
        url="https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png"
        attribution='Map <a href="https://memomaps.de/">memomaps.de</a> <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      /> */}
      {/* <TileLayer
        url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      /> */}
      {/* <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      /> */}

      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        minZoom={0}
        // maxZoom={10}
        attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
      />


      <MarkerClusterWrapper
        intersections={intersections}
        selectedID={selectedID}
        onMarkerClick={onMarkerClick}
      />
      {selectedIntersection && (
        <FlyToMarker
          position={[selectedIntersection.latitude, selectedIntersection.longitude]}
        />
      )}
    </MapContainer>
  );
}

export default SignalMap
