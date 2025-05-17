import React from 'react';

const TimeSlotSelector = ({ timeSlots, selectedTime, onSelect, label }) => (
  <div>
    <h4 className="text-base font-semibold text-gray-800 mb-2">{label}</h4>
    <div className="grid grid-cols-2 gap-2">
      {timeSlots.map((time) => (
        <button
          type="button"
          key={time}
          onClick={() => onSelect(time)}
          className={`p-2 rounded-md text-sm font-medium
            ${selectedTime === time ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          {time}
        </button>
      ))}
    </div>
  </div>
);

export default TimeSlotSelector;