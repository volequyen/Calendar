import React, { useState, useCallback, useRef } from 'react';
import { format, isToday, isSameDay, isBefore, isEqual } from 'date-fns';
import ConflictResolutionModal from '../ConflictResolutionModal';
import CalendarTitleModal from '../CalendarTitleModal';

const mockAppointments = [
  {
    id: 1,
    name: "Team Meeting",
    location: "Conference Room A",
    start_time: new Date(2025, 4, 20, 10, 0),
    end_time: new Date(2025, 4, 20, 11, 0),
    user_id: 1,
    is_group_meeting: true,
    reminders: ['15 minutes before'],
    invited_users: ['user1@example.com', 'user2@example.com']
  },
  {
    id: 2,
    name: "Client Call",
    location: "Zoom",
    start_time: new Date(2025, 4, 21, 14, 0),
    end_time: new Date(2025, 4, 21, 15, 0),
    user_id: 1,
    is_group_meeting: false,
    reminders: ['30 minutes before'],
    invited_users: []
  }
];

const DateTimePicker = ({ onSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [step, setStep] = useState(null);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState(mockAppointments);
  const [appointmentDetails, setAppointmentDetails] = useState({
    name: "",
    location: "",
    reminders: [],
    invitedUsers: ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [conflictResolution, setConflictResolution] = useState({
    show: false,
    conflictAppointment: null,
    newAppointment: null,
    isSameGroup: false
  });
  const isConfirming = useRef(false);

  const defaultTimeSlots = [
    '08:00 am', '09:00 am', '10:00 am', '11:00 am', '12:00 pm',
    '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm', '05:00 pm'
  ];

  const availableEndTimes = () => {
    if (!selectedStartTime) return [];
    const startIdx = defaultTimeSlots.indexOf(selectedStartTime);
    return defaultTimeSlots.slice(startIdx + 1);
  };

  const reset = useCallback(() => {
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setStep(null);
    setError("");
    setAppointmentDetails({
      name: "",
      location: "",
      reminders: [],
      invitedUsers: ""
    });
    setConflictResolution({
      show: false,
      conflictAppointment: null,
      newAppointment: null,
      isSameGroup: false
    });
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  }, []);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setError("");
  }, []);

  const handleStartTimeSelect = useCallback((time) => {
    setSelectedStartTime(time);
    setSelectedEndTime(null);
    setError("");
  }, []);

  const handleEndTimeSelect = useCallback((time) => {
    setSelectedEndTime(time);
    setError("");
  }, []);

  const parseDateTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const timeParts = timeStr.match(/(\d+):(\d+)\s+(am|pm)/i);

    if (!timeParts) return null;

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const period = timeParts[3].toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const hasConflict = (startTime, endTime) => {
    const conflict = appointments.find(appointment => {
      return (
        (startTime >= appointment.start_time && startTime < appointment.end_time) ||
        (endTime > appointment.start_time && endTime <= appointment.end_time) ||
        (startTime <= appointment.start_time && endTime >= appointment.end_time)
      );
    });
    return conflict || null;
  };

  const isSameGroupMeeting = (appointment1, appointment2) => {
    return (
      appointment1.is_group_meeting &&
      appointment2.is_group_meeting &&
      appointment1.name === appointment2.name &&
      isEqual(appointment1.start_time, appointment2.start_time) &&
      isEqual(appointment1.end_time, appointment2.end_time)
    );
  };

  const handleDateTimeConfirm = useCallback(() => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      setError("Please select a date and time range");
      return;
    }

    const startDateTime = parseDateTime(selectedDate, selectedStartTime);
    const endDateTime = parseDateTime(selectedDate, selectedEndTime);

    if (startDateTime >= endDateTime) {
      setError("End time must be after start time");
      return;
    }

    setStep('details');
  }, [selectedDate, selectedStartTime, selectedEndTime]);

  const handleDetailsConfirm = useCallback(() => {
    if (isConfirming.current) return;
    isConfirming.current = true;

    if (!appointmentDetails.name.trim()) {
      setError("Please enter a meeting name");
      isConfirming.current = false;
      return;
    }

    const startDateTime = parseDateTime(selectedDate, selectedStartTime);
    const endDateTime = parseDateTime(selectedDate, selectedEndTime);

    const newAppointment = {
      id: appointments.length + 1,
      name: appointmentDetails.name.trim(),
      location: appointmentDetails.location.trim() || "Office",
      start_time: startDateTime,
      end_time: endDateTime,
      user_id: 1,
      is_group_meeting: appointmentDetails.invitedUsers.length > 0,
      reminders: appointmentDetails.reminders,
      invited_users: appointmentDetails.invitedUsers
        .split(',')
        .map(email => email.trim())
        .filter(email => email)
    };

    const conflictAppointment = hasConflict(startDateTime, endDateTime);

    if (conflictAppointment) {
      setConflictResolution({
        show: true,
        conflictAppointment,
        newAppointment,
        isSameGroup: isSameGroupMeeting(newAppointment, conflictAppointment)
      });
      isConfirming.current = false;
      return;
    }

    console.log('New Appointment Created:', newAppointment);
    setAppointments(prev => [...prev, newAppointment]);
    if (onSelect) onSelect(newAppointment);
    showSuccess("Appointment scheduled successfully!");
    reset();
    isConfirming.current = false;
  }, [appointmentDetails, selectedDate, selectedStartTime, selectedEndTime, appointments, onSelect, reset, showSuccess]);

  const handleReplaceAppointment = useCallback(() => {
    const { conflictAppointment, newAppointment } = conflictResolution;
    
    const updatedAppointments = appointments.filter(
      app => app.id !== conflictAppointment.id
    );
    
    setAppointments([...updatedAppointments, newAppointment]);
    if (onSelect) onSelect(newAppointment);
    showSuccess("Appointment replaced successfully!");
    
    reset();
  }, [conflictResolution, appointments, onSelect, showSuccess, reset]);

  const handleJoinGroupMeeting = useCallback(() => {
    const { conflictAppointment, newAppointment } = conflictResolution;
    
    const updatedAppointments = appointments.map(app => {
      if (app.id === conflictAppointment.id) {
        const updatedInvites = [
          ...new Set([...app.invited_users, ...newAppointment.invited_users])
        ];
        return {
          ...app,
          invited_users: updatedInvites
        };
      }
      return app;
    });
    
    setAppointments(updatedAppointments);
    if (onSelect) onSelect(conflictAppointment);
    showSuccess("You've joined the group meeting!");
    
    reset();
  }, [conflictResolution, appointments, onSelect, showSuccess, reset]);

  const handleKeepExisting = useCallback(() => {
    reset();
  }, [reset]);

  const handleSelectDifferentTime = useCallback(() => {
    setConflictResolution(prev => ({ ...prev, show: false }));
    setStep('date');
  }, []);

  const handleCloseConflictModal = useCallback(() => {
    setConflictResolution(prev => ({ ...prev, show: false }));
  }, []);

  const DatePicker = ({ selected, onChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const prevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onChange(newDate);
    };

    const isSelected = (day) => {
      if (!selected) return false;
      return isSameDay(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        selected
      );
    };

    const isCurrentDay = (day) => {
      return isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    };

    const isPast = (day) => {
      const today = new Date();
      const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return isBefore(checkDate, new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    };

    const renderDays = () => {
      const days = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const isDisabled = isPast(day);
        days.push(
          <button
            key={day}
            type="button"
            onClick={() => !isDisabled && handleDateClick(day)}
            disabled={isDisabled}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              ${isSelected(day) ? 'bg-green-500 text-white' : ''}
              ${isCurrentDay(day) && !isSelected(day) ? 'border border-green-500' : ''}
              ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-green-100 text-gray-800'}
            `}
          >
            {day}
          </button>
        );
      }

      return days;
    };

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button 
            type="button" 
            onClick={prevMonth}
            className="p-1 text-gray-600 hover:text-green-500 rounded-full hover:bg-gray-100"
          >
            &lt;
          </button>
          <span className="text-lg font-medium text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button 
            type="button" 
            onClick={nextMonth}
            className="p-1 text-gray-600 hover:text-green-500 rounded-full hover:bg-gray-100"
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderDays()}
        </div>
      </div>
    );
  };

  const TimeSlotSelector = ({ timeSlots, selectedTime, onSelect, label }) => (
    <div>
      <h4 className="text-base font-semibold text-gray-800 mb-2">{label}</h4>
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((time) => (
          <button
            type="button"
            key={time}
            onClick={() => onSelect(time)}
            className={`p-2 rounded-md text-sm font-medium
              ${selectedTime === time ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );

  const DateTimeModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          onClick={reset}
        />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <button
            type="button"
            onClick={reset}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Date</h3>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateSelect}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Time</h3>
              <TimeSlotSelector
                timeSlots={defaultTimeSlots}
                selectedTime={selectedStartTime}
                onSelect={handleStartTimeSelect}
                label="Start Time"
              />
              {selectedStartTime && (
                <div className="mt-4">
                  <TimeSlotSelector
                    timeSlots={availableEndTimes()}
                    selectedTime={selectedEndTime}
                    onSelect={handleEndTimeSelect}
                    label="End Time"
                  />
                </div>
              )}
            </div>
            {error && (
              <div className="col-span-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <div className="col-span-2 flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDateTimeConfirm}
                disabled={!selectedDate || !selectedStartTime || !selectedEndTime}
                className={`px-4 py-2 rounded-md text-sm
                  ${!selectedDate || !selectedStartTime || !selectedEndTime
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Appointment Scheduler</h2>
            <p className="text-gray-600">Manage your schedule and meetings</p>
          </div>
          <button
            type="button"
            onClick={() => setStep('date')}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
          >
            New Appointment
          </button>
        </div>
        {successMessage && (
          <div className="p-3 bg-green-100 border border-green-200 rounded-md text-green-700 text-sm">
            {successMessage}
          </div>
        )}
      </div>

      {step === 'date' && <DateTimeModal />}
      {step === 'details' && (
        <CalendarTitleModal
          selectedDate={selectedDate}
          selectedStartTime={selectedStartTime}
          selectedEndTime={selectedEndTime}
          appointmentDetails={appointmentDetails}
          setAppointmentDetails={setAppointmentDetails}
          setStep={setStep}
          error={error}
          handleDetailsConfirm={handleDetailsConfirm}
          onClose={reset}
        />
      )}

      {conflictResolution.show && (
        <ConflictResolutionModal
          conflictAppointment={conflictResolution.conflictAppointment}
          onReplace={handleReplaceAppointment}
          onKeepExisting={handleKeepExisting}
          onSelectDifferentTime={handleSelectDifferentTime}
          onJoinGroupMeeting={conflictResolution.isSameGroup ? handleJoinGroupMeeting : null}
          onClose={handleCloseConflictModal}
        />
      )}
    </div>
  );
};

export default DateTimePicker;