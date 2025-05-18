import React, { useState, useEffect, useContext } from 'react';
import DateTimePicker from '../../components/CalendarTime';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../context/authProvider';
import useAppointmentsStore from '../../store/appointmentsStore';

export default function WeekCalendar({ currentDate = new Date() }) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [days, setDays] = useState([]);
  const { getUserId } = useContext(AuthContext);
  const user_id = getUserId();
  const { appointments, fetchAppointments } = useAppointmentsStore();

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

  // Fetch appointments when component mounts or currentDate changes
  useEffect(() => {
    if (!user_id) return;
    fetchAppointments(user_id);
  }, [user_id, currentDate, fetchAppointments]);

  // Debug appointments changes
  useEffect(() => {
    console.log("Appointments updated:", appointments);
  }, [appointments]);

  // Handle selection from DateTimePicker
  const handleSelect = async (selection) => {
    if (!selection) return;
    console.log("New event selected:", selection);
    setPickerOpen(false);
  };

  // Hours for the time slots
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Get events for a specific time slot - memoize the result
  const getEventsForSlot = React.useCallback((hourLabel, day, fullDate) => {
    if (!fullDate) return [];

    const slotHour = parseInt(hourLabel.split(':')[0], 10);

    return appointments.filter(ev => {
      if (!ev.startTime) return false;

      const startTime = ev.startTime instanceof Date ? ev.startTime : new Date(ev.startTime);
      const endTime = ev.endTime instanceof Date ? ev.endTime : new Date(ev.endTime);

      const isSameYear = startTime.getFullYear() === fullDate.getFullYear();
      const isSameMonth = startTime.getMonth() === fullDate.getMonth();
      const isSameDay = startTime.getDate() === fullDate.getDate();

      if (!(isSameYear && isSameMonth && isSameDay)) return false;

      const eventHour = startTime.getHours();
      return eventHour === slotHour;
    });
  }, [appointments]);

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

  // Memoize the EventCard component
  const EventCard = React.memo(({ event }) => {
    const formatTime = React.useCallback((date) => {
      const time = date instanceof Date ? date : new Date(date);
      return time.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }, []);

    return (
      <div className={`absolute ${event.color || 'bg-emerald-800'} text-white p-2 rounded-md shadow-md z-10 w-full h-24`}>
        <p className="font-medium">{event.name || event.title}</p>
        <p className="text-sm">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
      </div>
    );
  });

  // Memoize the time slot rendering
  const renderTimeSlot = React.useCallback((hour, day, fullDate) => {
    const isSelected = selectedSlot && selectedSlot.hour === hour && selectedSlot.day === day.number;
    const slotEvents = getEventsForSlot(hour, day.number, day.fullDate);

    return (
      <div
        key={`slot-${hour}-${day.number}`}
        className={`border-l border-b border-gray-200 p-2 relative min-h-16 cursor-pointer transition-colors 
          ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
        onClick={() => handleSlotClick(hour, day.number, day.fullDate)}
      >
        {slotEvents.length > 0 && slotEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  }, [selectedSlot, getEventsForSlot, handleSlotClick]);

  return (
    <div className="flex h-screen max-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto flex flex-col h-screen max-h-screen">
          <div className="grid grid-cols-8 gap-0 border-b border-gray-200 bg-white">
            <div className="p-4 text-center text-sm text-gray-500">GMT+07</div>
            {days.map((day) => (
              <div key={day.number} className={`p-4 text-center border-l border-gray-200`}>
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
                <React.Fragment key={`hour-row-${hourIdx}`}>
                  <div key={`hour-${hourIdx}`} className="p-2 text-right text-sm text-gray-500 border-b border-gray-200 sticky left-0 bg-white">
                    {hourIdx.toString().padStart(2, '0')}:00
                  </div>
                  {days.map((day) => renderTimeSlot(hour, day, day.fullDate))}
                </React.Fragment>
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
              events={appointments}
            />
          )}
        </div>
      </div>
    </div>
  );
}