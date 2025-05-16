import React from "react";

const Sidebar = () => {
  const daysOfWeek = ["Cn", "T2", "T3", "T4", "T5", "T6", "T7"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDayOffset = 4; // 1/5/2025 là Thứ Năm, nên offset = 4

  return (
    <div className="max-w-xs p-4 bg-white rounded-lg shadow space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
          &lt;
        </button>
        <div className="text-center">
          <div className="font-semibold">Tháng 5, 2025</div>
        </div>
        <button className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
          &gt;
        </button>
      </div>

      {/* Create button */}
      <div className="flex items-center justify-center">
        <button className="flex items-center space-x-1 bg-white border rounded-full px-4 py-2 shadow hover:bg-gray-50">
          <span className="text-xl">＋</span>
          <span>Tạo</span>
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-sm text-gray-500">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 text-center text-sm">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}

        {/* Day cells */}
        {daysInMonth.map((day) => (
          <div
            key={day}
            className={`py-1 my-1 rounded-full ${
              day === 17
                ? "bg-blue-600 text-white font-semibold"
                : "hover:bg-gray-200"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
