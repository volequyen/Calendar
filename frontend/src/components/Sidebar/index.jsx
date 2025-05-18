import React, { useState } from "react";
import dayjs from "dayjs";
import { IoMdAdd } from "react-icons/io";

const Sidebar = () => {
  const currentDate = dayjs();
  const [month, setMonth] = useState(currentDate.month());
  const [year, setYear] = useState(currentDate.year());
  const [selectedDate, setSelectedDate] = useState(currentDate.date());
  
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const getDaysInMonth = (year, month) => {
    const startOfMonth = dayjs(new Date(year, month, 1));
    const endOfMonth = startOfMonth.endOf("month");
    const startDay = startOfMonth.day();

    const daysArray = [];
    for (let i = 0; i < startDay; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= endOfMonth.date(); d++) {
      daysArray.push(d);
    }
    return daysArray;
  };

  const days = getDaysInMonth(year, month);

  return (
    <aside className="w-72 min-w-[220px] bg-white h-screen shadow-lg rounded-r-2xl flex flex-col items-center py-8 px-4 border-r border-gray-100">
      <div className="mb-6 w-full flex flex-col items-center">
        <h2 className="text-lg font-bold text-emerald-700 mb-2">Lịch tháng</h2>
        <div className="flex space-x-2 w-full justify-center">
          <select
            className="px-2 py-1 rounded-md border border-gray-200 focus:ring-emerald-400 focus:border-emerald-400"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <select
            className="px-2 py-1 rounded-md border border-gray-200 focus:ring-emerald-400 focus:border-emerald-400"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 21 }, (_, i) => (
              <option key={i} value={2020 + i}>
                {2020 + i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2 w-full">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-sm gap-y-1 w-full">
        {days.map((day, index) =>
          day === null ? (
            <div key={index}></div>
          ) : (
            <div
              key={index}
              className={`py-2 cursor-pointer rounded-full transition-all duration-150
                ${day === selectedDate && month === currentDate.month() && year === currentDate.year()
                  ? "bg-emerald-700 text-white font-bold shadow-md"
                  : "hover:bg-emerald-100 text-gray-700"}
              `}
              onClick={() => setSelectedDate(day)}
            >
              {day}
            </div>
          )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
