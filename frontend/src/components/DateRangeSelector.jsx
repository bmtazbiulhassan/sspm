import DatePicker from 'react-datepicker';
import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/DateRangeSelector.css'; // ✅ import CSS

export default function DateRangeSelector({ onSelect }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [startHour, setStartHour] = useState('12');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');

  const [endHour, setEndHour] = useState('11');
  const [endMinute, setEndMinute] = useState('59');
  const [endPeriod, setEndPeriod] = useState('PM');

  const [startTimeValid, setStartTimeValid] = useState(true);
  const [endTimeValid, setEndTimeValid] = useState(true);
  const [rangeError, setRangeError] = useState('');
  const [isSelected, setIsSelected] = useState(false);

  const validateTime = (hour, minute) => {
    return (
      /^\d+$/.test(hour) &&
      /^\d+$/.test(minute) &&
      Number(hour) >= 1 &&
      Number(hour) <= 12 &&
      Number(minute) >= 0 &&
      Number(minute) <= 59
    );
  };

  const convertTo24Hour = (hour, minute, period) => {
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return { h, m };
  };

  const handleReset = () => {
    const now = new Date();
    setStartDate(now);
    setEndDate(now);
    setStartHour('12');
    setStartMinute('00');
    setStartPeriod('AM');
    setEndHour('11');
    setEndMinute('59');
    setEndPeriod('PM');
    setStartTimeValid(true);
    setEndTimeValid(true);
    setRangeError('');
    setIsSelected(false);
  };

  const handleSelect = () => {
    const isStartValid = validateTime(startHour, startMinute);
    const isEndValid = validateTime(endHour, endMinute);
    setStartTimeValid(isStartValid);
    setEndTimeValid(isEndValid);

    if (!isStartValid || !isEndValid) {
      setRangeError('❌ Please enter valid start and end times.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const { h: sh, m: sm } = convertTo24Hour(startHour, startMinute, startPeriod);
    const { h: eh, m: em } = convertTo24Hour(endHour, endMinute, endPeriod);

    start.setHours(sh, sm, 0, 0);
    end.setHours(eh, em, 0, 0);

    if (start.getTime() >= end.getTime()) {
      setRangeError('❌ Invalid time range: Start must be earlier than End.');
      return;
    }

    setRangeError('');
    setIsSelected(true);
    onSelect?.({ start, end });
  };

  return (
    <div className="date-range-container">
      <div className="date-range-grid">
        {/* Start Date */}
        <div>
          <label><strong>Start Date</strong></label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MM/dd/yyyy"
            className="form-control"
          />
          <div className="time-input-row">
            <input
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="time-input"
            />
            <span>:</span>
            <input
              value={startMinute}
              onChange={(e) => setStartMinute(e.target.value)}
              className="time-input"
            />
            <select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)}>
              <option>AM</option>
              <option>PM</option>
            </select>
            {!startTimeValid && <span style={{ color: 'red' }}>❌</span>}
          </div>
        </div>

        {/* End Date */}
        <div>
          <label><strong>End Date</strong></label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="MM/dd/yyyy"
            className="form-control"
          />
          <div className="time-input-row">
            <input
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className="time-input"
            />
            <span>:</span>
            <input
              value={endMinute}
              onChange={(e) => setEndMinute(e.target.value)}
              className="time-input"
            />
            <select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)}>
              <option>AM</option>
              <option>PM</option>
            </select>
            {!endTimeValid && <span style={{ color: 'red' }}>❌</span>}
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button onClick={handleReset} className="reset-button">
            Reset
          </button>
          <button
            onClick={handleSelect}
            className={`select-button ${isSelected ? 'active' : 'inactive'}`}
          >
            Select
          </button>
        </div>
      </div>

      {rangeError && <p className="range-error">{rangeError}</p>}
    </div>
  );
}
