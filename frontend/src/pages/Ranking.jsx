import { useState, useRef } from 'react';
import axios from 'axios';

import DateRangeSelector from '../components/DateRangeSelector';
import '../css/Dashboard.css';

export default function Ranking() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateSelected, setDateSelected] = useState(false);

  const [aggregationLevel, setAggregationLevel] = useState('');
  const [aggregationConfirmed, setAggregationConfirmed] = useState(false);

  const [conflictWeight, setConflictWeight] = useState(0.5);
  const [rlrWeight, setRlrWeight] = useState(0.3);
  const [pedDelayWeight, setPedDelayWeight] = useState(0.2);
  const [weightsConfirmed, setWeightsConfirmed] = useState(false);

  const [weightError, setWeightError] = useState('');
  const [rankingData, setRankingData] = useState([]);
  const [fetchError, setFetchError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);

  const resultRef = useRef(null);

  const allowedAggregations = ['15 min', '30 min', '60 min'];

  const validateWeights = () => {
    const sum = conflictWeight + rlrWeight + pedDelayWeight;
    return Math.round(sum * 10) / 10 === 1.0;
  };

  const fetchRanking = async () => {
    if (!validateWeights()) {
      setWeightError('❌ Weights must sum to 1.0');
      setWeightsConfirmed(false);
      return;
    }
  
    setWeightError('');
    const aggMap = { '15 min': '15', '30 min': '30', '60 min': '60' };
    const weightLabel = `${conflictWeight.toFixed(1)}-${rlrWeight.toFixed(1)}-${pedDelayWeight.toFixed(1)}`;
  
    try {
      const res = await axios.get('http://localhost:2500/api/ranking', {
        params: {
          aggregation: aggMap[aggregationLevel],
          startDate,
          endDate,
          weightLabel
        }
      });
  
      setRankingData(res.data || []);
      setFetchError('');
      setCurrentIndex(0);
  
      // Scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100); // delay for DOM update
    } catch (err) {
      console.error(err);
      setFetchError('⚠️ Error fetching ranking data.');
      setRankingData([]);
    }
  };  

  const goEnabled = dateSelected && aggregationConfirmed && weightsConfirmed;

  // Group results by interval timestamp
  const groupedByInterval = rankingData.reduce((acc, curr) => {
    const ts = new Date(curr.timeStamp);
    const key = ts.toISOString(); // unique per timestamp
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  const sortedIntervalKeys = Object.keys(groupedByInterval).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const currentIntervalKey = sortedIntervalKeys[currentIndex];
  const entries = groupedByInterval[currentIntervalKey] || [];

  const formatTimeRange = (key) => {
    const start = new Date(key);
    const end = new Date(start.getTime() + parseInt(aggregationLevel) * 60 * 1000);
    return `${start.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })} – ${end.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`;
  };

  const getRowColor = (score) => {
    if (score === null || score === undefined) return '';
    if (score >= 0.6) return '#f8d7da'; // light red
    if (score >= 0.4) return '#fff3cd'; // light yellow
    return '#d4edda'; // light green
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Intersection Ranking</h1>
      {/* <p>Select a date range, aggregation level, and assign weights to ranking metrics.</p> */}

      {/* Date Picker */}
      <DateRangeSelector
        onSelect={({ start, end }) => {
          setStartDate(start);
          setEndDate(end);
          setDateSelected(true);
          setRankingData([]);
          setCurrentIndex(0);
        }}
      />

      {/* Aggregation Level */}
      <div className="aggregation-section">
        <h2>Aggregation Level</h2>
        <div className="aggregation-buttons">
          {allowedAggregations.map(level => (
            <button
              key={level}
              onClick={() => {
                setAggregationLevel(level);
                setAggregationConfirmed(false);
                setRankingData([]);
                setCurrentIndex(0);
              }}
              className={
                aggregationLevel === level ? 'level-select' : 'level-unselect'
              }
            >
              {level}
            </button>
          ))}
        </div>

        <hr className="aggregation-divider" />

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

      {/* Weight Selection */}
      <div className="weight-section">
        <h2>Set Risk Weights (Must Sum to 1.0)</h2>
        <div className="weight-inputs">
          <div className="weight-box">
            <label>Vehicle-Vehicle Conflict</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={conflictWeight}
              onChange={(e) => {
                setConflictWeight(parseFloat(e.target.value || 0));
                setWeightsConfirmed(false);
              }}
            />
          </div>
          <div className="weight-box">
            <label>Red Light Running</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={rlrWeight}
              onChange={(e) => {
                setRlrWeight(parseFloat(e.target.value || 0));
                setWeightsConfirmed(false);
              }}
            />
          </div>
          <div className="weight-box">
            <label>Pedestrian Delay</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={pedDelayWeight}
              onChange={(e) => {
                setPedDelayWeight(parseFloat(e.target.value || 0));
                setWeightsConfirmed(false);
              }}
            />
          </div>
        </div>

        <hr className="aggregation-divider" />

        <div className="confirm">
          <button
            className={
              validateWeights()
                ? weightsConfirmed
                  ? 'confirm-active'
                  : 'confirm-unlock'
                : 'confirm-inactive'
            }
            disabled={!validateWeights()}
            onClick={() => setWeightsConfirmed(true)}
          >
            Confirm
          </button>
        </div>

        {weightError && <p className="weight-error">{weightError}</p>}
      </div>

      {/* GO Button */}
      <div className="go-button-section" style={{ marginTop: '2rem' }}>
        <button
          className={`go-button ${goEnabled ? 'active' : 'inactive'}`}
          disabled={!goEnabled}
          onClick={fetchRanking}
        >
          Go
        </button>
      </div>

      {/* Display Ranking Results - Paged View */}
      <div style={{ marginTop: '5rem' }}>
        {fetchError && <p style={{ color: 'red' }}>{fetchError}</p>}

        {rankingData.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{marginBottom: '1rem'}}>{formatTimeRange(currentIntervalKey)}</h3>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              width: '100%',
              maxWidth: '900px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#f8d7da', border: '1px solid #ccc' }} />
                <span style={{ fontSize: '0.9rem' }}>Score ≥ 0.6 (High Risk)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#fff3cd', border: '1px solid #ccc' }} />
                <span style={{ fontSize: '0.9rem' }}>0.4 ≤ Score &lt; 0.6 (Moderate)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#d4edda', border: '1px solid #ccc' }} />
                <span style={{ fontSize: '0.9rem' }}>Score &lt; 0.4 (Safe)</span>
              </div>
            </div>

            <table className="custom-table" style={{ minWidth: '420px' }}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Signal ID</th>
                  <th>Conflict Score</th>
                  <th>RLR Score</th>
                  <th>Ped Delay Score</th>
                  <th>Safety Score</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .sort((a, b) => a.rank - b.rank)
                  .map((row, i) => {
                    const bgColor = getRowColor(row.safetyScore);
                    return (
                      <tr key={i} style={{ backgroundColor: bgColor }}>
                        <td>{row.rank}</td>
                        <td>{row.signalID}</td>
                        <td>{row.conflictScore?.toFixed(3)}</td>
                        <td>{row.runningFlagScore?.toFixed(3)}</td>
                        <td>{row.pedestrianDelayScore?.toFixed(3)}</td>
                        <td>{row.safetyScore?.toFixed(3)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="pagination-button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                ◀ Previous
              </button>
              <span className="pagination-info">
                Interval {currentIndex + 1} of {sortedIntervalKeys.length}
              </span>
              <button
                className="pagination-button"
                onClick={() => setCurrentIndex((prev) => Math.min(sortedIntervalKeys.length - 1, prev + 1))}
                disabled={currentIndex === sortedIntervalKeys.length - 1}
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
