import React, { useState } from "react";
import dayjs from "dayjs";
import { IoMdAdd } from "react-icons/io";

const Sidebar = () => {
 const currentDate = dayjs();
  const [month, setMonth] = useState(currentDate.month()); 
  const [year, setYear] = useState(currentDate.year());
  const [selectedDate, setSelectedDate] = useState(currentDate.date());

  const daysOfWeek = ["Cn", "T2", "T3", "T4", "T5", "T6", "T7"];

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
    <div className="min-w-xs p-4 bg-emerald-50 space-y-4 h-screen">
    {/* <button className="flex items-center px-8 py-4 bg-white border border-gray-300 rounded-2xl shadow-lg hover:bg-emerald-100 hover:cursor-pointer transition">
      <IoMdAdd />
      <span className="font-medium">Tạo</span>
    </button> */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <select
            className="px-2 py-1"
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
            className="px-2 py-1"
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

      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((day, index) =>
          day === null ? (
            <div key={index}></div>
          ) : (
            <div
              key={index}
              className={`py-2 cursor-pointer rounded-full hover:bg-emerald-100 ${
                day === selectedDate &&
                month === currentDate.month() &&
                year === currentDate.year()
                  ? "bg-emerald-800 text-white font-semibold"
                  : ""
              }`}
              onClick={() => setSelectedDate(day)}
            >
              {day}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Sidebar;
