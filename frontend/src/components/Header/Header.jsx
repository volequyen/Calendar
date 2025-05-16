import React from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Check } from "lucide-react";

const CalendarHeader = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm border-b">
      {/* Logo + Title */}
      <div className="flex items-center gap-2">
        <img src="https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_17_2x.png" alt="Google Calendar" className="w-8 h-8" />
        <span className="text-lg font-medium text-gray-800">Lịch</span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button className="px-4 py-1 text-sm font-medium text-gray-700 border rounded-full hover:bg-gray-100">
          Hôm nay
        </button>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-gray-100">
            <ChevronLeft size={18} />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <ChevronRight size={18} />
          </button>
        </div>
        <span className="text-sm text-gray-800 font-medium">Tháng 5, 2025</span>
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
            src="https://i.imgur.com/oW1nKMI.png" 
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
