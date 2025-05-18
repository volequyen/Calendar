import { axiosPrivate } from "./axios"
import { toLocalISOString } from "../ultils/changeTime";

export const addNewAppointmentsApi = async (appointment, user_id) => {
    console.log("Sending appointment data:", appointment);
    try {
        if (appointment.invitedUsers) {
            const response = await axiosPrivate.post('/appointments', {
                name: appointment.name,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                location: appointment.location || "",
                userId: user_id,
                isGroupMeeting: true,
                reminders: appointment.reminders.map(reminder => ({
                    reminderTime: reminder instanceof Date ? toLocalISOString(reminder) : reminder
                })),
                participants: appointment.invitedUsers || ""
            });
            console.log("API response:", response.data);
            return response.data;
        }
        else {
            const response = await axiosPrivate.post('/appointments', {
                name: appointment.name,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                location: appointment.location || "",
                userId: user_id,
                isGroupMeeting: false,
                reminders: appointment.reminders.map(reminder => ({
                    reminderTime: reminder instanceof Date ? toLocalISOString(reminder) : reminder
                })),
            });
            console.log("API response:", response.data);
            return response.data;
        }


    } catch (error) {
        console.error("Error adding appointment:", error);
        throw error;
    }
}
