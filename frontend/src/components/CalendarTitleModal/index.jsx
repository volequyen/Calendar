import React, { useCallback } from 'react';
import { format, addMinutes, addHours, addDays, parse } from 'date-fns';

const CalendarTitleModal = ({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  appointmentDetails,
  setAppointmentDetails,
  setStep,
  error,
  handleDetailsConfirm,
  onClose
}) => {
  const reminderOptions = [
    { label: '15 minutes before', value: 15, unit: 'minutes' },
    { label: '30 minutes before', value: 30, unit: 'minutes' },
    { label: '1 hour before', value: 1, unit: 'hours' },
    { label: '1 day before', value: 1, unit: 'days' }
  ];

  const parseTimeString = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period.toLowerCase() === 'pm' && hour < 12) hour += 12;
    if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
    return { hour, minute: parseInt(minutes) };
  };

  const calculateReminderTime = (startTime, option) => {
    if (!selectedDate || !startTime) return null;

    const { hour, minute } = parseTimeString(startTime);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(hour, minute, 0, 0);

    switch (option.unit) {
      case 'minutes':
        return addMinutes(startDateTime, -option.value);
      case 'hours':
        return addHours(startDateTime, -option.value);
      case 'days':
        return addDays(startDateTime, -option.value);
      default:
        return startDateTime;
    }
  };

  const handleReminderToggle = useCallback((option) => {
    setAppointmentDetails(prev => {
      const reminderTime = calculateReminderTime(selectedStartTime, option);
      if (!reminderTime) return prev;

      const reminders = prev.reminders.some(r => r.getTime() === reminderTime.getTime())
        ? prev.reminders.filter(r => r.getTime() !== reminderTime.getTime())
        : [...prev.reminders, reminderTime];
      return { ...prev, reminders };
    });
  }, [setAppointmentDetails, selectedStartTime, selectedDate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setAppointmentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  }, [setAppointmentDetails]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Appointment Details</h3>
          <p className="text-sm text-gray-600 mb-4">
            {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''} | {selectedStartTime} - {selectedEndTime}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Name *</label>
              <input
                type="text"
                name="name"
                value={appointmentDetails.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Team Sync"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={appointmentDetails.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Conference Room A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reminders</label>
              <div className="space-y-2">
                {reminderOptions.map(option => {
                  const reminderTime = calculateReminderTime(selectedStartTime, option);
                  return (
                    <label key={option.label} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reminderTime && appointmentDetails.reminders.some(r =>
                          r.getTime() === reminderTime.getTime()
                        )}
                        onChange={() => handleReminderToggle(option)}
                        className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite Users (comma-separated emails)</label>
              <input
                type="text"
                name="invitedUsers"
                value={appointmentDetails.invitedUsers}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., user1@example.com, user2@example.com"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => setStep('date')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleDetailsConfirm}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTitleModal;