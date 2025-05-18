import React from 'react';
import { format } from 'date-fns';

const ConflictResolutionModal = ({
  conflictAppointment,
  onReplace,
  onKeepExisting,
  onSelectDifferentTime,
  onJoinGroupMeeting,
  onClose
}) => {
  // Convert time strings to Date objects if needed
  const startTime = conflictAppointment.startTime instanceof Date
    ? conflictAppointment.startTime
    : new Date(conflictAppointment.startTime);

  const endTime = conflictAppointment.endTime instanceof Date
    ? conflictAppointment.endTime
    : new Date(conflictAppointment.endTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Schedule Conflict</h3>

          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="font-medium text-gray-800">{conflictAppointment.name}</p>
            <p className="text-sm text-gray-600 mt-1">
              {format(startTime, 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </p>
            <p className="text-sm text-gray-600">{conflictAppointment.location}</p>
            {onJoinGroupMeeting != null && (
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Group Meeting
              </span>
            )}
          </div>

          {onJoinGroupMeeting != null && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                This is a group meeting. Would you like to join instead of creating a new one?
              </p>
              <button
                onClick={onJoinGroupMeeting}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm mb-2"
              >
                Join Group Meeting
              </button>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={onReplace}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              Replace Existing Appointment
            </button>
            <button
              onClick={onKeepExisting}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Keep Existing Appointment
            </button>
            <button
              onClick={onSelectDifferentTime}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              Select Different Time
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;