import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios, { mergeConfig } from 'axios';

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

  const [selectedSignalTypes, setSelectedSignalTypes] = useState([]);
  const [selectedLaneTypes, setSelectedLaneTypes] = useState([]);
  const [setPhaseNos, setSelectedPhaseNos] = useState([]);

  const [showFigure, setShowFigure] = useState(false);
  const [filtersLocked, setFiltersLocked] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [data, setData] = useState([]);
  const [noDataFound, setNoDataFound] = useState(false);

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
        'Leading Pedestrian Interval', 'No Right-Turn On Red'
      ]
    }
  ];

  const featureNameMap = {
    'Duration': 'duration',
    'Volume': 'volume',
    'Occupancy': 'occupancy',
    'Split Failure': 'splitFailure',
    'Gap': 'gap',
    'Headway': 'headway',
    'Conflict': 'conflict',
    'Red Light Running': 'runningFlag',
    'Pedestrian Activity Indicator': 'pedestrianActivity',
    'Pedestrian Delay': 'pedestrianDelay',
    'Pedestrian-Vehicle (Right-Turn) Conflict Propensity': 'conflictPropensity'
  };

  const aggregationMap = {
    'Cycle': '00',
    '15 min': '15',
    '30 min': '30',
    '60 min': '60'
  };

  const signalTypeLabelMap = {
    'green': 'Green',
    'yellow': 'Yellow',
    'redClearance': 'Red Clerance',
    'red': 'Red',
    'red5': 'Red5'
  };

  useEffect(() => {
    axios.get(`http://localhost:2500/api/intersections/${id}`)
      .then(res => setIntersection(res.data))
      .catch(err => console.error('Intersection not found:', err));
  }, [id]);

  const fetchData = async () => {
    const featureName = featureNameMap[selectedSubOption];
    const aggregationLevelMapped = aggregationMap[aggregationLevel];

    try {
      const res = await axios.get('http://localhost:2500/api/measures', {
        params: {
          signalID: id,
          featureName: featureName,
          aggregation: aggregationLevelMapped,
          startDate,
          endDate
        }
      });

      const result = res.data || [];
      // console.log(result);

      if (result.length === 0) {
        setData([]);
        setNoDataFound(true);
        return;
      }

      setData(result);
      setNoDataFound(false);

      const phaseNumbers = [...new Set(result.map(d => d.phaseNo).filter(p => p !== null && p !== undefined))].sort((a, b) => a - b);
      const signalTypes = [...new Set(result.map(d => d.signalType).filter(Boolean))];
      const laneTypes = [...new Set(result.map(d => d.laneType).filter(Boolean))];

      setPhaseNumbers(phaseNumbers.length > 0 ? phaseNumbers : ['N/A']);
      setSignalTypes(signalTypes.length > 0 ? signalTypes : ['N/A']);
      setLaneTypes(laneTypes.length > 0 ? laneTypes : ['N/A']);

    } catch (err) {
      console.error('Fetch Data Error:', err);
      setData([]);
      setNoDataFound(true);
    }
  };

  const handleSubOptionClick = (opt) => {
    if (selectedSubOption !== opt) {
      resetAll();
      setSelectedSubOption(opt);
    }
  };

  const resetAll = () => {
    setDateSelected(false);
    setAggregationLevel('');
    setAggregationConfirmed(false);
    setFiltersLocked(false);
  
    setSignalTypes([]);
    setLaneTypes([]);
    setPhaseNumbers([]);
  
    setSelectedSignalTypes([]);
    setSelectedLaneTypes([]);
    setSelectedPhaseNos([]);
  
    setData([]); // <-- Important: clear fetched data
    setNoDataFound(false); // <-- Important: reset no-data flag
  
    setShowFigure(false);
    setStartDate(null);
    setEndDate(null);
  };
  

  const toggleItem = (item, selectedItems, setSelectedItems) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const renderMultiSelectOptions = (label, items, selectedItems, setSelectedItems, mapLabels = false) => {
    const displayItems = items.length > 0 ? items : ['N/A'];
  
    const toggleItem = (item) => {
      if (selectedItems.includes(item)) {
        setSelectedItems(selectedItems.filter(i => i !== item));
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    };
  
    return (
      <div className="filter-box">
        <label className="filter-label">{label}</label>
        <div className="multi-box-container">
          {displayItems.map((item, i) => {
            const display = mapLabels && signalTypeLabelMap[item] ? signalTypeLabelMap[item] : item;
            const isSelected = selectedItems.includes(item);
  
            return (
              <div
                key={i}
                className={`multi-box ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleItem(item)}
              >
                {display}
              </div>
            );
          })}
        </div>
      </div>
    );
  };  

  const goEnabled = dateSelected && aggregationConfirmed;

  return (
    <div className="dashboard">
      <aside className="sidebar-section">
        {sections.map((section) => (
          <div key={section.title} className="sidebar-box">
            <h3
              onClick={() => {
                const willCollapse = expandedSection === section.title;
    
                if (willCollapse) {
                  // Only collapse if same section clicked
                  setExpandedSection('');
                  resetAll();
                  setSelectedSubOption('');
                } else {
                  // If switching to a new section
                  resetAll(); // Clear all filter/data state
                  setExpandedSection(section.title);
                  setSelectedSubOption('');
                }
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
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      <main className="main-section">
        {sections.find(s => s.title === 'Performance Measures')?.options.includes(selectedSubOption) && !filtersLocked && (
          <>
            <div className="datetime-aggregation-section">
              <DateRangeSelector
                key={selectedSubOption}
                onSelect={({ start, end }) => {
                  setDateSelected(true);
                  setStartDate(start);
                  setEndDate(end);
                }}
              />

              <div className="aggregation-section">
                <h2>Aggregation Level</h2>
                <div className="aggregation-buttons">
                  {['Cycle', '15 min', '30 min', '60 min'].map(level => (
                    <button
                      key={level}
                      onClick={() => {
                        setAggregationLevel(level);
                        setAggregationConfirmed(false);
                      }}
                      className={
                        aggregationLevel === level
                          ? 'level-select'
                          : 'level-unselect'
                      }
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <hr className='aggregation-divider' />

                <div className="confirm">
                  <button
                    disabled={!aggregationLevel}
                    onClick={() => setAggregationConfirmed(true)}
                    className={
                      aggregationLevel && !aggregationConfirmed
                        ? 'confirm-unlock'
                        : aggregationConfirmed
                          ? 'confirm-active'
                          : 'confirm-inactive'
                    }
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>

            <div className="go-button-section">
              <button
                className={`go-button ${goEnabled ? 'active' : 'inactive'}`}
                disabled={!goEnabled}
                onClick={() => {
                  fetchData();
                  setFiltersLocked(true);
                }}
              >
                Go
              </button>
            </div>
          </>
        )}

        {data.length > 0 && !noDataFound && (
          <>
            {renderMultiSelectOptions('Signal Type', signalTypes, selectedSignalTypes, setSelectedSignalTypes, true)}
            {renderMultiSelectOptions('Lane Type', laneTypes, selectedLaneTypes, setSelectedLaneTypes)}
            {renderMultiSelectOptions('Phase Number', phaseNumbers, setPhaseNos, setSelectedPhaseNos)}
          </>
        )}

        {noDataFound && (
          <div className="no-data-box">
            <h4>No data found for the following condition:</h4>
            <ul>
              <li><strong>Signal ID:</strong> {id}</li>
              <li><strong>Feature Name:</strong> {selectedSubOption}</li>
              <li><strong>Aggregation:</strong> {aggregationLevel}</li>
              <li><strong>Start:</strong> {startDate?.toLocaleString()}</li>
              <li><strong>End:</strong> {endDate?.toLocaleString()}</li>
            </ul>
          </div>
        )}

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

export default Dashboard;


