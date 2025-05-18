import { axiosPrivate } from "./axios";

export const joinGroupMeetingApi = async (appointmentId, userId) => {
    const response = await axiosPrivate.post(`/group-meetings/join`, {
        appointmentId: appointmentId,
        userId: userId
    });
    return response.data;
}