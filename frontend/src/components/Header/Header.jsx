import React, { useState, useContext } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Check, LogOut } from "lucide-react";
import { SiGooglecalendar } from "react-icons/si";
import { AuthContext } from "../../context/authProvider";
const CalendarHeader = ({ currentDate, onPrevWeek, onNextWeek, onToday, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { getEmail } = useContext(AuthContext);
  const email = getEmail();
  const monthYear = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    setShowLogoutConfirm(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
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
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100" onClick={handleLogoutClick}>
              <img
                src="/api/placeholder/64/64"
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            </button>
            {showLogoutConfirm && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-10 w-48">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">Tài khoản của bạn</p>
                  <p className="text-xs text-gray-500">{email}</p>
                </div>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
                <button
                  onClick={handleLogoutCancel}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarHeader;