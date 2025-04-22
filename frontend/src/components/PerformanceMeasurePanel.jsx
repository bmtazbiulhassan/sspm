import React from 'react';

import DateRangeSelector from './DateRangeSelector';
import '../css/Dashboard.css';


function PerformanceMeasurePanel({
  selectedSubOption,               // Currently selected sub-option under Performance Measures
  setDateSelected,                 // Function to mark whether a date range has been selected
  setStartDate,                    // Function to update selected start date
  setEndDate,                      // Function to update selected end date
  aggregationLevel,                // Currently selected aggregation level (e.g., Cycle, 15 min)
  setAggregationLevel,             // Function to update aggregation level
  aggregationConfirmed,            // Boolean flag indicating if aggregation has been confirmed
  setAggregationConfirmed,         // Function to confirm aggregation level
  onGoClick,                       // Function to execute when "Go" is clicked
  goEnabled                        // Boolean flag indicating whether "Go" should be enabled
}) {
  return (
    <>
      <div className="datetime-aggregation-section">
        {/* Date Range Selector */}
        <DateRangeSelector
          key={selectedSubOption}    // Reset the date picker if the selected option changes
          onSelect={({ start, end }) => {
            setDateSelected(true);   // Mark that a date has been selected
            setStartDate(start);     // Update the start date in state
            setEndDate(end);         // Update the end date in state
          }}
        />

        {/* Aggregation level selector */}
        <div className="aggregation-section">
          <h2>Aggregation Level</h2>
          <div className="aggregation-buttons">
            {/* Render buttons for each aggregation level */}
            {['Cycle', '15 min', '30 min', '60 min'].map(level => (
              <button
                key={level}
                onClick={() => {
                  setAggregationLevel(level);        // Set selected aggregation level
                  setAggregationConfirmed(false);    // Reset confirmation
                }}
                className={
                  aggregationLevel === level
                    ? 'level-select'                 // Highlight selected level
                    : 'level-unselect'               // Dim unselected levels
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
              disabled={!aggregationLevel}  // Disable if no level selected
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
          disabled={!goEnabled}          // Disable until valid selections are made
          onClick={onGoClick}            // Trigger data fetch on click
        >
          Go
        </button>
      </div>
    </>
  );
}

export default PerformanceMeasurePanel;
