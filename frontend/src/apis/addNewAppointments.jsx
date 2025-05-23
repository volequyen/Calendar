import { axiosPrivate } from "./axios"
import { toLocalISOString } from "../ultils/changeTime";

export const addNewAppointmentsApi = async (appointment, user_id) => {
    const participants = appointment.invitedUsers.split(",");
    const participantsId = participants.map(participant => {
        return {
            id: participant
        }
    });
    try {
        if (appointment.invitedUsers) {
            const dataSend = {
                name: appointment.name,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                location: appointment.location || "",
                userId: user_id,
                isGroupMeeting: true,
                reminders: appointment.reminders.map(reminder => ({
                    reminderTime: reminder instanceof Date ? toLocalISOString(reminder) : reminder
                })),
                participants: participantsId
            }
            console.log("Data send:", dataSend);
            const response = await axiosPrivate.post('/appointments', dataSend);
            // console.log("API response:", response.data);
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
