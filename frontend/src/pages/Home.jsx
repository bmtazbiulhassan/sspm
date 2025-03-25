import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href
});

export default function Home() {
  const [intersections, setIntersections] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:2500/api/intersections')
      .then(res => setIntersections(res.data))
      .catch(err => console.error('API error:', err));
  }, []);

  const handleGo = () => {
    if (selectedId) navigate(`/dashboard/${selectedId}`);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Intersection Dashboard</h1>
      <input
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        placeholder="Enter or select signal ID"
        style={{ marginRight: '8px' }}
      />
      <button onClick={handleGo}>Go</button>

      <div style={{ height: '400px', marginTop: '1rem' }}>
        <MapContainer center={[28.65, -81.35]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {intersections.map((int) => (
            <Marker
              key={int._id}
              position={[int.latitude, int.longitude]}
              eventHandlers={{ click: () => setSelectedId(int.signalID) }}
            >
              <Popup>
                <strong>{int.intersectionName}</strong><br />
                Signal ID: {int.signalID}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <h2>All Intersections</h2>
      <ul>
        {intersections.map((int) => (
          <li
            key={int._id}
            onClick={() => setSelectedId(int.signalID)}
            style={{ cursor: 'pointer', textDecoration: 'underline', marginBottom: '0.25rem' }}
          >
            {int.signalID} - {int.intersectionName}
          </li>
        ))}
      </ul>
    </div>
  );
}


