import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import SignalMap from '../components/SignalMap';
import '../css/Home.css';

function Home() {
  const [intersections, setIntersections] = useState([]);
  const [selectedID, setSelectedID] = useState('');
  const [view, setView] = useState('map');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const inputSectionRef = useRef(null); // Reference for input area

  useEffect(() => {
    axios.get('http://localhost:2500/api/intersections')
      .then(res => setIntersections(res.data))
      .catch(err => console.error('API error:', err));
  }, []);

  const handleGo = () => {
    const match = intersections.find(i => i.signalID === selectedID);
    if (match) {
      setError('');
      navigate(`/dashboard/${selectedID}`);
    } else {
      setError('❌ Invalid Signal ID');
    }
  };

  // Clear input and error when clicking outside the input section
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputSectionRef.current &&
        !inputSectionRef.current.contains(event.target)
      ) {
        setSelectedID('');
        setError('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="home">
      {/* Heading */}
      <div className="heading-section">
        <h1>Performance Measures & Recommendations</h1>
        <div>
          <button
            onClick={() => setView('map')}
            className={`heading-button ${view === 'list' ? 'inactive' : 'active'}`}
          >
            Signal Map
          </button>
          <button
            onClick={() => setView('list')}
            className={`heading-button ${view === 'list' ? 'active' : 'inactive'}`}
          >
            Signal List
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-section">
        {view === 'map' && (
          <div className="map-section">
            <SignalMap
              intersections={intersections}
              selectedID={selectedID}
              onMarkerClick={setSelectedID}
            />
          </div>
        )}

        {view === 'list' && (
          <div className="table-section">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Signal ID</th>
                  <th>SIIA ID</th>
                  <th>Intersection Name</th>
                </tr>
              </thead>
              <tbody>
                {intersections.map((int) => (
                  <tr
                    key={int._id}
                    onClick={() => setSelectedID(int.signalID)}
                    className={selectedID === int.signalID ? 'row-select' : ''}
                  >
                    <td>{int.signalID}</td>
                    <td>{int.siiaID}</td>
                    <td>{int.intersectionName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Input Section */}
      <div className="input-section" ref={inputSectionRef}>
        <input
          value={selectedID}
          onChange={(e) => setSelectedID(e.target.value)}
          placeholder="Enter Signal ID"
          className="input-box"
        />
        <button onClick={handleGo} className="input-button">Go</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default Home;
