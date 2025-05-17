import CalendarHeader from "../../components/Header/Header";
import { useState } from "react";
import WeekCalendar from "../../components/Calendar/";

const Home = () => {
 const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const day = now.getDay(); // 0 (CN) - 6 (Th7)
    // Lấy ngày Chủ nhật của tuần hiện tại làm mốc
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  // Hàm chuyển sang tuần trước
  const prevWeek = () => {
    setCurrentDate((date) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  // Hàm chuyển sang tuần sau
  const nextWeek = () => {
    setCurrentDate((date) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // Hàm về tuần hiện tại
  const goToday = () => {
    const now = new Date();
    const day = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    setCurrentDate(sunday);
  };

  return (
    <div>
      <CalendarHeader
        currentDate={currentDate}
        onPrevWeek={prevWeek}
        onNextWeek={nextWeek}
        onToday={goToday}
      />
      <WeekCalendar currentDate={currentDate} />
    </div>

  );
}

export default Home