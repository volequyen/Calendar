import React, { useState } from 'react';
import { format, isToday, isSameDay, isBefore } from 'date-fns';

const DatePicker = ({ selected, onChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onChange(newDate);
  };

  const isSelected = (day) => {
    if (!selected) return false;
    return isSameDay(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      selected
    );
  };

  const isCurrentDay = (day) => {
    return isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const isPast = (day) => {
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return isBefore(checkDate, new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isPast(day);
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateClick(day)}
          disabled={isDisabled}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            ${isSelected(day) ? 'bg-green-500 text-white' : ''}
            ${isCurrentDay(day) && !isSelected(day) ? 'border border-green-500' : ''}
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-green-100 text-gray-800'}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 text-gray-600 hover:text-green-500 rounded-full hover:bg-gray-100"
        >
          &lt;
        </button>
        <span className="text-lg font-medium text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 text-gray-600 hover:text-green-500 rounded-full hover:bg-gray-100"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
};

export default DatePicker;