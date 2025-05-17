import { useState } from 'react';

export default function WeekCalendar() {
  // Sample data for the calendar event
  const [event, setEvent] = useState({
    title: 'Đi dự hội thảo AI',
    startTime: '8:30',
    endTime: '10:30AM',
    day: 17,
    color: 'bg-blue-500'
  });

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const days = [
    { abbr: 'CN', number: 11 },
    { abbr: 'TH 2', number: 12 },
    { abbr: 'TH 3', number: 13 },
    { abbr: 'TH 4', number: 14 },
    { abbr: 'TH 5', number: 15 },
    { abbr: 'TH 6', number: 16 },
    { abbr: 'TH 7', number: 17 }
  ];
  
  const hours = [
    '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', 
    '9 AM', '10 AM', '11 AM', '12 PM'
  ];
  
  const shouldDisplayEvent = (hour, day) => {
    if (day === event.day) {
      const hourNum = parseInt(hour.split(' ')[0]);
      const isPM = hour.includes('PM');
      
      if (hourNum === 9 && !isPM) {
        return true;
      }
    }
    return false;
  };
  
  const handleSlotClick = (hour, day) => {
    if (shouldDisplayEvent(hour, day)) return;
    setSelectedSlot({ hour, day });
    // Show the modal
    setShowModal(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
  };
  
  const EventCard = () => (
    <div className="absolute bg-emerald-800 text-white p-2 rounded-md shadow-md z-10 w-full h-24">
      <p className="font-medium">{event.title}</p>
      <p className="text-sm">{event.startTime} - {event.endTime}</p>
    </div>
  );
  
  /* bo cai modal do day ne*/ 
  const AppointmentModal = () => {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Thêm Cuộc Hẹn</h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700">
              Thêm cuộc hẹn cho ngày {selectedSlot?.day} vào lúc {selectedSlot?.hour}
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Tiêu đề</label>
            <input type="text" className="w-full p-2 border rounded" />
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={closeModal}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400"
            >
              Hủy
            </button>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-8 gap-0 border-1 border-gray-200">
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
      
      <div className="grid grid-cols-8 gap-0">
        {hours.map((hour, hourIdx) => (
          <>
            <div key={`hour-${hourIdx}`} className="p-4 text-right text-sm text-gray-500 border-b border-gray-200">
              {hour}
            </div>
            {days.map((day, dayIdx) => {
              const isSelected = selectedSlot && selectedSlot.hour === hour && selectedSlot.day === day.number;
              return (
                <div 
                  key={`slot-${hourIdx}-${dayIdx}`} 
                  className={`border-l border-b border-gray-200 p-2 relative min-h-16 cursor-pointer transition-colors
                   `}
                  onClick={() => handleSlotClick(hour, day.number)}
                >
                  {shouldDisplayEvent(hour, day.number) && <EventCard />}
                </div>
              );
            })}
          </>
        ))}
      </div>      
      <AppointmentModal />
    </div>
  );
}