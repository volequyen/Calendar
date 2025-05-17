import { useState, useCallback } from 'react';
import { isEqual, isBefore } from 'date-fns';

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
    invited_users: ['user1@example.com', 'user2@example.com'],
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
    invited_users: [],
  },
];


const useAppointments = () => {
  const [appointments, setAppointments] = useState(mockAppointments);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultTimeSlots = [
    '08:00 am', '09:00 am', '10:00 am', '11:00 am', '12:00 pm',
    '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm', '05:00 pm',
  ];

  const parseDateTime = useCallback((date, timeStr) => {
    const dateObj = new Date(date);
    const timeParts = timeStr.match(/(\d+):(\d+)\s+(am|pm)/i);

    if (!timeParts) return null;

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const period = timeParts[3].toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  }, []);

  const availableEndTimes = useCallback(
    (startTime) => {
      if (!startTime) return [];
      const startIdx = defaultTimeSlots.indexOf(startTime);
      return defaultTimeSlots.slice(startIdx + 1);
    },
    [defaultTimeSlots]
  );

  const hasConflict = useCallback(
    (startTime, endTime) => {
      return appointments.find((appointment) => {
        return (
          (startTime >= appointment.start_time && startTime < appointment.end_time) ||
          (endTime > appointment.start_time && endTime <= appointment.end_time) ||
          (startTime <= appointment.start_time && endTime >= appointment.end_time)
        );
      }) || null;
    },
    [appointments]
  );

  const isSameGroupMeeting = useCallback((appointment1, appointment2) => {
    return (
      appointment1.is_group_meeting &&
      appointment2.is_group_meeting &&
      appointment1.name === appointment2.name &&
      isEqual(appointment1.start_time, appointment2.start_time) &&
      isEqual(appointment1.end_time, appointment2.end_time)
    );
  }, []);

  const addAppointment = useCallback((appointment) => {
    setAppointments((prev) => [...prev, appointment]);
  }, []);

  const replaceAppointment = useCallback((conflictId, newAppointment) => {
    setAppointments((prev) =>
      [...prev.filter((app) => app.id !== conflictId), newAppointment]
    );
  }, []);

  const joinGroupMeeting = useCallback((conflictId, newInvitedUsers) => {
    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id === conflictId) {
          const updatedInvites = [...new Set([...app.invited_users, ...newInvitedUsers])];
          return { ...app, invited_users: updatedInvites };
        }
        return app;
      })
    );
  }, []);

  return {
    appointments,
    addAppointment,
    replaceAppointment,
    joinGroupMeeting,
    hasConflict,
    isSameGroupMeeting,
    parseDateTime,
    defaultTimeSlots,
    availableEndTimes,
  };
};

export default useAppointments;