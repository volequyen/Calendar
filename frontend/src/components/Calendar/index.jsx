import React, { useState, useEffect } from 'react';
import DateTimePicker from '../../components/CalendarTime';

export default function WeekCalendar({ currentDate = new Date() }) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [days, setDays] = useState([]);
  
  // State for events with proper Date objects
  const [events, setEvents] = useState([{
    title: 'Đi dự hội thảo AI',
    start_time: new Date(2025, 4, 17, 8, 30), 
    end_time: new Date(2025, 4, 17, 10, 30),
    name: 'Đi dự hội thảo AI',
    color: 'bg-emerald-800',
    location: 'Online',
    user_id: 1,
    id: 1,
    is_group_meeting: false,
    reminders: [],
    invited_users: []
  }]);

  // Preselected date/time info for the DateTimePicker
  const [preselectedDateTime, setPreselectedDateTime] = useState({
    date: null,
    startTime: null
  });
  
  // Update days array whenever currentDate changes
  useEffect(() => {
    if (!currentDate) return;
    
    const weekDays = [];
    const dayLabels = ['CN', 'TH 2', 'TH 3', 'TH 4', 'TH 5', 'TH 6', 'TH 7'];
    
    // Create array of day objects for the week
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDate);
      day.setDate(currentDate.getDate() + i);
      weekDays.push({
        abbr: dayLabels[i],
        number: day.getDate(),
        fullDate: new Date(day) // Store full date for use with DateTimePicker
      });
    }
    
    setDays(weekDays);
  }, [currentDate]);

  // Handle selection from DateTimePicker
  const handleSelect = (selection) => {
    if (!selection) return;
    console.log("New event selected:", selection);
    
    // Create a formatted event object with all required properties
    const newEvent = {
      id: events.length + 1,
      name: selection.name,
      title: selection.name,
      start_time: new Date(selection.start_time),
      end_time: new Date(selection.end_time),
      location: selection.location || 'Office',
      user_id: selection.user_id || 1,
      is_group_meeting: selection.is_group_meeting || false,
      reminders: selection.reminders || [],
      invited_users: selection.invited_users || [],
      color: selection.color || getRandomColor()
    };

    setEvents(prev => [...prev, newEvent]);
    setPickerOpen(false);
  };

  // Get a random color for new events
  const getRandomColor = () => {
    const colors = ['bg-emerald-800', 'bg-blue-700', 'bg-purple-700', 'bg-red-700', 'bg-amber-700'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Hours for the time slots
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
  // Get events for a specific time slot
  const getEventsForSlot = (hourLabel, day, fullDate) => {
    if (!fullDate) return [];
    
    const slotHour = parseInt(hourLabel.split(':')[0], 10);
    
    return events.filter(ev => {
      // Skip events without start_time
      if (!ev.start_time) return false;

      // Compare year, month, day
      const isSameYear = ev.start_time.getFullYear() === fullDate.getFullYear();
      const isSameMonth = ev.start_time.getMonth() === fullDate.getMonth();
      const isSameDay = ev.start_time.getDate() === fullDate.getDate();
      
      if (!(isSameYear && isSameMonth && isSameDay)) return false;

      // Check if event starts in this hour slot
      const eventHour = ev.start_time.getHours();
      return eventHour === slotHour;
    });
  };
  
  // Track selected slot
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Handle click on a time slot
  const handleSlotClick = (hour, day, fullDate) => {
    setSelectedSlot({ hour, day });
    
    // Create Date object for selected date and time
    const selectedDateTime = new Date(fullDate);
    const hourValue = parseInt(hour.split(':')[0], 10);
    selectedDateTime.setHours(hourValue, 0, 0, 0);
    
    // Format time for DateTimePicker (hh:mm am/pm)
    const formattedHour = hourValue % 12 || 12;
    const ampm = hourValue >= 12 ? 'pm' : 'am';
    const formattedTime = `${formattedHour.toString().padStart(2, '0')}:00 ${ampm}`;
    
    // Update preselected date/time
    setPreselectedDateTime({
      date: selectedDateTime,
      startTime: formattedTime
    });
    
    setPickerOpen(true);         
  };  
  
  // Close the DateTimePicker modal
  const closeModal = () => {
    setPickerOpen(false);         
    setSelectedSlot(null);
    setPreselectedDateTime({ date: null, startTime: null });
  };
  
  // Format events for display in time slots
  const EventCard = ({ event }) => {
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    return (
      <div className={`absolute ${event.color || 'bg-emerald-800'} text-white p-2 rounded-md shadow-md z-10 w-full h-24`}>
        <p className="font-medium">{event.name || event.title}</p>
        <p className="text-sm">{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
      </div>
    );
  };

  // Convert events to format expected by DateTimePicker
  const formatEventsForDateTimePicker = () => {
    return events.map(event => ({
      id: event.id,
      name: event.name || event.title,
      location: event.location || 'Office',
      start_time: new Date(event.start_time),
      end_time: new Date(event.end_time),
      user_id: event.user_id || 1,
      is_group_meeting: event.is_group_meeting || false,
      reminders: event.reminders || [],
      invited_users: event.invited_users || []
    }));
  };

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
                const slotEvents = getEventsForSlot(hour, day.number, day.fullDate);
                
                return (
                  <div 
                    key={`slot-${hourIdx}-${dayIdx}`} 
                    className={`border-l border-b border-gray-200 p-2 relative min-h-16 cursor-pointer transition-colors 
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleSlotClick(hour, day.number, day.fullDate)}
                  >
                    {slotEvents.length > 0 && slotEvents.map((event, eventIdx) => (
                      <EventCard key={`event-${eventIdx}-${event.id}`} event={event} />
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
          onSelect={handleSelect}
          preselectedDate={preselectedDateTime.date}
          preselectedStartTime={preselectedDateTime.startTime}
          events={formatEventsForDateTimePicker()}
        />
      )}
    </div>
  );
}