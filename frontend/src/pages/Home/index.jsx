import CalendarHeader from "../../components/Header/Header";
import { useState } from "react";
import WeekCalendar from "../../components/Calendar/";


const Home = () => {
  
 const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const day = now.getDay(); 
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  const prevWeek = () => {
    setCurrentDate((date) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() - 7);
       console.log("Prev Week Date:", newDate);
      return newDate;
    });
  };

  const nextWeek = () => {
    setCurrentDate((date) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

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