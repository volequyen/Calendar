import { useState, useEffect } from 'react';
import DateTimePicker from '../../components/CalendarTime';

export default function WeekCalendar({ currentDate }) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [days, setDays] = useState([]);
  
  // Cập nhật mảng days mỗi khi currentDate thay đổi
  useEffect(() => {
    if (!currentDate) return;
    
    const weekDays = [];
    const dayLabels = ['CN', 'TH 2', 'TH 3', 'TH 4', 'TH 5', 'TH 6', 'TH 7'];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDate);
      day.setDate(currentDate.getDate() + i);
      weekDays.push({
        abbr: dayLabels[i],
        number: day.getDate(),
        fullDate: new Date(day) // Lưu ngày đầy đủ để sử dụng khi mở DateTimePicker
      });
    }
    
    setDays(weekDays);
  }, [currentDate]);

  const handleSelect = (selection) => {
    if (!selection) return;
    const title = selection.name;                               
    const start = new Date(selection.start_time);              
    const end   = new Date(selection.end_time);

    const fmt = (d) => d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false          
    });

    const colors = ['bg-emerald-800', 'bg-blue-700', 'bg-purple-700', 'bg-red-700', 'bg-amber-700'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newEvent = {
      title,                       
      startTime: fmt(start),      
      endTime:   fmt(end),       
      day:       start.getDate(),
      color: randomColor   
    };

    console.log('Adding new event:', newEvent);
    setEvents(prev => [...prev, newEvent]);  
    closeModal();
  };

  const hourOf = (timeStr) => parseInt(timeStr.split(':')[0], 10);

  const [events, setEvents] = useState([{
    title: 'Đi dự hội thảo AI',
    startTime: '8:30',
    endTime: '10:30',
    day: 17,
    color: 'bg-emerald-800'
  }]);

  // Lưu thông tin slot được chọn với thông tin ngày và giờ đầy đủ
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [preselectedDateTime, setPreselectedDateTime] = useState({
    date: null,
    startTime: null
  });
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
  const getEventsForSlot = (hourLabel, day) => {
    const slotHour = parseInt(hourLabel.split(':')[0], 10);  
    return events.filter(ev => {
      const eventStartHour = hourOf(ev.startTime);
      return ev.day === day && eventStartHour === slotHour;
    });
  };
  
  // Cập nhật hàm xử lý khi click vào slot
  const handleSlotClick = (hour, day, fullDate) => {
    setSelectedSlot({ hour, day });
    
    // Tạo đối tượng Date cho ngày và giờ được chọn
    const selectedDateTime = new Date(fullDate);
    const hourValue = parseInt(hour.split(':')[0], 10);
    selectedDateTime.setHours(hourValue, 0, 0, 0);
    
    // Chuyển đổi định dạng giờ để phù hợp với DateTimePicker
    // DateTimePicker sử dụng định dạng "hh:mm am/pm"
    const formattedHour = hourValue % 12 || 12;
    const ampm = hourValue >= 12 ? 'pm' : 'am';
    const formattedTime = `${formattedHour.toString().padStart(2, '0')}:00 ${ampm}`;
    
    // Cập nhật thông tin preselectedDateTime
    setPreselectedDateTime({
      date: selectedDateTime,
      startTime: formattedTime
    });
    
    setPickerOpen(true);         
  };  
  
  const closeModal = () => {
    setPickerOpen(false);         
    setSelectedSlot(null);
    setPreselectedDateTime({ date: null, startTime: null });
  };
  
  const EventCard = ({ event }) => (
    <div className={`absolute ${event.color || 'bg-emerald-800'} text-white p-2 rounded-md shadow-md z-10 w-full h-24`}>
      <p className="font-medium">{event.title}</p>
      <p className="text-sm">{event.startTime} - {event.endTime}</p>
    </div>
  );
  
  return (
    <div className="container mx-auto flex flex-col h-screen max-h-screen">
      <div className="grid grid-cols-8 gap-0 border-b border-gray-200 bg-white">
        <div className="p-4 text-center text-sm text-gray-500">GMT+07</div>
        {days.map((day, idx) => (
          <div key={idx} className={`p-4 text-center border-l border-gray-200`}>
            <div>
              <div className="text-sm text-gray-500">{day.abbr}</div>
              <div className="text-xl font-semibold">{day.number}</div>
            </div>
          </div>
        ))}
      </div>
 
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 gap-0">
          {hours.map((hour, hourIdx) => (
            <>
              <div key={`hour-${hourIdx}`} className="p-2 text-right text-sm text-gray-500 border-b border-gray-200 sticky left-0 bg-white">
                {hourIdx.toString().padStart(2, '0')}:00
              </div>

              {days.map((day, dayIdx) => {
                const isSelected = selectedSlot && selectedSlot.hour === hour && selectedSlot.day === day.number;
                const slotEvents = getEventsForSlot(hour, day.number);
                
                return (
                  <div 
                    key={`slot-${hourIdx}-${dayIdx}`} 
                    className={`border-l border-b border-gray-200 p-2 relative min-h-16 cursor-pointer transition-colors 
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleSlotClick(hour, day.number, day.fullDate)}
                  >
                    {slotEvents.length > 0 && slotEvents.map((event, eventIdx) => (
                      <EventCard key={eventIdx} event={event} />
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
      
      {isPickerOpen && (
        <DateTimePicker
          open={isPickerOpen}
          onClose={closeModal}
          onSelect={(selection) => {
            handleSelect(selection);  
            closeModal();             
          }}
          preselectedDate={preselectedDateTime.date}
          preselectedStartTime={preselectedDateTime.startTime}
        />
      )}
    </div>
  );
}