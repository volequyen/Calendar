import React, { useState, useCallback, useRef, useEffect } from 'react';
import { format, isToday, isSameDay, isBefore, isEqual } from 'date-fns';
import ConflictResolutionModal from '../ConflictResolutionModal';
import CalendarTitleModal from '../CalendarTitleModal';
import { updateAppointmentsApi } from '../../apis/updateAppointments';
import { sendEmailApi } from '../../apis/sendEmail';
import { AuthContext } from '../../context/authProvider';
import { useContext } from 'react';
import useAppointmentsStore from '../../store/appointmentsStore';
import { toLocalISOString } from '../../ultils/changeTime';
const DateTimePicker = ({ open, onClose, onSelect, preselectedDate, preselectedStartTime, events = [] }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [step, setStep] = useState(open ? 'date' : null);
  const [error, setError] = useState("");
  const { getUserId } = useContext(AuthContext);
  const user_id = getUserId();

  // Use appointments store instead of local state
  const { appointments, fetchAppointments, addAppointment, updateAppointment, deleteAppointment } = useAppointmentsStore();

  const [appointmentDetails, setAppointmentDetails] = useState({
    name: "",
    location: "",
    reminders: [],
    invitedUsers: "",
    is_group_meeting: false
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [conflictResolution, setConflictResolution] = useState({
    show: false,
    conflictAppointment: null,
    newAppointment: null,
    isSameGroup: false
  });
  const [appointmentBeingReplaced, setAppointmentBeingReplaced] = useState(null);
  const isConfirming = useRef(false);

  // Fetch appointments when component mounts
  useEffect(() => {
    if (user_id) {
      fetchAppointments(user_id);
    }
  }, [user_id, fetchAppointments]);

  // Add effect to handle appointments updates
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      // Force re-render when appointments change
      setStep(step);
    }
  }, [appointments]);

  // Memoize handlers
  const handleCustomStartTimeChange = useCallback((e) => {
    setCustomStartTime(e.target.value);
  }, []);

  const handleCustomEndTimeChange = useCallback((e) => {
    setCustomEndTime(e.target.value);
  }, []);

  // Memoize the DatePicker component
  const DatePicker = React.memo(({ selected, onChange }) => {
    const [currentDate, setCurrentDate] = useState(preselectedDate || new Date());

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

    const prevMonth = useCallback(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }, [currentDate]);

    const nextMonth = useCallback(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }, [currentDate]);

    const handleDateClick = useCallback((day) => {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onChange(newDate);
    }, [currentDate, onChange]);

    const isSelected = useCallback((day) => {
      if (!selected) return false;
      return isSameDay(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        selected
      );
    }, [selected, currentDate]);

    const isCurrentDay = useCallback((day) => {
      return isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }, [currentDate]);

    const isPast = useCallback((day) => {
      const today = new Date();
      const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return isBefore(checkDate, new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    }, [currentDate]);

    const renderDays = useCallback(() => {
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
    }, [firstDayOfMonth, daysInMonth, isPast, handleDateClick, isSelected, isCurrentDay]);

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
  });

  // Memoize the TimeInput component
  const TimeInput = React.memo(({ value, onChange, label }) => (
    <div className="mb-4">
      <h4 className="text-base font-semibold text-gray-800 mb-2">{label}</h4>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Format: HH:MM am/pm</label>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Example: 09:30 am"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>
    </div>
  ));

  // Memoize the DateTimeModal component
  const DateTimeModal = React.memo(() => {
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
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Enter Time</h3>
              <TimeInput
                value={customStartTime}
                onChange={handleCustomStartTimeChange}
                label="Start Time"
              />
              <TimeInput
                value={customEndTime}
                onChange={handleCustomEndTimeChange}
                label="End Time"
              />
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
                disabled={!selectedDate}
                className={`px-4 py-2 rounded-md text-sm
                  ${!selectedDate
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
  });

  // Khởi tạo từ preselectedDate và preselectedStartTime
  useEffect(() => {
    if (open) {
      if (preselectedDate) {
        setSelectedDate(preselectedDate);
      }

      if (preselectedStartTime) {
        setCustomStartTime(preselectedStartTime);

        // Tự động gợi ý thời gian kết thúc 1 giờ sau thời gian bắt đầu
        const hourMatch = preselectedStartTime.match(/(\d+):(\d+)\s+(am|pm)/i);
        if (hourMatch) {
          let hours = parseInt(hourMatch[1]);
          const minutes = parseInt(hourMatch[2]);
          const period = hourMatch[3].toLowerCase();

          if (period === 'pm' && hours < 12) hours += 12;
          if (period === 'am' && hours === 12) hours = 0;

          //Tính thời gian kết thúc (1 giờ sau)
          hours = (hours + 1) % 24;
          const endPeriod = hours >= 12 ? 'pm' : 'am';
          const endHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);

          const endTimeString = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${endPeriod}`;
          setCustomEndTime(endTimeString);
        }
      }
    }
  }, [open, preselectedDate, preselectedStartTime]);

  const reset = useCallback(() => {
    setSelectedDate(null);
    setCustomStartTime('');
    setCustomEndTime('');
    setStep(null);
    setError("");
    setAppointmentDetails({
      name: "",
      location: "",
      reminders: [],
      invitedUsers: "",
      is_group_meeting: false
    });
    setConflictResolution({
      show: false,
      conflictAppointment: null,
      newAppointment: null,
      isSameGroup: false
    });
    // Reset appointmentBeingReplaced
    setAppointmentBeingReplaced(null);
    if (onClose) onClose();
  }, [onClose]);

  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  }, []);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setError("");
  }, []);

  // Xác thực định dạng thời gian
  const isValidTimeFormat = (timeStr) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s+(am|pm)$/i;
    return timeRegex.test(timeStr);
  };

  const parseDateTime = (dateStr, timeStr) => {
    console.log("Parsing date and time:", { dateStr, timeStr });
    if (!dateStr || !timeStr) {
      console.log("Missing date or time");
      return null;
    }

    const date = new Date(dateStr);
    const timeParts = timeStr.match(/(\d+):(\d+)\s+(am|pm)/i);

    if (!timeParts) {
      console.log("Invalid time format");
      return null;
    }

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const period = timeParts[3].toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    date.setHours(hours, minutes, 0, 0);
    console.log("Parsed date result:", date);
    return date;
  };

  // Sửa đổi hàm hasConflict để bỏ qua sự kiện đang được thay thế
  const hasConflict = (startTime, endTime) => {
    console.log("Checking conflicts for time:", {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    console.log("Current appointments:", appointments.map(apt => ({
      id: apt.id,
      startTime: apt.startTime,
      endTime: apt.endTime
    })));
    console.log("Currently replacing appointment:", appointmentBeingReplaced);

    const conflict = appointments.find(appointment => {
      // Nếu đây là sự kiện đang được thay thế, bỏ qua kiểm tra xung đột
      if (appointmentBeingReplaced && appointment.id === appointmentBeingReplaced.id) {
        console.log("Skipping conflict check for appointment being replaced:", appointment.id);
        return false;
      }

      // Chuyển đổi startTime và endTime thành Date objects nếu chúng là strings
      const appointmentStart = appointment.startTime instanceof Date
        ? appointment.startTime
        : new Date(appointment.startTime);
      const appointmentEnd = appointment.endTime instanceof Date
        ? appointment.endTime
        : new Date(appointment.endTime);

      console.log("Comparing with appointment:", {
        id: appointment.id,
        startTime: appointmentStart.toISOString(),
        endTime: appointmentEnd.toISOString()
      });

      // Kiểm tra xung đột thời gian
      const hasOverlap = (
        (startTime >= appointmentStart && startTime < appointmentEnd) ||
        (endTime > appointmentStart && endTime <= appointmentEnd) ||
        (startTime <= appointmentStart && endTime >= appointmentEnd)
      );

      if (hasOverlap) {
        console.log("Found conflict with appointment:", appointment.id);
      }

      return hasOverlap;
    });

    return conflict || null;
  };

  const isSameGroupMeeting = async (appointment2, userId) => {
    try {
      const data = await checkGroupSimilarApi({
        name: appointment2.name,
        startTime: appointment2.start_time,
        endTime: appointment2.end_time
      }, userId);
      if (data.hasSimilarMeetings) {
        return data.similarMeetings.id;
      }
      return false;
    } catch (error) {
      console.error("Error checking group similarity:", error);
      return false;
    }
  };
  const handleDateTimeConfirm = useCallback(async () => {
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    if (!customStartTime) {
      setError("Please enter a valid start time");
      return;
    }

    if (!customEndTime) {
      setError("Please enter a valid end time");
      return;
    }

    if (!isValidTimeFormat(customStartTime) || !isValidTimeFormat(customEndTime)) {
      setError("Please enter valid time format (e.g., 09:30 am)");
      return;
    }

    const startDateTime = parseDateTime(selectedDate, customStartTime);
    const endDateTime = parseDateTime(selectedDate, customEndTime);

    console.log("Checking for conflicts with:", {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    });

    if (!startDateTime || !endDateTime) {
      setError("Invalid date/time format");
      return;
    }

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time");
      return;
    }

    // Check for conflicts
    const conflict = hasConflict(startDateTime, endDateTime);
    if (conflict) {
      console.log("Found conflict:", conflict);
      const isSameGroup = await isSameGroupMeeting( {
        is_group_meeting: appointmentDetails.is_group_meeting,
        name: appointmentDetails.name,
        start_time: startDateTime,
        end_time: endDateTime
      }, user_id);
      setConflictResolution({
        show: true,
        conflictAppointment: conflict,
        newAppointment: {
          startTime: startDateTime,
          endTime: endDateTime,
          ...appointmentDetails
        },
        isSameGroup
      });
      return;
    }

    // If no conflicts, proceed to next step
    setStep('details');
  }, [selectedDate, customStartTime, customEndTime, appointmentDetails, hasConflict, isSameGroupMeeting]);

  // Sửa hàm handleDetailsConfirm để đảm bảo cập nhật UI
  const handleDetailsConfirm = useCallback(async () => {
    if (!appointmentDetails.name) {
      setError("Please enter a meeting name");
      return;
    }

    try {
      console.log("Starting appointment creation...");
      const startDateTime = parseDateTime(selectedDate, customStartTime);
      const endDateTime = parseDateTime(selectedDate, customEndTime);

      console.log("Parsed dates:", { startDateTime, endDateTime });

      if (!startDateTime || !endDateTime) {
        setError("Invalid date/time format");
        return;
      }

      // Convert reminders to Date objects if they exist
      const formattedReminders = appointmentDetails.reminders.map(reminder =>
        reminder instanceof Date ? reminder : new Date(reminder)
      );

      const newAppointment = {
        name: appointmentDetails.name,
        location: appointmentDetails.location,
        startTime: toLocalISOString(startDateTime),
        endTime: toLocalISOString(endDateTime),
        reminders: formattedReminders,
        invitedUsers: appointmentDetails.invitedUsers || "",
        is_group_meeting: appointmentDetails.is_group_meeting || false
      };

      console.log("New appointment object:", newAppointment);
      console.log("User ID:", user_id);

      // Use the store's addAppointment function
      console.log("Calling addAppointment...");
      await addAppointment(newAppointment, user_id);
      console.log("Appointment added successfully");

      // Force a refresh of appointments
      console.log("Fetching updated appointments...");
      await fetchAppointments(user_id);
      console.log("Appointments refreshed");

      showSuccess("Appointment created successfully!");
      reset();
      if (onSelect) {
        console.log("Calling onSelect callback");
        onSelect(newAppointment);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError(error.message || "Failed to create appointment");
    }
  }, [selectedDate, customStartTime, customEndTime, appointmentDetails, user_id, addAppointment, fetchAppointments, onSelect, reset, showSuccess]);

  // Sửa hàm handleReplaceAppointment để đảm bảo cập nhật UI
  const handleReplaceAppointment = useCallback(async () => {
    const { conflictAppointment, newAppointment } = conflictResolution;
    console.log("Replacing appointment:", {
      conflictAppointment,
      newAppointment
    });

    try {
      // Đặt appointment đang được thay thế
      setAppointmentBeingReplaced(conflictAppointment);
      await deleteAppointment(conflictAppointment.id, user_id);
      // Nếu chưa có thông tin chi tiết, chuyển sang bước nhập chi tiết
      if (!newAppointment.name || newAppointment.name === "New Appointment") {
        setStep('details');
        setConflictResolution(prev => ({ ...prev, show: false }));
        return;
      }

      // Chuẩn bị dữ liệu cho appointment mới
      const updatedAppointment = {
        id: conflictAppointment.id, // Thêm ID của appointment cần update
        name: newAppointment.name,
        location: newAppointment.location || "",
        startTime: newAppointment.startTime,
        endTime: newAppointment.endTime,
        reminders: newAppointment.reminders || [],
        invitedUsers: newAppointment.invitedUsers || "",
        is_group_meeting: newAppointment.is_group_meeting || false
      };

      console.log("Updating appointment with data:", updatedAppointment);

      // Gọi hàm update từ store
      await updateAppointment(updatedAppointment, user_id);
      console.log("Appointment updated successfully");

      // Refresh danh sách appointments
      await fetchAppointments(user_id);
      console.log("Appointments refreshed");

      if (onSelect) onSelect(updatedAppointment);
      showSuccess("Appointment replaced successfully!"); a
      reset();
    } catch (error) {
      console.error("Error replacing appointment:", error);
      setError(error.message || "Failed to replace appointment");
    }
  }, [conflictResolution, onSelect, showSuccess, reset, updateAppointment, user_id, fetchAppointments]);

  // Sửa hàm handleJoinGroupMeeting để đảm bảo cập nhật UI
  const handleJoinGroupMeeting = useCallback(async () => {
    const { conflictAppointment, newAppointment } = conflictResolution;

    if (!newAppointment.name || newAppointment.name === "New Appointment") {
      setStep('details');
      setConflictResolution(prev => ({ ...prev, show: false }));
      return;
    }

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

    await updateAppointment(updatedAppointments, user_id);
    await fetchAppointments(user_id);
    if (onSelect) onSelect(conflictAppointment);
    showSuccess("You've joined the group meeting!");
    reset();
  }, [conflictResolution, appointments, onSelect, showSuccess, reset, updateAppointment, user_id, fetchAppointments]);

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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {step === 'date' && <DateTimeModal />}
      {step === 'details' && (
        <CalendarTitleModal
          selectedDate={selectedDate}
          selectedStartTime={customStartTime}
          selectedEndTime={customEndTime}
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

      {successMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-md shadow-md">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;