import React, { useState, useCallback, useRef, useEffect } from 'react';
import { format, isToday, isSameDay, isBefore, isEqual } from 'date-fns';
import ConflictResolutionModal from '../ConflictResolutionModal';
import CalendarTitleModal from '../CalendarTitleModal';

const DateTimePicker = ({ open, onClose, onSelect, preselectedDate, preselectedStartTime, events = [] }) => {   
  const [selectedDate, setSelectedDate] = useState(null);
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [step, setStep] = useState(open ? 'date' : null);
  const [error, setError] = useState("");
  // Thay đổi khởi tạo appointments để sử dụng events từ props thay vì mockAppointments
  const [appointments, setAppointments] = useState([]);
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
  // Thêm biến để theo dõi cuộc hẹn đang bị thay thế
  const [appointmentBeingReplaced, setAppointmentBeingReplaced] = useState(null);
  const isConfirming = useRef(false);

  // Cập nhật appointments từ events props mỗi khi events thay đổi
  useEffect(() => {
    console.log("Events received in DateTimePicker:", events);
    if (events && events.length > 0) {
      setAppointments(events);
    }
  }, [events]);
  
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
      invitedUsers: ""
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

  // Xử lý các thay đổi đầu vào thời gian tùy chỉnh
  const handleCustomStartTimeChange = (e) => {
    setCustomStartTime(e.target.value);
  };

  const handleCustomEndTimeChange = (e) => {
    setCustomEndTime(e.target.value);
  };

  // Xác thực định dạng thời gian
  const isValidTimeFormat = (timeStr) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s+(am|pm)$/i;
    return timeRegex.test(timeStr);
  };

  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    
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

  // Sửa đổi hàm hasConflict để bỏ qua sự kiện đang được thay thế
  const hasConflict = (startTime, endTime) => {
    console.log("Checking conflicts for time:", startTime, "to", endTime);
    console.log("Current appointments:", appointments);
    console.log("Currently replacing appointment:", appointmentBeingReplaced);
    
    const conflict = appointments.find(appointment => {
      // Nếu đây là sự kiện đang được thay thế, bỏ qua kiểm tra xung đột
      if (appointmentBeingReplaced && appointment.id === appointmentBeingReplaced.id) {
        console.log("Skipping conflict check for appointment being replaced:", appointment.id);
        return false;
      }
      
      // Kiểm tra nếu appointment.start_time và appointment.end_time không phải là đối tượng Date
      if (!(appointment.start_time instanceof Date) || !(appointment.end_time instanceof Date)) {
        console.warn("Found invalid appointment dates:", appointment);
        return false;
      }
      
      const hasOverlap = (
        (startTime >= appointment.start_time && startTime < appointment.end_time) ||
        (endTime > appointment.start_time && endTime <= appointment.end_time) ||
        (startTime <= appointment.start_time && endTime >= appointment.end_time)
      );
      
      if (hasOverlap) {
        console.log("Found conflict with appointment:", appointment);
      }
      
      return hasOverlap;
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

    // Kiểm tra định dạng thời gian
    if (!isValidTimeFormat(customStartTime)) {
      setError("Invalid start time format. Use format: HH:MM am/pm");
      return;
    }

    if (!isValidTimeFormat(customEndTime)) {
      setError("Invalid end time format. Use format: HH:MM am/pm");
      return;
    }

    const startDateTime = parseDateTime(selectedDate, customStartTime);
    const endDateTime = parseDateTime(selectedDate, customEndTime);

    if (!startDateTime || !endDateTime) {
      setError("Invalid date or time format");
      return;
    }

    if (startDateTime >= endDateTime) {
      setError("End time must be after start time");
      return;
    }

    // Kiểm tra xung đột lịch ngay sau khi xác thực thời gian
    const conflictAppointment = hasConflict(startDateTime, endDateTime);
    
    if (conflictAppointment) {
      console.log("Conflict detected! Opening ConflictResolutionModal...");
      // Tạo một đối tượng cuộc hẹn tạm thời để sử dụng trong hộp thoại xung đột
      const tempAppointment = {
        id: Date.now(), // Sử dụng timestamp để đảm bảo ID là duy nhất
        name: "New Appointment", // Tên tạm thời
        location: "Office",
        start_time: startDateTime,
        end_time: endDateTime,
        user_id: 1,
        is_group_meeting: false,
        reminders: [],
        invited_users: []
      };
      
      setConflictResolution({
        show: true,
        conflictAppointment,
        newAppointment: tempAppointment,
        isSameGroup: false // Sẽ cập nhật giá trị này sau khi biết chi tiết cuộc hẹn
      });
      return;
    }

    // Nếu không có xung đột, tiếp tục nhập chi tiết cuộc hẹn
    setStep('details');
  }, [selectedDate, customStartTime, customEndTime, appointments, appointmentBeingReplaced]);

  // Sửa hàm handleDetailsConfirm để xem xét appointmentBeingReplaced
  const handleDetailsConfirm = useCallback(() => {
    if (isConfirming.current) return;
    isConfirming.current = true;

    if (!appointmentDetails.name.trim()) {
      setError("Please enter a meeting name");
      isConfirming.current = false;
      return;
    }

    const startDateTime = parseDateTime(selectedDate, customStartTime);
    const endDateTime = parseDateTime(selectedDate, customEndTime);

    const newAppointment = {
      id: appointmentBeingReplaced ? appointmentBeingReplaced.id : Date.now(),
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

    // Kiểm tra lại xung đột (phòng trường hợp có lịch mới được thêm vào trong thời gian người dùng điền form)
    // Nếu đang thay thế một cuộc hẹn, bỏ qua kiểm tra xung đột cho cuộc hẹn đó
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
    
    // Nếu đang thay thế một cuộc hẹn, loại bỏ cuộc hẹn cũ trước khi thêm cuộc hẹn mới
    if (appointmentBeingReplaced) {
      setAppointments(prev => 
        [...prev.filter(app => app.id !== appointmentBeingReplaced.id), newAppointment]
      );
      console.log(`Replaced appointment ${appointmentBeingReplaced.id} with ${newAppointment.id}`);
    } else {
      setAppointments(prev => [...prev, newAppointment]);
    }
    
    if (onSelect) onSelect(newAppointment);
    showSuccess(appointmentBeingReplaced ? 
      "Appointment replaced successfully!" : 
      "Appointment scheduled successfully!"
    );
    reset();
    isConfirming.current = false;
  }, [appointmentDetails, selectedDate, customStartTime, customEndTime, appointments, appointmentBeingReplaced, onSelect, reset, showSuccess]);

  // Sửa đổi hàm handleReplaceAppointment để đặt appointmentBeingReplaced
  const handleReplaceAppointment = useCallback(() => {
    const { conflictAppointment, newAppointment } = conflictResolution;
    
    // Đặt cuộc hẹn đang được thay thế
    setAppointmentBeingReplaced(conflictAppointment);
    console.log("Setting appointment being replaced:", conflictAppointment);
    
    // Kiểm tra xem newAppointment đã có đầy đủ thông tin chưa
    if (!newAppointment.name || newAppointment.name === "New Appointment") {
      // Nếu chưa có thông tin chi tiết, chuyển sang bước nhập chi tiết
      setStep('details');
      setConflictResolution(prev => ({ ...prev, show: false }));
    } else {
      // Nếu đã có thông tin đầy đủ, tiến hành thay thế cuộc hẹn
      setAppointments(prev => 
        [...prev.filter(app => app.id !== conflictAppointment.id), 
        {...newAppointment, id: conflictAppointment.id}]
      );
      if (onSelect) onSelect(newAppointment);
      showSuccess("Appointment replaced successfully!");
      reset(); // Reset sẽ xóa appointmentBeingReplaced
    }
  }, [conflictResolution, onSelect, showSuccess, reset]);

  const handleJoinGroupMeeting = useCallback(() => {
    const { conflictAppointment, newAppointment } = conflictResolution;
    
    // Nếu chưa nhập chi tiết cuộc hẹn, chuyển đến bước nhập chi tiết trước
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
    // Sử dụng preselectedDate làm giá trị mặc định cho currentDate nếu có sẵn
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

  // Thành phần TimeInput được đơn giản hóa chỉ với đầu vào văn bản
  const TimeInput = ({ value, onChange, label }) => (
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
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Enter Time</h3>
              
              {/* Nhập thời gian*/}
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
  };

  // Hiển thị debug thông tin về appointmentBeingReplaced
  useEffect(() => {
    if (appointmentBeingReplaced) {
      console.log("Currently replacing appointment:", appointmentBeingReplaced);
    }
  }, [appointmentBeingReplaced]);

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