import { axiosPrivate } from "./axios";

export const deleteAppointmentsApi = async (appointmentId) => {
    const response = await axiosPrivate.post(`/appointments/${appointmentId}/delete`);
    return response.data;
}

