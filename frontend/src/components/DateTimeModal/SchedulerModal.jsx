import React from 'react';
import DatePicker from './DatePicker';
import TimeSlotSelector from './TimeSlotSelector';


const SchedulerModal = ({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  defaultTimeSlots,
  availableEndTimes,
  onDateSelect,
  onStartTimeSelect,
  onEndTimeSelect,
  onConfirm,
  onClose,
  error,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Date</h3>
            <DatePicker selected={selectedDate} onChange={onDateSelect} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Time</h3>
            <TimeSlotSelector
              timeSlots={defaultTimeSlots}
              selectedTime={selectedStartTime}
              onSelect={onStartTimeSelect}
              label="Start Time"
            />
            {selectedStartTime && (
              <div className="mt-4">
                <TimeSlotSelector
                  timeSlots={availableEndTimes(selectedStartTime)}
                  selectedTime={selectedEndTime}
                  onSelect={onEndTimeSelect}
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
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!selectedDate || !selectedStartTime || !selectedEndTime}
              className={`px-4 py-2 rounded-md text-sm
                ${
                  !selectedDate || !selectedStartTime || !selectedEndTime
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

export default SchedulerModal;