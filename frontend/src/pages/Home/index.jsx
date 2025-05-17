import React from 'react';
import DateTimePicker from '../../components/CalendarTime';

const Home = () => {
  const handleSelect = (selection) => {
    console.log('Đã chọn:', selection);
  };

  return (
    <div className="max-w-3xl mx-auto p-5 font-sans">
      <h1 className="text-gray-800 border-b border-gray-200 pb-2.5">Trang chủ</h1>
      
      <div className="mt-8 p-5 bg-gray-50 rounded-lg shadow-sm">
        <h2 className="text-green-500 text-xl font-semibold mt-0">Đặt lịch hẹn</h2>
        <p className="text-gray-600 mb-5">Vui lòng chọn thời gian phù hợp để đặt lịch hẹn của bạn</p>
        
        <DateTimePicker 
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
};

export default Home;