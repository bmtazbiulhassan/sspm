import React, { useState } from 'react';
import '../css/DateRangeSelector.css';

function MonthSelector({ onSelect }) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleApply = () => {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59); // End of the selected month
    onSelect?.({ start, end });
  };

  return (
    <div className="date-range-selector">
      <h2>Select Month</h2>
      <div className="month-selector">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
        >
          {months.map((month, idx) => (
            <option key={month} value={idx}>{month}</option>
          ))}
        </select>

        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="year-input"
          min="2000"
          max={new Date().getFullYear() + 10}
        />

        <button className="select-button button-shared active" onClick={handleApply}>
          Select
        </button>
      </div>
    </div>
  );
}

export default MonthSelector;
