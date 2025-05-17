import React, { useState, useCallback, useRef } from 'react';
import SchedulerModal from '../DateTimeModal/SchedulerModal';
import CalendarTitleModal from '../CalendarTitleModal';
import ConflictResolutionModal from '../ConflictResolutionModal';
import useAppointments from '../DateTimeModal/useAppointments';

const DateTimePicker = ({ onSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [step, setStep] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState({
    name: '',
    location: '',
    reminders: [],
    invitedUsers: '',
  });
  const [conflictResolution, setConflictResolution] = useState({
    show: false,
    conflictAppointment: null,
    newAppointment: null,
    isSameGroup: false,
  });
  const isConfirming = useRef(false);

  const {
    addAppointment,
    replaceAppointment,
    joinGroupMeeting,
    hasConflict,
    isSameGroupMeeting,
    parseDateTime,
    defaultTimeSlots,
    availableEndTimes,
  } = useAppointments();

  const reset = useCallback(() => {
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setStep(null);
    setError('');
    setAppointmentDetails({
      name: '',
      location: '',
      reminders: [],
      invitedUsers: '',
    });
    setConflictResolution({
      show: false,
      conflictAppointment: null,
      newAppointment: null,
      isSameGroup: false,
    });
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setError('');
  }, []);

  const handleStartTimeSelect = useCallback((time) => {
    setSelectedStartTime(time);
    setSelectedEndTime(null);
    setError('');
  }, []);

  const handleEndTimeSelect = useCallback((time) => {
    setSelectedEndTime(time);
    setError('');
  }, []);

  const handleDateTimeConfirm = useCallback(() => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      setError('Please select a date and time range');
      return;
    }

    const startDateTime = parseDateTime(selectedDate, selectedStartTime);
    const endDateTime = parseDateTime(selectedDate, selectedEndTime);

    if (startDateTime >= endDateTime) {
      setError('End time must be after start time');
      return;
    }

    setStep('details');
  }, [selectedDate, selectedStartTime, selectedEndTime, parseDateTime]);

  const handleDetailsConfirm = useCallback(() => {
    if (isConfirming.current) return;
    isConfirming.current = true;

    if (!appointmentDetails.name.trim()) {
      setError('Please enter a meeting name');
      isConfirming.current = false;
      return;
    }

    const startDateTime = parseDateTime(selectedDate, selectedStartTime);
    const endDateTime = parseDateTime(selectedDate, selectedEndTime);

    const newAppointment = {
      id: Date.now(),
      name: appointmentDetails.name.trim(),
      location: appointmentDetails.location.trim() || 'Office',
      start_time: startDateTime,
      end_time: endDateTime,
      user_id: 1,
      is_group_meeting: appointmentDetails.invitedUsers.length > 0,
      reminders: appointmentDetails.reminders,
      invited_users: appointmentDetails.invitedUsers
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email),
    };

    const conflictAppointment = hasConflict(startDateTime, endDateTime);

    if (conflictAppointment) {
      setConflictResolution({
        show: true,
        conflictAppointment,
        newAppointment,
        isSameGroup: isSameGroupMeeting(newAppointment, conflictAppointment),
      });
      isConfirming.current = false;
      return;
    }

    console.log('New Appointment Added:', newAppointment);
    addAppointment(newAppointment);
    if (onSelect) onSelect(newAppointment);
    showSuccess('Appointment scheduled successfully!');
    reset();
    isConfirming.current = false;
  }, [
    appointmentDetails,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    parseDateTime,
    hasConflict,
    isSameGroupMeeting,
    addAppointment,
    onSelect,
    reset,
    showSuccess,
  ]);

  const handleReplaceAppointment = useCallback(() => {
    const { conflictAppointment, newAppointment } = conflictResolution;
    console.log('Replacing Appointment:', {
      oldAppointment: conflictAppointment,
      newAppointment,
    });
    replaceAppointment(conflictAppointment.id, newAppointment);
    if (onSelect) onSelect(newAppointment);
    showSuccess('Appointment replaced successfully!');
    reset();
  }, [conflictResolution, replaceAppointment, onSelect, showSuccess, reset]);

  const handleJoinGroupMeeting = useCallback(() => {
    const { conflictAppointment, newAppointment } = conflictResolution;
    joinGroupMeeting(conflictAppointment.id, newAppointment.invited_users);
    if (onSelect) onSelect(conflictAppointment);
    showSuccess("You've joined the group meeting!");
    reset();
  }, [conflictResolution, joinGroupMeeting, onSelect, showSuccess, reset]);

  const handleKeepExisting = useCallback(() => {
    reset();
  }, [reset]);

  const handleSelectDifferentTime = useCallback(() => {
    setConflictResolution((prev) => ({ ...prev, show: false }));
    setStep('date');
  }, []);

  const handleCloseConflictModal = useCallback(() => {
    setConflictResolution((prev) => ({ ...prev, show: false }));
  }, []);

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

      {step === 'date' && (
        <SchedulerModal
          selectedDate={selectedDate}
          selectedStartTime={selectedStartTime}
          selectedEndTime={selectedEndTime}
          defaultTimeSlots={defaultTimeSlots}
          availableEndTimes={availableEndTimes}
          onDateSelect={handleDateSelect}
          onStartTimeSelect={handleStartTimeSelect}
          onEndTimeSelect={handleEndTimeSelect}
          onConfirm={handleDateTimeConfirm}
          onClose={reset}
          error={error}
        />
      )}
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