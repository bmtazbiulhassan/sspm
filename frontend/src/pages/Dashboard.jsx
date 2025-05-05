import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

import PerformanceMeasurePanel from '../components/PerformanceMeasurePanel';
import RecommendationPanel from '../components/RecommendationPanel';
import DashboardSidebar from '../components/DashboardSidebar';
import LineChart from '../components/charts/LineChart';
import Heatmap from '../components/charts/Heatmap';

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
  const [phaseNos, setPhaseNos] = useState([]);

  const [selectedSignalTypes, setSelectedSignalTypes] = useState([]);
  const [selectedLaneTypes, setSelectedLaneTypes] = useState([]);
  const [selectedPhaseNos, setSelectedPhaseNos] = useState([]);

  const [showFigure, setShowFigure] = useState(false);
  const [filtersLocked, setFiltersLocked] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [data, setData] = useState([]);
  const [noDataFound, setNoDataFound] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const [recommendationDataMap, setRecommendationDataMap] = useState({});
  const [selectedKMap, setSelectedKMap] = useState({});
  

  const sections = [
    // {
    //   title: 'Data Quality',
    //   options: ['Signal Sequence (1-8-10-11)']
    // },
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
    // Performance
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
    'Pedestrian-Vehicle (Right-Turn) Conflict Propensity': 'conflictPropensity',

    // Recommendation
    'Pedestrian Recall': 'pedestrianPresenceProbability',
    'Leading Pedestrian Interval': 'conflictPropensity',
    'No Right-Turn On Red': 'conflictPropensity'
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

  useEffect(() => {
    setDateSelected(false);
    setStartDate(null);
    setEndDate(null);
    setAggregationLevel('');
    setAggregationConfirmed(false);
    setFiltersLocked(false);
    setShowFigure(false);
    setFilteredData([]);
    setData([]);
    setSignalTypes([]);
    setLaneTypes([]);
    setPhaseNos([]);
    setSelectedSignalTypes([]);
    setSelectedLaneTypes([]);
    setSelectedPhaseNos([]);
    setNoDataFound(false);
    setRecommendationDataMap({});
  }, [Array.isArray(selectedSubOption) ? selectedSubOption.join(',') : selectedSubOption]);

  const fetchData = async () => {
    const subOpt = Array.isArray(selectedSubOption) ? selectedSubOption[0] : selectedSubOption;
    const featureName = featureNameMap[subOpt];
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

      if (result.length === 0) {
        setData([]);
        setNoDataFound(true);
        return;
      }

      setData(result);
      setNoDataFound(false);

      const signalTypes = [...new Set(result.map(d => d.signalType).filter(Boolean))];
      const laneTypes = [...new Set(result.map(d => d.laneType).filter(Boolean))];
      const phaseNos = [...new Set(result.map(d => d.phaseNo).filter(p => p !== null && p !== undefined))].sort((a, b) => a - b);

      setSignalTypes(signalTypes.length > 0 ? signalTypes : ['N/A']);
      setLaneTypes(laneTypes.length > 0 ? laneTypes : ['N/A']);
      setPhaseNos(phaseNos.length > 0 ? phaseNos : ['N/A']);
    } catch (err) {
      console.error('Fetch Data Error:', err);
      setData([]);
      setNoDataFound(true);
    }
  };

  const fetchRecommendationData = async () => {
    const month = startDate.getMonth() + 1;
    const year = startDate.getFullYear();
    const aggregationLevelMapped = aggregationMap[aggregationLevel];

    const newDataMap = {};

    for (const subOpt of selectedSubOption) {
      const featureName = featureNameMap[subOpt];
      if (!featureName) continue;

      try {
        const res = await axios.get('http://localhost:2500/api/recommendation', {
          params: {
            signalID: id,
            featureName,
            aggregation: aggregationLevelMapped,
            month,
            year
          }
        });

        newDataMap[subOpt] = res.data || [];
      } catch (err) {
        console.error(`Error fetching recommendation data for ${subOpt}:`, err);
        newDataMap[subOpt] = [];
      }
    }

    setRecommendationDataMap(newDataMap);

    const allPhases = Object.values(newDataMap)
      .flat()
      .map(d => d.phaseNo)
      .filter((val, i, arr) => val != null && arr.indexOf(val) === i)
      .sort((a, b) => a - b);

    setPhaseNos(allPhases.length > 0 ? allPhases : ['N/A']);

    // ✅ Auto-select lowest k value
    const newSelectedKMap = {};
    Object.entries(newDataMap).forEach(([subOpt, values]) => {
      const kValues = values.map(d => d.k).filter(k => k != null);
      if (kValues.length > 0) {
        newSelectedKMap[subOpt] = Math.min(...kValues);
      }
    });
    setSelectedKMap(newSelectedKMap);

    const allValues = Object.values(newDataMap).flat();
    if (allValues.length === 0) {
      setNoDataFound(true);
    } else {
      setNoDataFound(false);
    }

    // ✅ Log the entire dict after it's built
    console.log('✅ Full Recommendation Data Map:', newDataMap);
  };

  const resetAll = () => {
    setDateSelected(false);
    setAggregationLevel('');
    setAggregationConfirmed(false);
    setFiltersLocked(false);
    setSignalTypes([]);
    setLaneTypes([]);
    setPhaseNos([]);
    setSelectedSignalTypes([]);
    setSelectedLaneTypes([]);
    setSelectedPhaseNos([]);
    setData([]);
    setNoDataFound(false);
    setShowFigure(false);
    setStartDate(null);
    setEndDate(null);
    setRecommendationDataMap({});
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
      <div className="filter-section">
        <h3>{label}</h3>
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

  const allFiltersSelected = (
    (signalTypes.includes('N/A') || selectedSignalTypes.length > 0) &&
    (laneTypes.includes('N/A') || selectedLaneTypes.length > 0) &&
    (phaseNos.includes('N/A') || selectedPhaseNos.length > 0)
  );

  return (
    <div className="dashboard">
      <DashboardSidebar
        sections={sections}
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        selectedSubOption={selectedSubOption}
        setSelectedSubOption={setSelectedSubOption}
        resetAll={resetAll}
      />

      <main className="main-section">
        {/* Panel for Performance Measures */}
        {typeof selectedSubOption === 'string' &&
          sections.find(s => s.title === 'Performance Measures')?.options.includes(selectedSubOption) &&
          !filtersLocked && (
            <PerformanceMeasurePanel
              selectedSubOption={selectedSubOption}
              setDateSelected={setDateSelected}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              aggregationLevel={aggregationLevel}
              setAggregationLevel={setAggregationLevel}
              aggregationConfirmed={aggregationConfirmed}
              setAggregationConfirmed={setAggregationConfirmed}
              onGoClick={() => {
                fetchData();
                setFiltersLocked(true);
              }}
              goEnabled={goEnabled}
            />
          )
        }

        {/* Panel for Recommendations */}
        {Array.isArray(selectedSubOption) &&
          selectedSubOption.length > 0 &&
          expandedSection === 'Recommendations' &&
          !filtersLocked && (
            <RecommendationPanel
              selectedSubOption={selectedSubOption[0]}
              setDateSelected={setDateSelected}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              aggregationLevel={aggregationLevel}
              setAggregationLevel={setAggregationLevel}
              aggregationConfirmed={aggregationConfirmed}
              setAggregationConfirmed={setAggregationConfirmed}
              onGoClick={() => {
                fetchRecommendationData();
                setFiltersLocked(true);
              }}
              goEnabled={goEnabled}
            />
          )
        }

        {/* Filter Options and Chart Render */}
        {((data.length > 0 && !noDataFound) || Object.keys(recommendationDataMap).length > 0) && (
          <>
            {/* For Performance Measures: render all 3 filters */}
            {expandedSection === 'Performance Measures' && (
              <>
                {renderMultiSelectOptions('Signal Type', signalTypes, selectedSignalTypes, setSelectedSignalTypes, true)}
                {renderMultiSelectOptions('Lane Type', laneTypes, selectedLaneTypes, setSelectedLaneTypes)}
                {renderMultiSelectOptions('Phase Number', phaseNos, selectedPhaseNos, setSelectedPhaseNos)}
              </>
            )}

            {/* For Recommendations: render only Phase Number filter */}
            {expandedSection === 'Recommendations' && (
              <>
                {renderMultiSelectOptions('Phase Number', phaseNos, selectedPhaseNos, setSelectedPhaseNos)}
              </>
            )}

            <div className="go-button-section">
              <button
                className={`go-button ${
                  selectedPhaseNos.length > 0 ? 'active' : 'inactive'
                }`}
                disabled={selectedPhaseNos.length === 0}
                onClick={() => {
                  if (expandedSection === 'Performance Measures') {
                    const filtered = data.filter(item => {
                      const signalMatch = signalTypes.includes('N/A') || selectedSignalTypes.includes(item.signalType);
                      const laneMatch = laneTypes.includes('N/A') || selectedLaneTypes.includes(item.laneType);
                      const phaseMatch = phaseNos.includes('N/A') || selectedPhaseNos.includes(item.phaseNo);
                      return signalMatch && laneMatch && phaseMatch;
                    });

                    console.log('Filtered Performance Data:', filtered);
                    setFilteredData(filtered);
                  }

                  if (expandedSection === 'Recommendations') {
                    const allRecoData = Object.entries(recommendationDataMap).flatMap(([key, values]) =>
                      values.filter(d => selectedPhaseNos.includes(d.phaseNo))
                    );

                    console.log('Filtered Recommendation Data:', allRecoData);
                    setFilteredData(allRecoData);
                  }

                  setShowFigure(true);
                }}
              >
                Create Chart
              </button>
            </div>
          </>
        )}

        {filtersLocked && showFigure && noDataFound && (
          <div className="no-data-box">
            <h4>No data found for the following condition:</h4>
            <ul>
              <li><strong>Signal ID:</strong> {id}</li>
              <li><strong>Feature Name:</strong> {Array.isArray(selectedSubOption) ? selectedSubOption.join(', ') : selectedSubOption}</li>
              <li><strong>Aggregation:</strong> {aggregationLevel}</li>
              <li><strong>Start:</strong> {startDate?.toLocaleString()}</li>
              <li><strong>End:</strong> {endDate?.toLocaleString()}</li>
            </ul>
          </div>
        )}

        {/* RENDER LINE CHART FOR PERFORMANCE */}
        {showFigure && expandedSection === 'Performance Measures' && (
          <div className="visualization-box">
            <LineChart data={filteredData} />
          </div>
        )}
        {/* ✅ RENDER RECOMMENDATION HEATMAP WITH K DROPDOWN INLINE */}
        {showFigure && expandedSection === 'Recommendations' && (
          <div className="visualization-box">
            {(Array.isArray(selectedSubOption) ? selectedSubOption : [selectedSubOption])
              .filter(subOpt => recommendationDataMap[subOpt]?.length > 0)
              .map((subOpt, index) => {
                const kOptions = Array.from(new Set(
                  recommendationDataMap[subOpt].map(d => d.k).filter(k => k != null)
                )).sort((a, b) => a - b);

                return (
                  <div key={index} style={{ marginBottom: '2.5rem' }}>
                    {/* ✅ Per-Plot K Filter */}
                    {kOptions.length > 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        backgroundColor: '#f0f0f0',
                        padding: '10px 16px',
                        marginBottom: '1rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        width: 'fit-content'
                      }}>
                        <label
                          title={`k is a decay constant in the conflict model.\n• Lower k picks up more minor conflicts (only very high conflict exposure will show as risky).\n• Higher k picks up more minor conflicts (even moderate conflict looks risky).`}
                          style={{
                            marginRight: '12px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: '#333',
                            cursor: 'help'
                          }}
                        >
                          Select K ({subOpt})
                        </label>
                        <select
                          value={selectedKMap[subOpt] || ''}
                          onChange={(e) =>
                            setSelectedKMap(prev => ({
                              ...prev,
                              [subOpt]: parseFloat(e.target.value)
                            }))
                          }
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            fontSize: '16px'
                          }}
                        >
                          {kOptions.map(k => (
                            <option key={k} value={k}>
                              {k.toFixed(3)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* ✅ Per-Plot Heatmap */}
                    <Heatmap
                      dataMap={{
                        filtered: filteredData.filter(d => d.feature === featureNameMap[subOpt])
                      }}
                      selectedK={selectedKMap[subOpt]}
                      selectedSubOption={subOpt}
                    />
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

