import React, { useState } from 'react';
import '../css/DateRangeSelector.css';

function MonthSelector({ onSelect }) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isSelected, setIsSelected] = useState(false); // for button styling

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleApply = () => {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59); // end of month
    setIsSelected(true);
    onSelect?.({ start, end });
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
    setIsSelected(false); // unselect on change
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
    setIsSelected(false); // unselect on change
  };

  return (
    <div className="month-selector-container">
      <h2>Select Month</h2>
      <div className="month-selector">
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          {months.map((month, idx) => (
            <option key={month} value={idx}>{month}</option>
          ))}
        </select>

        <input
          type="number"
          value={selectedYear}
          onChange={handleYearChange}
          className="year-input"
          min="2000"
          max={new Date().getFullYear() + 10}
        />
      </div>

      <hr className="aggregation-divider" />

      <div className="month-select-button-container">
        <button
          className={`month-select-button ${isSelected ? 'active' : 'inactive'}`}
          onClick={handleApply}
        >
          Select
        </button>
      </div>
    </div>
  );
}

export default MonthSelector;
