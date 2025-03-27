import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

import DateRangeSelector from '../components/DateRangeSelector';

import '../css/Dashboard.css';


function Dashboard() {
  const { id } = useParams();

  const [intersection, setIntersection] = useState(null);
  const [expandedSection, setExpandedSection] = useState('');
  const [selectedSubOption, setSelectedSubOption] = useState('');

  const [dateSelected, setDateSelected] = useState(false);
  const [aggregationLevel, setAggregationLevel] = useState('');
  const [aggregationConfirmed, setAggregationConfirmed] = useState(false);

  const [signalTypes, setSignalTypes] = useState([]);
  const [laneTypes, setLaneTypes] = useState([]);
  const [phaseNumbers, setPhaseNumbers] = useState([]);

  const [selectedSignalType, setSelectedSignalType] = useState('');
  const [selectedLaneType, setSelectedLaneType] = useState('');
  const [selectedPhaseNo, setSelectedPhaseNo] = useState('');

  const [showFigure, setShowFigure] = useState(false);
  const [filtersLocked, setFiltersLocked] = useState(false);

  const sections = [
    {
      title: 'Data Quality',
      options: ['Signal Sequence (1-8-10-11)']
    },
    {
      title: 'Performance Measures',
      options: [
        'Duration', 'Volume', 'Occupancy', 'Split Failure', 'Gap', 'Headway',
        'Conflict', 'Red Light Running', 'Pedestrian Activity Indicator',
        'Pedestrian Delay', 'Pedestrian-Vehicle (Right-Turn) Conflict Propensity'
      ]
    },
    {
      title: 'Recommendations',
      options: [
        'Signal Adjustment', 'Protected/Permitted Left-Turn', 'Pedestrian Recall',
        'Leading Pedestrian Interval', 'No Right Turn On Red'
      ]
    }
  ];

  useEffect(() => {
    axios.get(`http://localhost:2500/api/intersections/${id}`)
      .then(res => setIntersection(res.data))
      .catch(err => console.error('Intersection not found:', err));
  }, [id]);

  const fetchFilters = async () => {
    try {
      const res = await axios.get(`http://localhost:2500/api/filters/${id}`, {
        params: { aggregation: aggregationLevel }
      });
      setSignalTypes(res.data.signalTypes || []);
      setLaneTypes(res.data.laneTypes || []);
      setPhaseNumbers(res.data.phaseNumbers || []);
    } catch (err) {
      console.error('Filter fetch failed:', err);
    }
  };

  useEffect(() => {
    if (aggregationConfirmed && selectedSubOption) fetchFilters();
  }, [aggregationConfirmed, selectedSubOption]);

  const handleSubOptionClick = (opt) => {
    if (selectedSubOption === opt) {
      resetAll();
    } else {
      resetAll();
      setSelectedSubOption(opt);
    }
  };

  const resetAll = () => {
    setSelectedSubOption('');
    setDateSelected(false);
    setAggregationLevel('');
    setAggregationConfirmed(false);
    setFiltersLocked(false);
    setSignalTypes([]);
    setLaneTypes([]);
    setPhaseNumbers([]);
    setSelectedSignalType('');
    setSelectedLaneType('');
    setSelectedPhaseNo('');
    setShowFigure(false);
  };

  const renderCircleOptions = (items, selectedItem, setSelected) => {
    if (!items || items.length === 0) return <p><strong>N/A</strong></p>;

    return (
      <div className="circle-options">
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelected(item)}
            className={`circle-option ${selectedItem === item ? 'active' : ''}`}
          >
            {item}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar-section">
        {sections.map((section) => (
          <div key={section.title} className="sidebar-box">
            <h3
              onClick={() => {
                setExpandedSection(expandedSection === section.title ? '' : section.title);
                setSelectedSubOption('');
                resetAll();
              }}
              className={expandedSection === section.title ? 'active' : ''}
            >
              {section.title}
            </h3>
            {expandedSection === section.title && (
              <div className="sidebar-radio">
                {section.options.map(opt => (
                  <label key={opt} className="radio-option">
                    <input 
                    type="radio"
                    name={section.title}
                    value={opt}
                    checked={selectedSubOption === opt}
                    onChange={() => handleSubOptionClick(opt)}
                    />
                    {opt}
                    </label>
                  )
                )}
              </div>            
            )}
          </div>
        ))}
      </aside>

      {/* Main */}
      <main className="main-section">
        {/* Intersection Info */}
        {intersection && (
          <div className="intersection-info">
            <h2>Signal ID: {intersection.signalID}</h2>
            <p><strong>Location:</strong> {intersection.intersectionName}</p>
            <p><strong>SIIA ID:</strong> {intersection.siiaID}</p>
            {selectedSubOption && <p><strong>Selected:</strong> {selectedSubOption}</p>}
          </div>
        )}

        {/* Date + Aggregation */}
        {selectedSubOption && !filtersLocked && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <DateRangeSelector onSelect={() => setDateSelected(true)} />
            </div>

            {dateSelected && (
              <div>
                <h3>Aggregation Level</h3>
                <div className="aggregation-buttons">
                  {['cycle', '15 min', '30 min', '60 min'].map(level => (
                    <button
                      key={level}
                      onClick={() => setAggregationLevel(level)}
                      className={
                        aggregationLevel === level && !aggregationConfirmed
                          ? 'confirm'
                          : 'unselected'
                      }
                    >
                      {level}
                    </button>
                  ))}
                  <button
                    disabled={!aggregationLevel}
                    onClick={() => {
                      setAggregationConfirmed(true);
                      setFiltersLocked(true);
                    }}
                    className={aggregationLevel ? 'confirm' : 'disabled'}
                  >
                    Confirm Aggregation
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Revise button */}
        {filtersLocked && (
          <div>
            <button
              onClick={() => {
                setAggregationConfirmed(false);
                setFiltersLocked(false);
                setSignalTypes([]);
                setLaneTypes([]);
                setPhaseNumbers([]);
                setSelectedSignalType('');
                setSelectedLaneType('');
                setSelectedPhaseNo('');
                setShowFigure(false);
              }}
              className="revise-button"
            >
              Revise Date & Aggregation
            </button>
          </div>
        )}

        {/* Dynamic Filters */}
        {selectedSubOption && aggregationConfirmed && (
          <div>
            <h3>Signal Type</h3>
            {renderCircleOptions(signalTypes, selectedSignalType, setSelectedSignalType)}

            <h3>Lane Type</h3>
            {renderCircleOptions(laneTypes, selectedLaneType, setSelectedLaneType)}

            <h3>Phase Number</h3>
            {renderCircleOptions(phaseNumbers, selectedPhaseNo, setSelectedPhaseNo)}

            <button onClick={() => setShowFigure(true)} className="show-figure-button">
              Confirm & Show
            </button>
          </div>
        )}

        {/* Graph Display */}
        {showFigure && (
          <div className="visualization-box">
            <h3>📊 Visualization Area</h3>
            <p>This will display filtered data based on your selections.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard