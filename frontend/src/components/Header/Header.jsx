import React from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Check } from "lucide-react";
import { SiGooglecalendar } from "react-icons/si";

const CalendarHeader = ({ currentDate, onPrevWeek, onNextWeek, onToday }) => {
  // Hiển thị tháng năm dựa trên currentDate
  const monthYear = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-sm bg-emerald-50">
      {/* Logo + Title */}
      <div className="flex items-center gap-2">
        <SiGooglecalendar className="text-emerald-800 w-8 h-8" />
        <span className="text-lg font-medium text-gray-800">Lịch</span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          className="px-4 py-1 text-sm font-medium text-gray-700 border rounded-full hover:bg-gray-100"
          onClick={onToday}
        >
          Hôm nay
        </button>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={onPrevWeek}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={onNextWeek}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <span className="text-sm text-gray-800 font-medium capitalize">
          {monthYear}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 text-sm text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-full border">
          <span>Tuần</span>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <CalendarDays size={18} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Check size={18} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <img
            src="https://kenh14cdn.com/203336854389633024/2023/3/13/photo-7-16786962482381491930068.jpg"
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        </button>
      </div>
    </div>
  );
};


export default CalendarHeader;
