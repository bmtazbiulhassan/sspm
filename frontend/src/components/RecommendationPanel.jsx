import React from 'react';

import MonthSelector from './MonthSelector';
import '../css/Dashboard.css';

function RecommendationPanel({
  selectedSubOption,               // First selected recommendation
  setDateSelected,                 // Function to mark whether a date range has been selected
  setStartDate,                    // Function to update selected start date
  setEndDate,                      // Function to update selected end date
  aggregationLevel,                // Currently selected aggregation level (15, 30, 60 min only)
  setAggregationLevel,             // Function to update aggregation level
  aggregationConfirmed,            // Boolean flag indicating if aggregation has been confirmed
  setAggregationConfirmed,         // Function to confirm aggregation level
  onGoClick,                       // Function to execute when "Go" is clicked
  goEnabled                        // Boolean flag indicating whether "Go" should be enabled
}) {
  const allowedAggregations = ['15 min', '30 min', '60 min']; // No 'Cycle'

  return (
    <>
      <div className="datetime-aggregation-section">
        {/* Month Selector for Recommendations */}
        <MonthSelector
        key={selectedSubOption}
        onSelect={({ start, end }) => {
            setDateSelected(true);   // Still use the same boolean
            setStartDate(start);     // Start of the month
            setEndDate(end);         // End of the month
        }}
        />

        {/* Aggregation level selector */}
        <div className="aggregation-section">
          <h2>Aggregation Level</h2>
          <div className="aggregation-buttons">
            {/* Render buttons excluding 'Cycle' */}
            {allowedAggregations.map(level => (
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

          <hr className="aggregation-divider" />

          {/* Confirm Button */}
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

      {/* GO button to fetch data based on selections */}
      <div className="go-button-section">
        <button
          className={`go-button ${goEnabled ? 'active' : 'inactive'}`}
          disabled={!goEnabled}
          onClick={onGoClick}
        >
          Go
        </button>
      </div>
    </>
  );
}

export default RecommendationPanel;
